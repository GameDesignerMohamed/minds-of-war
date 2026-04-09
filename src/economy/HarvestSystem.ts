/**
 * HarvestSystem — drives the worker harvest state machine each simulation tick.
 *
 * Implements: design/gdd/economy.md — worker harvest loop
 *
 * State machine (approved decision: MovementSystem clears targetX/Z on arrival):
 *
 *   idle
 *     → movingToResource   (on harvest order issued)
 *   movingToResource
 *     → harvesting         (when movement.targetX === undefined — arrival signal)
 *   harvesting
 *     → movingToDropOff    (when gatherTimer >= mineTime/chopTime and carryAmount > 0)
 *   movingToDropOff
 *     → droppingOff        (when movement.targetX === undefined)
 *   droppingOff
 *     → movingToResource   (after drop-off delay; emits RESOURCE_DEPOSITED)
 *
 * Decisions (approved):
 *  - HarvestSystem emits RESOURCE_DEPOSITED; ResourceTracker listens to credit gold/wood.
 *  - MovementSystem clears targetX/Z; HarvestSystem polls for undefined to detect arrival.
 *
 * Dependencies injected via constructor:
 *  - EventBus<GameEvents>  — emits RESOURCE_DEPOSITED, RESOURCE_DEPLETED
 *  - ResourcesData         — mine/chop timers, carry amounts (from config)
 *
 * @module economy/HarvestSystem
 */

import { System } from '../ecs/System';
import {
  HarvesterType,
  MovementType,
  PositionType,
  ResourceNodeType,
  OwnerType,
  type HarvesterComponent,
} from '../ecs/components/GameComponents';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { ResourcesData } from '../config/ConfigLoader';
import type { EntityId } from '../types';
import { NULL_ENTITY } from '../ecs/Entity';

// ---------------------------------------------------------------------------
// HarvestSystem
// ---------------------------------------------------------------------------

/**
 * Ticks the harvest state machine for every entity with a HarvesterComponent.
 *
 * Zero allocations in the hot path: all state is stored in components;
 * no arrays or objects are created per tick.
 *
 * @example
 * ```ts
 * const harvestSystem = new HarvestSystem(eventBus, config.economy.resources);
 * world.registerSystem(harvestSystem);
 * ```
 */
export class HarvestSystem extends System {
  readonly name = 'HarvestSystem';

  private readonly _bus: EventBus<GameEvents>;
  private readonly _config: ResourcesData;

  /**
   * @param bus    - Game-wide event bus. Emits RESOURCE_DEPOSITED and RESOURCE_DEPLETED.
   * @param config - Economy resource config from assets/data/economy/resources.json.
   */
  constructor(bus: EventBus<GameEvents>, config: ResourcesData) {
    super();
    this._bus = bus;
    this._config = config;
  }

  // -------------------------------------------------------------------------
  // System lifecycle
  // -------------------------------------------------------------------------

  /**
   * Advances every active worker through its harvest state machine step.
   *
   * @param deltaTime - Elapsed seconds since the last tick.
   */
  update(deltaTime: number): void {
    for (const [entity, harvester] of this.world.query(HarvesterType)) {
      switch (harvester.state) {
        case 'idle':
          // Nothing to do until an order is issued externally.
          break;

        case 'movingToResource':
          this._tickMovingToResource(entity, harvester);
          break;

        case 'harvesting':
          this._tickHarvesting(entity, harvester, deltaTime);
          break;

        case 'movingToDropOff':
          this._tickMovingToDropOff(entity, harvester);
          break;

        case 'droppingOff':
          this._tickDroppingOff(entity, harvester, deltaTime);
          break;
      }
    }
  }

  // -------------------------------------------------------------------------
  // State handlers
  // -------------------------------------------------------------------------

  /**
   * Detects arrival at the resource node by checking whether MovementSystem
   * has cleared the movement target (targetX === undefined = arrived).
   */
  private _tickMovingToResource(_entity: EntityId, harvester: HarvesterComponent): void {
    const movement = this.world.getComponent(_entity, MovementType);
    if (movement === undefined) return;

    // MovementSystem sets targetX to undefined on arrival (Decision #6).
    if (movement.targetX !== undefined) {
      return; // Still en route.
    }

    harvester.gatherTimer = 0;
    harvester.state = 'harvesting';
  }

  /**
   * Advances the gather timer. When the gather time elapses, extracts resources
   * from the node and transitions to movingToDropOff.
   */
  private _tickHarvesting(
    entity: import('../../src/types').EntityId,
    harvester: import('../ecs/components/GameComponents').HarvesterComponent,
    deltaTime: number,
  ): void {
    if (harvester.assignedResource === NULL_ENTITY) {
      harvester.state = 'idle';
      return;
    }

    const node = this.world.getComponent(harvester.assignedResource, ResourceNodeType);
    if (node === undefined || node.remaining <= 0) {
      // Node exhausted or gone — go idle.
      harvester.state = 'idle';
      return;
    }

    const gatherTime =
      harvester.carryType === 'gold' ? this._config.goldMine.mineTime : this._config.tree.chopTime;

    harvester.gatherTimer += deltaTime;

    if (harvester.gatherTimer < gatherTime) {
      return; // Still gathering.
    }

    // Calculate actual carry: can't take more than what's left.
    const carryMax =
      harvester.carryType === 'gold'
        ? this._config.goldMine.workerCarry
        : this._config.tree.workerCarry;

    const taken = Math.min(carryMax, node.remaining);
    node.remaining -= taken;
    harvester.carryAmount = taken;
    harvester.gatherTimer = 0;

    // Check for depletion.
    if (node.remaining <= 0) {
      this._bus.emit('RESOURCE_DEPLETED', {
        nodeEntity: harvester.assignedResource,
        kind: harvester.carryType,
      });
    }

    // Issue move-to-dropoff order by setting the movement target.
    if (harvester.assignedDropOff !== NULL_ENTITY) {
      this._issueMoveToDropOff(entity, harvester);
    } else {
      // No drop-off assigned — drop resources here (shouldn't happen in practice).
      harvester.state = 'idle';
    }
  }

  /**
   * Detects arrival at the drop-off building by checking movement.targetX.
   */
  private _tickMovingToDropOff(
    entity: import('../../src/types').EntityId,
    harvester: import('../ecs/components/GameComponents').HarvesterComponent,
  ): void {
    const movement = this.world.getComponent(entity, MovementType);
    if (movement === undefined) return;

    if (movement.targetX !== undefined) {
      return; // Still en route.
    }

    // Arrived at drop-off — begin the short deposit interaction.
    harvester.gatherTimer = 0;
    harvester.state = 'droppingOff';
  }

  /**
   * Counts down the drop-off interaction time, then emits RESOURCE_DEPOSITED
   * and sends the worker back to the resource node.
   */
  private _tickDroppingOff(
    entity: import('../../src/types').EntityId,
    harvester: import('../ecs/components/GameComponents').HarvesterComponent,
    deltaTime: number,
  ): void {
    harvester.gatherTimer += deltaTime;

    if (harvester.gatherTimer < this._config.dropOffTime) {
      return; // Still in the drop animation.
    }

    // Credit the player via the event bus (Decision #7).
    const owner = this.world.getComponent(entity, OwnerType);
    if (owner !== undefined && harvester.carryAmount > 0) {
      this._bus.emit('RESOURCE_DEPOSITED', {
        playerId: owner.playerId,
        kind: harvester.carryType,
        amount: harvester.carryAmount,
        workerEntity: entity,
        dropOffEntity: harvester.assignedDropOff,
      });
    }

    harvester.carryAmount = 0;
    harvester.gatherTimer = 0;

    // Return to the resource node if it still has resources.
    if (harvester.assignedResource !== NULL_ENTITY) {
      const node = this.world.getComponent(harvester.assignedResource, ResourceNodeType);
      if (node !== undefined && node.remaining > 0) {
        this._issueMoveToResource(entity, harvester);
        return;
      }
    }

    harvester.state = 'idle';
  }

  // -------------------------------------------------------------------------
  // Movement order helpers
  // -------------------------------------------------------------------------

  /**
   * Issues a move order toward the assigned resource node.
   */
  private _issueMoveToResource(
    entity: import('../../src/types').EntityId,
    harvester: import('../ecs/components/GameComponents').HarvesterComponent,
  ): void {
    const resourcePos = this.world.getComponent(harvester.assignedResource, PositionType);
    if (resourcePos === undefined) {
      harvester.state = 'idle';
      return;
    }

    const movement = this.world.getComponent(entity, MovementType);
    if (movement === undefined) {
      harvester.state = 'idle';
      return;
    }

    movement.targetX = resourcePos.x;
    movement.targetZ = resourcePos.z;
    harvester.state = 'movingToResource';
  }

  /**
   * Issues a move order toward the assigned drop-off building.
   */
  private _issueMoveToDropOff(
    entity: import('../../src/types').EntityId,
    harvester: import('../ecs/components/GameComponents').HarvesterComponent,
  ): void {
    const dropOffPos = this.world.getComponent(harvester.assignedDropOff, PositionType);
    if (dropOffPos === undefined) {
      harvester.state = 'idle';
      return;
    }

    const movement = this.world.getComponent(entity, MovementType);
    if (movement === undefined) {
      harvester.state = 'idle';
      return;
    }

    movement.targetX = dropOffPos.x;
    movement.targetZ = dropOffPos.z;
    harvester.state = 'movingToDropOff';
  }
}
