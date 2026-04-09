/**
 * ConstructionSystem — advances building construction progress each tick.
 *
 * Buildings with a ConstructionComponent are under construction. Each tick,
 * elapsed time is incremented while a live builder is assigned. HP scales
 * proportionally from 1 to maxHp. If the active builder dies, the system tries
 * to reassign the site to another live worker owned by the same player; if no
 * replacement exists, construction is paused until one becomes available.
 * When complete, the ConstructionComponent is removed and BUILDING_COMPLETE
 * is emitted.
 *
 * @module buildings/ConstructionSystem
 */

import { System } from '../ecs/System';
import type { EventBus } from '../core/EventBus';
import type { Unsubscribe } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import {
  AliveType,
  ConstructionType,
  HealthType,
  BuildingType,
  OwnerType,
  UnitType,
} from '../ecs/components/GameComponents';
import { Faction } from '../types';
import type { EntityId } from '../types';
import { NULL_ENTITY } from '../ecs/Entity';

export class ConstructionSystem extends System {
  readonly name = 'ConstructionSystem';
  private _unsubUnitDied?: Unsubscribe;

  constructor(private eventBus: EventBus<GameEvents>) {
    super();
  }

  override init(world: import('../ecs/World').World): void {
    super.init(world);
    this._unsubUnitDied = this.eventBus.on('UNIT_DIED', ({ entityId }) => {
      this._handleBuilderDeath(entityId);
    });
  }

  override destroy(): void {
    this._unsubUnitDied?.();
    this._unsubUnitDied = undefined;
  }

  update(dt: number): void {
    const world = this.world;

    for (const [id, construction] of world.query(ConstructionType)) {
      if (!this._ensureAssignedBuilder(id, construction.builderEntity)) {
        continue;
      }

      construction.elapsed += dt;

      // Scale HP proportionally during construction
      const health = world.getComponent(id, HealthType);
      if (health) {
        const progress = Math.min(construction.elapsed / construction.buildTime, 1);
        health.current = Math.max(1, Math.floor(health.max * progress));
      }

      // Construction complete
      if (construction.elapsed >= construction.buildTime) {
        // Set HP to max
        if (health) {
          health.current = health.max;
        }

        // Mark building as complete
        const building = world.getComponent(id, BuildingType);
        if (building) {
          building.isComplete = true;
        }

        // Remove construction component
        world.removeComponent(id, ConstructionType);

        // Emit event
        const owner = world.getComponent(id, OwnerType);
        this.eventBus.emit('BUILDING_COMPLETE', {
          entityId: id,
          buildingId: building?.buildingId ?? '',
          faction: owner?.faction ?? Faction.Human,
          playerId: owner?.playerId ?? 'human',
        });
      }
    }
  }

  private _handleBuilderDeath(builderEntity: EntityId): void {
    for (const [buildingEntity, construction] of this.world.query(ConstructionType)) {
      if (construction.builderEntity !== builderEntity) {
        continue;
      }
      this._ensureAssignedBuilder(buildingEntity, builderEntity);
    }
  }

  private _ensureAssignedBuilder(buildingEntity: EntityId, currentBuilder: EntityId): boolean {
    if (currentBuilder !== NULL_ENTITY && this.world.hasComponent(currentBuilder, AliveType)) {
      return true;
    }

    const construction = this.world.getComponent(buildingEntity, ConstructionType);
    if (!construction) {
      return false;
    }

    construction.builderEntity = this._findReplacementBuilder(buildingEntity);
    return construction.builderEntity !== NULL_ENTITY;
  }

  private _findReplacementBuilder(buildingEntity: EntityId): EntityId {
    const owner = this.world.getComponent(buildingEntity, OwnerType);
    if (!owner) {
      return NULL_ENTITY;
    }

    for (const [entity, unit] of this.world.query(UnitType, OwnerType, AliveType)) {
      const unitOwner = this.world.getComponent(entity, OwnerType);
      if (unitOwner?.playerId !== owner.playerId) {
        continue;
      }
      if (!unit.isWorker) {
        continue;
      }
      return entity;
    }

    return NULL_ENTITY;
  }
}
