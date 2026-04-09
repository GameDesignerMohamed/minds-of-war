/**
 * AttackState — AI state commanding the army to attack the enemy base.
 *
 * AttackState issues attack orders to all idle combat units, directing them at
 * the nearest enemy entity. It monitors army size and retreats to ArmyState
 * when supply drops below the configured retreat threshold.
 *
 * Responsibilities:
 *  1. Collect all AI combat units (non-workers).
 *  2. For each idle unit (no AttackTarget), find the nearest enemy and assign
 *     it via AttackTargetComponent.
 *  3. Monitor supplyUsed — if it falls below retreatSupplyThreshold, return
 *     to ArmyState to rebuild.
 *
 * Throttle: decisions run every 0.5 seconds (accumulator pattern) for
 * responsive combat orders without per-frame overhead.
 *
 * Transition table:
 *  - → ArmyState: when supplyUsed < profile.attackPhase.retreatSupplyThreshold.
 *
 * Implements: design/gdd/ai-fsm.md — AttackState section
 *
 * @module ai/states/AttackState
 */

import type { AIState } from '../AIStateMachine';
import type { AIContext } from '../AIContext';
import type { AIBehaviorProfile } from '../../config/ConfigLoader';
import type { World } from '../../ecs/World';
import {
  UnitType,
  OwnerType,
  AttackTargetType,
  PositionType,
  AliveType,
} from '../../ecs/components/GameComponents';
import { NULL_ENTITY } from '../../ecs/Entity';
import type { EntityId } from '../../types';

// ---------------------------------------------------------------------------
// AttackState
// ---------------------------------------------------------------------------

/**
 * AI attack state: orders all idle combat units to assault the nearest enemy.
 *
 * @example
 * const attack = new AttackState(profile, world, enemyPlayerId);
 * fsm.registerState(attack);
 */
export class AttackState implements AIState<AIContext> {
  readonly name = 'AttackState';

  private readonly _profile: AIBehaviorProfile;
  private readonly _world: World;
  /**
   * Player ID of the opposing (human) player. Used to identify enemy entities.
   * In a 1v1 game this is always the other player; expand for multiplayer.
   */
  private readonly _enemyPlayerId: string;

  /** Accumulator for throttling decisions to every 0.5 seconds. */
  private _accumulator = 0;
  /** Decision interval in seconds. */
  private static readonly INTERVAL = 0.5;

  /**
   * @param profile       - AI difficulty profile slice.
   * @param world         - ECS world for unit and position queries.
   * @param enemyPlayerId - PlayerId of the opponent ('human' in a standard match).
   */
  constructor(profile: AIBehaviorProfile, world: World, enemyPlayerId: string) {
    this._profile = profile;
    this._world = world;
    this._enemyPlayerId = enemyPlayerId;
  }

  // -------------------------------------------------------------------------
  // AIState lifecycle
  // -------------------------------------------------------------------------

  enter(_ctx: AIContext): void {
    this._accumulator = 0;
  }

  /**
   * Ticks attack logic on the 0.5-second interval.
   *
   * @returns 'ArmyState' when the army falls below the retreat threshold;
   *          null otherwise.
   */
  update(ctx: AIContext, deltaTime: number): string | null {
    this._accumulator += deltaTime;
    if (this._accumulator < AttackState.INTERVAL) return null;
    this._accumulator = 0;

    // Retreat when army is too depleted.
    if (ctx.supplyUsed < this._profile.attackPhase.retreatSupplyThreshold) {
      return 'ArmyState';
    }

    this._issueAttackOrders(ctx);

    return null;
  }

  exit(ctx: AIContext): void {
    // Clear all attack targets when leaving attack state so units do not
    // pursue across half the map after a retreat.
    this._clearAttackOrders(ctx);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * For each idle AI combat unit, finds the nearest alive enemy entity and
   * assigns it as the attack target via AttackTargetComponent.
   *
   * "Idle" here means no current AttackTargetComponent. Units that already have
   * a target assigned (either from a previous tick or from AttackSystem) are
   * skipped to avoid redundant writes.
   */
  private _issueAttackOrders(ctx: AIContext): void {
    const world = this._world;

    for (const [entity, unit] of world.query(UnitType, OwnerType, AliveType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (unit.isWorker) continue;

      // Already has a target — skip.
      if (world.hasComponent(entity, AttackTargetType)) continue;

      const pos = world.getComponent(entity, PositionType);
      if (pos === undefined) continue;

      const target = this._findNearestEnemy(pos.x, pos.z);
      if (target === NULL_ENTITY) continue;

      world.addComponent(entity, AttackTargetType, {
        type: 'AttackTarget',
        targetEntity: target,
      });
    }
  }

  /**
   * Removes AttackTargetComponent from all AI combat units.
   *
   * Called on state exit so retreating units stop chasing when transitioning
   * back to ArmyState.
   */
  private _clearAttackOrders(ctx: AIContext): void {
    const world = this._world;

    for (const [entity, unit] of world.query(UnitType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (unit.isWorker) continue;
      world.removeComponent(entity, AttackTargetType);
    }
  }

  /**
   * Returns the EntityId of the nearest alive enemy entity to the given
   * world-space position. Returns NULL_ENTITY if no enemies are alive.
   *
   * Searches all alive entities owned by the enemy player that have a Position.
   * O(N) over enemy entities — acceptable at < 100 units per faction.
   *
   * @param fromX - Attacker X position.
   * @param fromZ - Attacker Z position.
   */
  private _findNearestEnemy(fromX: number, fromZ: number): EntityId {
    const world = this._world;
    let nearestEntity = NULL_ENTITY;
    let nearestDistSq = Infinity;

    for (const [entity] of world.query(OwnerType, AliveType, PositionType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== this._enemyPlayerId) continue;

      const pos = world.getComponent(entity, PositionType);
      if (pos === undefined) continue;

      const dx = pos.x - fromX;
      const dz = pos.z - fromZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearestEntity = entity;
      }
    }

    return nearestEntity;
  }
}
