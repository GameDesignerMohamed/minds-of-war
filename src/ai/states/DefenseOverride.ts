/**
 * DefenseOverride — AI interrupt state triggered when a building is destroyed.
 *
 * DefenseOverride is a timed state. When the AI loses a building, AIController
 * forces a transition here (bypassing the normal update return path). The state
 * runs for a fixed 30-second window during which it redirects idle combat units
 * to intercept and engage the nearest enemy threat near the AI's base.
 *
 * After 30 seconds the state exits and restores whichever state was active
 * before the interrupt (stored in AIContext.previousStateName by AIController
 * before forcing the transition).
 *
 * Design (Q5 answer — pure timer):
 *  - No heuristics: the state runs for exactly 30 seconds regardless of whether
 *    the threat has been neutralized. Simple and tunable via the DEFENSE_DURATION
 *    constant (easily promoted to an AiProfile field later).
 *
 * Throttle: decisions run every 0.5 seconds (accumulator pattern).
 *
 * Transition table:
 *  - → previousStateName: after DEFENSE_DURATION seconds have elapsed.
 *
 * Implements: design/gdd/ai-fsm.md — DefenseOverride section
 *
 * @module ai/states/DefenseOverride
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
// Constants
// ---------------------------------------------------------------------------

/** Duration in seconds the defense state runs before returning to prior state. */
const DEFENSE_DURATION = 30;

// ---------------------------------------------------------------------------
// DefenseOverride
// ---------------------------------------------------------------------------

/**
 * AI defense interrupt state.
 *
 * @example
 * const defense = new DefenseOverride(profile, world, enemyPlayerId);
 * fsm.registerState(defense);
 *
 * // Triggered externally by AIController:
 * ctx.previousStateName = fsm.activeStateName ?? 'EcoState';
 * ctx.defenseTimer = 0;
 * fsm.forceTransition('DefenseOverride', ctx);
 */
export class DefenseOverride implements AIState<AIContext> {
  readonly name = 'DefenseOverride';

  private readonly _profile: AIBehaviorProfile;
  private readonly _world: World;
  private readonly _enemyPlayerId: string;

  /** Accumulator for throttling orders to every 0.5 seconds. */
  private _accumulator = 0;
  /** Decision interval in seconds. */
  private static readonly INTERVAL = 0.5;

  /**
   * @param profile       - AI difficulty profile slice (retained for future
   *                        tuning knobs; currently only the timer is used).
   * @param world         - ECS world for unit queries.
   * @param enemyPlayerId - PlayerId of the opponent for target selection.
   */
  constructor(profile: AIBehaviorProfile, world: World, enemyPlayerId: string) {
    this._profile = profile;
    this._world = world;
    this._enemyPlayerId = enemyPlayerId;
  }

  // -------------------------------------------------------------------------
  // AIState lifecycle
  // -------------------------------------------------------------------------

  enter(ctx: AIContext): void {
    // defenseTimer is set to 0 by AIController before forceTransition; reset
    // the accumulator for the decision throttle.
    this._accumulator = 0;
    ctx.defenseTimer = 0;
  }

  /**
   * Advances the defense timer and issues intercept orders to idle AI units.
   * Returns to the previous state after DEFENSE_DURATION seconds.
   *
   * @returns previousStateName when the timer expires; null otherwise.
   */
  update(ctx: AIContext, deltaTime: number): string | null {
    ctx.defenseTimer += deltaTime;
    this._accumulator += deltaTime;

    // Return to prior state when timer expires.
    if (ctx.defenseTimer >= DEFENSE_DURATION) {
      const returnTo = ctx.previousStateName || 'EcoState';
      ctx.previousStateName = '';
      ctx.defenseTimer = 0;
      return returnTo;
    }

    if (this._accumulator < DefenseOverride.INTERVAL) return null;
    this._accumulator = 0;

    // Order all idle combat units to engage the nearest enemy.
    this._issueDefenseOrders(ctx);

    return null;
  }

  exit(ctx: AIContext): void {
    // Clear all defense attack targets so units don't keep chasing after
    // the state exits.
    this._clearDefenseOrders(ctx);
    ctx.defenseTimer = 0;
    ctx.previousStateName = '';
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Assigns the nearest enemy as an attack target to every idle AI combat unit.
   * Idle means no AttackTargetComponent currently set.
   */
  private _issueDefenseOrders(ctx: AIContext): void {
    const world = this._world;

    for (const [entity, unit] of world.query(UnitType, OwnerType, AliveType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (unit.isWorker) continue;

      // Already targeting something — leave it in place.
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
   * Called on exit so units do not pursue off-map after defense ends.
   */
  private _clearDefenseOrders(ctx: AIContext): void {
    const world = this._world;

    for (const [entity, unit] of world.query(UnitType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (unit.isWorker) continue;
      world.removeComponent(entity, AttackTargetType);
    }
  }

  /**
   * Returns the nearest alive enemy EntityId to (fromX, fromZ), or NULL_ENTITY.
   *
   * @param fromX - Reference X position (defending unit's position).
   * @param fromZ - Reference Z position.
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
