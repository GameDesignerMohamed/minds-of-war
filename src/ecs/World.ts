/**
 * ECS World — central registry of entities, components, and systems.
 *
 * The World owns all runtime ECS state and is the single point of contact for
 * gameplay code. It delegates ID management to {@link EntityManager} and
 * exposes typed component CRUD plus a query API that upgrades to archetype
 * indexing when the world grows beyond the documented profiling threshold.
 *
 * Query performance note:
 * Queries start on the simpler per-type Map scan path. Once live entities
 * exceed {@link ARCHETYPE_QUERY_TRIGGER_ENTITY_COUNT}, the World builds and
 * maintains an archetype index, then routes subsequent queries through it for
 * the rest of the World's lifetime. This keeps the small-world path cheap while
 * providing the next-scale ECS upgrade once profiling shows the extra
 * bookkeeping is justified.
 */

import { EntityManager, NULL_ENTITY } from './Entity';
import { Component, ComponentType } from './Component';
import { System } from './System';
import type { EntityId } from '../types';

export const ARCHETYPE_QUERY_TRIGGER_ENTITY_COUNT = 500;

type QueryStrategy = 'scan' | 'archetype';

interface ArchetypeBucket {
  readonly key: string;
  readonly componentTypes: Set<string>;
  readonly entities: Set<EntityId>;
}

// ---------------------------------------------------------------------------
// World
// ---------------------------------------------------------------------------

/**
 * Central ECS world: creates entities, manages components, and ticks systems.
 *
 * @example
 * const world = new World();
 * const entity = world.createEntity();
 * world.addComponent(entity, PositionType, { type: 'Position', x: 0, z: 0 });
 * world.registerSystem(new MovementSystem());
 * // In game loop:
 * world.update(deltaTime);
 */
export class World {
  private readonly _entities: EntityManager = new EntityManager();

  /**
   * Component storage: outer key is the component type string, inner key is
   * the EntityId. Components are stored as `unknown` and cast on retrieval via
   * the typed accessors, keeping the Map heterogeneous but access type-safe.
   */
  private readonly _components: Map<string, Map<EntityId, Component>> = new Map();

  /** Ordered list of registered systems. Tick order equals registration order. */
  private readonly _systems: System[] = [];

  /** Archetype indexing is activated only after the documented entity-count trigger. */
  private _archetypeIndexActive: boolean = false;

  /** Entity → component-type membership snapshot used once archetype indexing is active. */
  private readonly _entityComponentTypes: Map<EntityId, Set<string>> = new Map();

  /** Signature → entities that share the exact same component-type set. */
  private readonly _archetypes: Map<string, ArchetypeBucket> = new Map();

  // -------------------------------------------------------------------------
  // Entity API
  // -------------------------------------------------------------------------

  /**
   * Creates and returns a new live entity ID.
   *
   * @returns A unique {@link EntityId} for the new entity.
   */
  createEntity(): EntityId {
    return this._entities.create();
  }

  /**
   * Destroys an entity and removes all of its components.
   *
   * After this call the ID may be reused by future {@link createEntity} calls.
   *
   * @param entity - The entity to destroy. No-op for {@link NULL_ENTITY}.
   */
  destroyEntity(entity: EntityId): void {
    if (entity === NULL_ENTITY) {
      return;
    }
    if (this._archetypeIndexActive) {
      this.removeEntityFromArchetype(entity, this._entityComponentTypes.get(entity));
      this._entityComponentTypes.delete(entity);
    }
    // Remove the entity's component entries from every type map.
    for (const typeMap of this._components.values()) {
      typeMap.delete(entity);
    }
    this._entities.destroy(entity);
  }

  /** Returns the count of currently live entities. */
  get entityCount(): number {
    return this._entities.liveCount;
  }

  /**
   * Active ECS query strategy.
   *
   * Exposed mainly for profiling and tests so the archetype trigger stays
   * observable without leaking the internal index structure.
   */
  get queryStrategy(): QueryStrategy {
    return this._archetypeIndexActive ? 'archetype' : 'scan';
  }

  // -------------------------------------------------------------------------
  // Component API
  // -------------------------------------------------------------------------

  /**
   * Attaches a component to an entity, replacing any existing component of the
   * same type.
   *
   * @param entity    - Target entity.
   * @param typeToken - Branded type token produced by {@link componentType}.
   * @param data      - The component data object to attach.
   */
  addComponent<T extends Component>(
    entity: EntityId,
    typeToken: ComponentType<T>,
    data: Omit<T, 'type'> | T,
  ): void {
    let typeMap = this._components.get(typeToken);
    if (typeMap === undefined) {
      typeMap = new Map<EntityId, Component>();
      this._components.set(typeToken, typeMap);
    }
    // Auto-inject the `type` discriminant from the token if not already present
    const component = (
      'type' in data ? data : { ...data, type: typeToken as unknown as string }
    ) as T;
    typeMap.set(entity, component);

    if (this._archetypeIndexActive) {
      this.recordComponentAdded(entity, typeToken as unknown as string);
      return;
    }

    this.ensureArchetypeIndexIsReady();
  }

  /**
   * Retrieves a component from an entity, or `undefined` if not present.
   *
   * @param entity    - The entity to query.
   * @param typeToken - Branded type token for the desired component type.
   * @returns The component data, or `undefined`.
   */
  getComponent<T extends Component>(entity: EntityId, typeToken: ComponentType<T>): T | undefined {
    const typeMap = this._components.get(typeToken);
    if (typeMap === undefined) {
      return undefined;
    }
    return typeMap.get(entity) as T | undefined;
  }

  /**
   * Returns `true` if the entity currently has the specified component type.
   *
   * @param entity    - The entity to test.
   * @param typeToken - Branded type token for the component type to check.
   */
  hasComponent<T extends Component>(entity: EntityId, typeToken: ComponentType<T>): boolean {
    return this._components.get(typeToken)?.has(entity) ?? false;
  }

  /**
   * Removes a component from an entity.
   *
   * No-op if the entity does not have the component.
   *
   * @param entity    - The entity to modify.
   * @param typeToken - Branded type token for the component type to remove.
   */
  removeComponent<T extends Component>(entity: EntityId, typeToken: ComponentType<T>): void {
    const typeMap = this._components.get(typeToken);
    if (typeMap === undefined || !typeMap.has(entity)) {
      return;
    }

    typeMap.delete(entity);

    if (this._archetypeIndexActive) {
      this.recordComponentRemoved(entity, typeToken as unknown as string);
    }
  }

  // -------------------------------------------------------------------------
  // Query API
  // -------------------------------------------------------------------------

  /**
   * Yields all `[EntityId, T]` pairs for entities that carry every specified
   * component type.
   *
   * The first type token is the primary iterator; additional tokens act as
   * filters. Only entities that possess all listed types are yielded.
   *
   * Performance:
   * - Before the archetype trigger: O(N) where N is the number of entities
   *   carrying the primary component type.
   * - After the archetype trigger: iterates only archetypes that contain every
   *   required component type, then yields entities from those buckets.
   *
   * @param primary    - The component type to iterate over.
   * @param additional - Zero or more additional required component types.
   *
   * @example
   * for (const [entity, pos] of world.query(PositionType, VelocityType)) {
   *   // entity has both Position and Velocity
   * }
   */
  *query<T extends Component>(
    primary: ComponentType<T>,
    ...additional: ComponentType<Component>[]
  ): IterableIterator<[EntityId, T]> {
    const primaryMap = this._components.get(primary);
    if (primaryMap === undefined) {
      return;
    }

    this.ensureArchetypeIndexIsReady();

    if (!this._archetypeIndexActive) {
      yield* this.scanQuery<T>(primaryMap, additional);
      return;
    }

    yield* this.queryArchetypes<T>(
      primaryMap,
      primary as unknown as string,
      additional.map((typeToken) => typeToken as unknown as string),
    );
  }

  // -------------------------------------------------------------------------
  // System API
  // -------------------------------------------------------------------------

  /**
   * Registers a system with this world and calls its {@link System.init} hook.
   *
   * Systems are ticked in registration order. A system may only be registered
   * once; attempting to register the same instance twice is a no-op.
   *
   * @param system - The system instance to register.
   */
  registerSystem(system: System): void {
    if (this._systems.includes(system)) {
      return;
    }
    this._systems.push(system);
    system.init(this);
  }

  /**
   * Removes a system and calls its {@link System.destroy} hook.
   *
   * @param system - The system instance to unregister.
   */
  unregisterSystem(system: System): void {
    const index = this._systems.indexOf(system);
    if (index === -1) {
      return;
    }
    this._systems.splice(index, 1);
    system.destroy();
  }

  /**
   * Ticks all enabled, registered systems in registration order.
   *
   * This is the main per-frame entry point called by {@link GameLoop}.
   *
   * @param deltaTime - Elapsed seconds since the previous tick.
   */
  update(deltaTime: number): void {
    for (const system of this._systems) {
      if (system.enabled) {
        system.update(deltaTime);
      }
    }
  }

  // -------------------------------------------------------------------------
  // World Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Tears down all systems and clears all entity and component state.
   *
   * Calls {@link System.destroy} on every registered system in reverse
   * registration order, then resets entity and component storage. Safe to call
   * multiple times.
   */
  destroy(): void {
    for (let i = this._systems.length - 1; i >= 0; i--) {
      this._systems[i].destroy();
    }
    this._systems.length = 0;
    this._components.clear();
    this._archetypes.clear();
    this._entityComponentTypes.clear();
    this._archetypeIndexActive = false;
    this._entities.reset();
  }

  private ensureArchetypeIndexIsReady(): void {
    if (this._archetypeIndexActive || this.entityCount <= ARCHETYPE_QUERY_TRIGGER_ENTITY_COUNT) {
      return;
    }

    this.rebuildArchetypeIndex();
    this._archetypeIndexActive = true;
  }

  private rebuildArchetypeIndex(): void {
    this._archetypes.clear();
    this._entityComponentTypes.clear();

    for (const [componentType, typeMap] of this._components) {
      for (const entity of typeMap.keys()) {
        let componentTypes = this._entityComponentTypes.get(entity);
        if (componentTypes === undefined) {
          componentTypes = new Set<string>();
          this._entityComponentTypes.set(entity, componentTypes);
        }
        componentTypes.add(componentType);
      }
    }

    for (const [entity, componentTypes] of this._entityComponentTypes) {
      this.addEntityToArchetype(entity, componentTypes);
    }
  }

  private recordComponentAdded(entity: EntityId, componentType: string): void {
    const previousTypes = this._entityComponentTypes.get(entity);
    if (previousTypes?.has(componentType)) {
      return;
    }

    const nextTypes = new Set(previousTypes ?? []);
    nextTypes.add(componentType);
    this.moveEntityBetweenArchetypes(entity, previousTypes, nextTypes);
  }

  private recordComponentRemoved(entity: EntityId, componentType: string): void {
    const previousTypes = this._entityComponentTypes.get(entity);
    if (previousTypes === undefined || !previousTypes.has(componentType)) {
      return;
    }

    const nextTypes = new Set(previousTypes);
    nextTypes.delete(componentType);
    this.moveEntityBetweenArchetypes(entity, previousTypes, nextTypes);
  }

  private moveEntityBetweenArchetypes(
    entity: EntityId,
    previousTypes: ReadonlySet<string> | undefined,
    nextTypes: ReadonlySet<string>,
  ): void {
    this.removeEntityFromArchetype(entity, previousTypes);

    if (nextTypes.size === 0) {
      this._entityComponentTypes.delete(entity);
      return;
    }

    this._entityComponentTypes.set(entity, new Set(nextTypes));
    this.addEntityToArchetype(entity, nextTypes);
  }

  private addEntityToArchetype(entity: EntityId, componentTypes: ReadonlySet<string>): void {
    const key = this.getArchetypeKey(componentTypes);
    if (key === undefined) {
      return;
    }

    let bucket = this._archetypes.get(key);
    if (bucket === undefined) {
      bucket = {
        key,
        componentTypes: new Set(componentTypes),
        entities: new Set<EntityId>(),
      };
      this._archetypes.set(key, bucket);
    }

    bucket.entities.add(entity);
  }

  private removeEntityFromArchetype(
    entity: EntityId,
    componentTypes: ReadonlySet<string> | undefined,
  ): void {
    const key = this.getArchetypeKey(componentTypes);
    if (key === undefined) {
      return;
    }

    const bucket = this._archetypes.get(key);
    if (bucket === undefined) {
      return;
    }

    bucket.entities.delete(entity);
    if (bucket.entities.size === 0) {
      this._archetypes.delete(key);
    }
  }

  private getArchetypeKey(componentTypes: ReadonlySet<string> | undefined): string | undefined {
    if (componentTypes === undefined || componentTypes.size === 0) {
      return undefined;
    }

    return [...componentTypes].sort().join('|');
  }

  private *scanQuery<T extends Component>(
    primaryMap: Map<EntityId, Component>,
    additional: ComponentType<Component>[],
  ): IterableIterator<[EntityId, T]> {
    for (const [entity, component] of primaryMap) {
      let hasAll = true;
      for (const extra of additional) {
        if (!(this._components.get(extra)?.has(entity) ?? false)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        yield [entity, component as T];
      }
    }
  }

  private *queryArchetypes<T extends Component>(
    primaryMap: Map<EntityId, Component>,
    primary: string,
    additional: string[],
  ): IterableIterator<[EntityId, T]> {
    const required = new Set<string>([primary, ...additional]);

    for (const bucket of this._archetypes.values()) {
      if (!this.bucketMatchesQuery(bucket, required)) {
        continue;
      }

      for (const entity of bucket.entities) {
        const component = primaryMap.get(entity);
        if (component !== undefined) {
          yield [entity, component as T];
        }
      }
    }
  }

  private bucketMatchesQuery(bucket: ArchetypeBucket, required: ReadonlySet<string>): boolean {
    for (const componentType of required) {
      if (!bucket.componentTypes.has(componentType)) {
        return false;
      }
    }

    return true;
  }
}
