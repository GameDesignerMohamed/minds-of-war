/**
 * EcoState — AI state managing worker economy for the AI player.
 *
 * EcoState is responsible for keeping the AI's worker count at the configured
 * targets. It:
 *  1. Checks whether more workers should be trained (gold workers / wood workers).
 *  2. Queues thrall training at the stronghold if a slot is available.
 *  3. Transitions to BuildState once minimum worker count is satisfied.
 *
 * Throttle: decisions run every 1.0 second (accumulator pattern) to keep
 * debug logs readable and stay well within the 2ms AI budget.
 *
 * Transition table:
 *  - → BuildState: when workerCount >= profile.ecoPhase.minWorkers
 *
 * Faction note:
 *  Orc workers are "thrall", trained at "stronghold". This state is written
 *  for the orc faction; human equivalents would use a different unit/building ID.
 *  The faction-appropriate IDs are resolved by the caller that constructs this
 *  state — they are passed via constructor config fields.
 *
 * Implements: design/gdd/ai-fsm.md — EcoState section
 *
 * @module ai/states/EcoState
 */

import type { AIState } from '../AIStateMachine';
import type { AIContext } from '../AIContext';
import type { AIBehaviorProfile } from '../../config/ConfigLoader';
import type { World } from '../../ecs/World';
import type { ResourceTracker } from '../../economy/ResourceTracker';
import type { UnitData } from '../../config/ConfigLoader';
import {
  TrainingQueueType,
  BuildingType,
  OwnerType,
  ConstructionType,
} from '../../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// EcoState
// ---------------------------------------------------------------------------

/**
 * AI economy state: trains workers until minimum count is met, then yields
 * to BuildState.
 *
 * @example
 * const eco = new EcoState(
 *   profile,
 *   world,
 *   tracker,
 *   workerUnitData,   // UnitData for 'thrall'
 *   'stronghold',     // building that trains workers
 * );
 * fsm.registerState(eco);
 */
export class EcoState implements AIState<AIContext> {
  readonly name = 'EcoState';

  private readonly _profile: AIBehaviorProfile;
  private readonly _world: World;
  private readonly _tracker: ResourceTracker;
  private readonly _workerData: UnitData;
  private readonly _workerBuildingId: string;

  /** Accumulator for throttling decisions to every 1.0 second. */
  private _accumulator = 0;
  /** Decision interval in seconds. */
  private static readonly INTERVAL = 1.0;

  /**
   * @param profile          - AI difficulty profile slice for tuning knobs.
   * @param world            - ECS world for building queue queries.
   * @param tracker          - ResourceTracker for canAfford / hasSupply checks.
   * @param workerData       - UnitData record for the worker unit (e.g. thrall).
   * @param workerBuildingId - Building ID that trains the worker (e.g. 'stronghold').
   */
  constructor(
    profile: AIBehaviorProfile,
    world: World,
    tracker: ResourceTracker,
    workerData: UnitData,
    workerBuildingId: string,
  ) {
    this._profile = profile;
    this._world = world;
    this._tracker = tracker;
    this._workerData = workerData;
    this._workerBuildingId = workerBuildingId;
  }

  // -------------------------------------------------------------------------
  // AIState lifecycle
  // -------------------------------------------------------------------------

  enter(_ctx: AIContext): void {
    this._accumulator = 0;
  }

  /**
   * Ticks the economy logic on the 1-second interval.
   *
   * @returns 'BuildState' once the minimum worker target is met; null otherwise.
   */
  update(ctx: AIContext, deltaTime: number): string | null {
    this._accumulator += deltaTime;
    if (this._accumulator < EcoState.INTERVAL) return null;
    this._accumulator = 0;

    // Transition out once we have enough workers.
    if (ctx.workerCount >= this._profile.ecoPhase.minWorkers) {
      return 'BuildState';
    }

    // Attempt to queue another worker if we need one.
    const totalTargetWorkers =
      this._profile.ecoPhase.targetGoldWorkers + this._profile.ecoPhase.targetWoodWorkers;

    if (ctx.workerCount < totalTargetWorkers) {
      this._tryQueueWorker(ctx);
    }

    return null;
  }

  exit(_ctx: AIContext): void {
    // No per-entry state to clean up.
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Finds the AI's stronghold (or whichever building trains workers) and
   * enqueues a worker unit if the player can afford it and has supply room.
   */
  private _tryQueueWorker(ctx: AIContext): void {
    const cost = this._workerData.cost;
    const supply = this._workerData.supplyCost;

    if (!this._tracker.canAfford(ctx.playerId, cost)) return;
    if (!this._tracker.hasSupply(ctx.playerId, supply)) return;

    const world = this._world;

    for (const [entity, building] of world.query(BuildingType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (building.buildingId !== this._workerBuildingId) continue;
      if (!building.isComplete) continue;
      if (world.hasComponent(entity, ConstructionType)) continue;

      const queue = world.getComponent(entity, TrainingQueueType);
      if (queue === undefined) continue;

      // Only add to the queue if it is short (cap at 2 to avoid over-queuing).
      if (queue.queue.length >= 2) continue;

      queue.queue.push(this._workerData.id);
      this._tracker.spend(ctx.playerId, cost);
      // Only enqueue one worker per decision tick.
      break;
    }
  }
}
