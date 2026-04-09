/**
 * SelectionManager — multi-entity selection logic for the RTS layer.
 *
 * Owns the set of currently selected entities and keeps the ECS
 * {@link SelectableComponent} flags and Three.js selection ring visibility in
 * sync. It does NOT own game state; it writes only to component data fields
 * that are considered "UI state" by convention.
 *
 * Responsibilities:
 * - Single-click selection (replaces current selection).
 * - Drag-box (marquee) multi-selection filtered to the local player's units.
 * - Shift-click additive / subtractive selection.
 * - Exposing the current selection set to other UI systems.
 *
 * What this class does NOT do:
 * - It does not read raw mouse events — that is {@link InputManager}'s job.
 * - It does not issue move/attack commands — that is {@link CommandDispatcher}'s job.
 * - It does not render the selection rectangle — that is {@link SelectionRect}'s job.
 *
 * ------------------------------------------------------------------
 * NOTE FOR GAMEPLAY-PROGRAMMER:
 * This file expects two component types that must be added to
 * src/ecs/components/GameComponents.ts before this compiles:
 *
 *   export interface SelectableComponent extends Component {
 *     readonly type: 'Selectable';
 *     selected: boolean;
 *   }
 *   export const SelectableType = componentType<SelectableComponent>('Selectable');
 *
 *   export interface SelectionRingComponent extends Component {
 *     readonly type: 'SelectionRing';
 *     mesh: THREE.Mesh;        // The Three.js ring mesh
 *   }
 *   export const SelectionRingType = componentType<SelectionRingComponent>('SelectionRing');
 *
 * The SelectionRingComponent separates the Three.js mesh reference from
 * RenderableComponent (which only holds a sceneKey string) per the actual
 * implementation in GameComponents.ts.
 * ------------------------------------------------------------------
 *
 * @example
 * const selection = new SelectionManager(world, entityAtPosition, 'human');
 *
 * // Single click — called by input handler:
 * selection.selectAt({ x: 120, z: 80 }, false);
 *
 * // Drag box — called after drag completes:
 * selection.selectInBox({ x: 50, z: 30 }, { x: 200, z: 180 }, false);
 *
 * // Read current selection:
 * for (const id of selection.selected) { ... }
 */

import { World } from '@/ecs/World';
import type { EntityId, PlayerId, Position } from '@/types';
import { PositionType, OwnerType } from '@/ecs/components/GameComponents';
import type { PositionComponent, OwnerComponent } from '@/ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// Forward declarations for components not yet in GameComponents.ts
// (see NOTE above)
// ---------------------------------------------------------------------------

import { componentType } from '@/ecs/Component';
import type { Component } from '@/ecs/Component';
import type * as THREE from 'three';

/** Selection state flag. Must be added to GameComponents.ts. */
export interface SelectableComponent extends Component {
  readonly type: 'Selectable';
  /** True while the entity is part of the active selection set. */
  selected: boolean;
}
/** @see SelectableComponent */
export const SelectableType = componentType<SelectableComponent>('Selectable');

/**
 * Holds the Three.js selection ring mesh for direct visibility toggling.
 * Must be added to GameComponents.ts.
 */
export interface SelectionRingComponent extends Component {
  readonly type: 'SelectionRing';
  /** The Three.js Mesh used as the selection indicator. */
  mesh: THREE.Mesh;
}
/** @see SelectionRingComponent */
export const SelectionRingType = componentType<SelectionRingComponent>('SelectionRing');

// ---------------------------------------------------------------------------
// SelectionManager
// ---------------------------------------------------------------------------

/**
 * Manages the player's currently selected entity set.
 *
 * **Single-thread only.** All methods are synchronous and must be called from
 * the main thread.
 */
export class SelectionManager {
  private readonly _world: World;
  private readonly _entityAtPosition: (pos: Position) => EntityId | null;
  private readonly _localPlayer: PlayerId;

  /** Mutable set of currently selected entity IDs. */
  private readonly _selected: Set<EntityId> = new Set();

  /**
   * @param world             - The ECS world containing all entities.
   * @param entityAtPosition  - Callback that resolves a canvas-space click
   *                            coordinate to an EntityId, or null when no
   *                            entity occupies that position. Injected to
   *                            avoid coupling to any specific spatial query
   *                            implementation.
   * @param localPlayer       - The PlayerId of the human player. Used to
   *                            restrict marquee selection to friendly units.
   */
  constructor(
    world: World,
    entityAtPosition: (pos: Position) => EntityId | null,
    localPlayer: PlayerId,
  ) {
    this._world = world;
    this._entityAtPosition = entityAtPosition;
    this._localPlayer = localPlayer;
  }

  // -------------------------------------------------------------------------
  // Read API
  // -------------------------------------------------------------------------

  /**
   * The currently selected entity IDs.
   *
   * Returns a readonly view of the internal set. Do not mutate externally.
   */
  get selected(): ReadonlySet<EntityId> {
    return this._selected;
  }

  /** Returns `true` if the given entity is currently selected. */
  isSelected(entity: EntityId): boolean {
    return this._selected.has(entity);
  }

  /** Returns the number of currently selected entities. */
  get count(): number {
    return this._selected.size;
  }

  // -------------------------------------------------------------------------
  // Mutation API
  // -------------------------------------------------------------------------

  /**
   * Selects the entity at the given canvas-space position.
   *
   * If no entity exists at the position, clears the selection (unless
   * `additive` is true, in which case the current selection is preserved).
   *
   * @param pos      - Canvas-space click position (CSS pixels).
   * @param additive - When true, adds to or removes from the existing
   *                   selection instead of replacing it (Shift+click).
   */
  selectAt(pos: Position, additive: boolean): void {
    const entity = this._entityAtPosition(pos);

    if (entity === null) {
      if (!additive) {
        this._clearAll();
      }
      return;
    }

    // Entity must have a SelectableComponent to be selectable.
    if (!this._world.hasComponent(entity, SelectableType)) {
      if (!additive) {
        this._clearAll();
      }
      return;
    }

    if (additive) {
      // Shift-click on an already-selected entity deselects it.
      if (this._selected.has(entity)) {
        this._deselect(entity);
      } else {
        this._select(entity);
      }
    } else {
      this._clearAll();
      this._select(entity);
    }
  }

  /**
   * Selects all selectable entities owned by the local player that fall
   * within the given grid-space bounding box.
   *
   * The bounding box corners may be in any order — min/max are computed
   * internally. Only entities with {@link SelectableComponent} and an
   * {@link OwnerComponent} matching the local player's `playerId` are included.
   *
   * @param cornerA  - First corner of the drag rectangle (grid coords).
   * @param cornerB  - Opposite corner of the drag rectangle (grid coords).
   * @param additive - When true, adds to existing selection rather than
   *                   replacing it.
   */
  selectInBox(cornerA: Position, cornerB: Position, additive: boolean): void {
    if (!additive) {
      this._clearAll();
    }

    const minX = Math.min(cornerA.x, cornerB.x);
    const maxX = Math.max(cornerA.x, cornerB.x);
    const minZ = Math.min(cornerA.z, cornerB.z);
    const maxZ = Math.max(cornerA.z, cornerB.z);

    for (const [entity] of this._world.query(SelectableType)) {
      // Box selection is limited to the local player's own units.
      if (!this._isOwnedByLocalPlayer(entity)) continue;

      const posComp = this._world.getComponent<PositionComponent>(entity, PositionType);
      if (posComp === undefined) continue;

      if (posComp.x >= minX && posComp.x <= maxX && posComp.z >= minZ && posComp.z <= maxZ) {
        this._select(entity);
      }
    }
  }

  /**
   * Clears the entire selection and syncs all component state.
   */
  clearSelection(): void {
    this._clearAll();
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Marks an entity as selected and syncs its component state.
   *
   * Idempotent — safe to call for an already-selected entity.
   */
  private _select(entity: EntityId): void {
    this._selected.add(entity);
    this._syncComponentState(entity, true);
  }

  /**
   * Marks an entity as deselected and syncs its component state.
   *
   * Idempotent — safe to call for an already-deselected entity.
   */
  private _deselect(entity: EntityId): void {
    this._selected.delete(entity);
    this._syncComponentState(entity, false);
  }

  /** Deselects all entities and syncs their component state. */
  private _clearAll(): void {
    for (const entity of this._selected) {
      this._syncComponentState(entity, false);
    }
    this._selected.clear();
  }

  /**
   * Writes the `selected` flag on {@link SelectableComponent} and directly
   * toggles the Three.js selection ring visibility on
   * {@link SelectionRingComponent} for immediate visual feedback without
   * waiting for the rendering pass.
   *
   * This is the only site in the UI layer that mutates ECS component data.
   */
  private _syncComponentState(entity: EntityId, isSelected: boolean): void {
    const selectable = this._world.getComponent<SelectableComponent>(entity, SelectableType);
    if (selectable !== undefined) {
      selectable.selected = isSelected;
    }

    // Directly toggle the Three.js ring for immediate per-frame feedback.
    const ring = this._world.getComponent<SelectionRingComponent>(entity, SelectionRingType);
    if (ring !== undefined) {
      ring.mesh.visible = isSelected;
    }
  }

  /**
   * Returns `true` when the entity's {@link OwnerComponent}.playerId matches
   * the local player's {@link PlayerId} string.
   */
  private _isOwnedByLocalPlayer(entity: EntityId): boolean {
    const owner = this._world.getComponent<OwnerComponent>(entity, OwnerType);
    return owner?.playerId === this._localPlayer;
  }
}
