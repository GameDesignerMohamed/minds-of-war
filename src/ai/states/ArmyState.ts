/**
 * ArmyState — AI state managing military unit production.
 *
 * ArmyState queues combat units at military production buildings according to
 * the melee-to-ranged ratio in the AI profile. It transitions to AttackState
 * once the army reaches the configured supply threshold.
 *
 * Responsibilities:
 *  1. Survey all completed military production buildings.
 *  2. Determine how many melee vs. ranged units the AI has to hit the configured
 *     ratio (meleeToRangedRatio from ArmyPhase config).
 *  3. Queue the appropriate unit type at buildings with available queue slots.
 *  4. Transition to AttackState when supplyUsed >= attackSupplyThreshold.
 *
 * Unit assignment by building (IDs from assets/data/buildings/orcs.json and
 * assets/data/units/orcs.json):
 *  war_camp     → grunt (melee) or berserker (melee tier-2)
 *  beast_den    → hunter (ranged)
 *  spirit_lodge → shaman (ranged-magic)
 *  siege_pit    → war_catapult (siege, ranged)
 *
 * Throttle: decisions run every 1.0 second (accumulator pattern).
 *
 * Transition table:
 *  - → AttackState: when supplyUsed >= profile.armyPhase.attackSupplyThreshold.
 *  - → BuildState: if no military buildings are complete (regress condition).
 *
 * Implements: design/gdd/ai-fsm.md — ArmyState section
 *
 * @module ai/states/ArmyState
 */

import type { AIState } from '../AIStateMachine';
import type { AIContext } from '../AIContext';
import type { AIBehaviorProfile, UnitData } from '../../config/ConfigLoader';
import type { World } from '../../ecs/World';
import type { ResourceTracker } from '../../economy/ResourceTracker';
import type { TechTreeSystem } from '../../buildings/TechTreeSystem';
import {
  BuildingType,
  OwnerType,
  ConstructionType,
  TrainingQueueType,
  UnitType,
} from '../../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// Orc faction unit categories
// (IDs from assets/data/units/orcs.json)
// ---------------------------------------------------------------------------

/** Unit IDs that count as melee for ratio calculation. */
const MELEE_UNIT_IDS = new Set(['grunt', 'berserker', 'warlord']);
/** Unit IDs that count as ranged for ratio calculation. */
const RANGED_UNIT_IDS = new Set(['hunter', 'shaman', 'war_catapult']);

/** Which unit each military building trains (primary choice). */
const BUILDING_TRAINS: ReadonlyMap<string, string> = new Map([
  ['war_camp', 'grunt'],
  ['beast_den', 'hunter'],
  ['spirit_lodge', 'shaman'],
  ['siege_pit', 'war_catapult'],
]);

/** Maximum units allowed in any single building's training queue. */
const MAX_QUEUE_DEPTH = 3;

// ---------------------------------------------------------------------------
// ArmyState
// ---------------------------------------------------------------------------

/**
 * AI military production state.
 *
 * @example
 * const army = new ArmyState(profile, world, tracker, orcUnitDataMap);
 * fsm.registerState(army);
 */
export class ArmyState implements AIState<AIContext> {
  readonly name = 'ArmyState';

  private readonly _profile: AIBehaviorProfile;
  private readonly _world: World;
  private readonly _tracker: ResourceTracker;
  private readonly _techSystem: TechTreeSystem;
  /**
   * Map of unitId → UnitData for the AI's faction.
   * Keyed by id field from units/orcs.json.
   */
  private readonly _unitDataMap: ReadonlyMap<string, UnitData>;

  /** Accumulator for throttling decisions to every 1.0 second. */
  private _accumulator = 0;
  /** Decision interval in seconds. */
  private static readonly INTERVAL = 1.0;

  /**
   * @param profile     - AI difficulty profile slice.
   * @param world       - ECS world for building and unit queries.
   * @param tracker     - ResourceTracker for canAfford and hasSupply checks.
   * @param unitDataMap - Pre-built lookup map: unitId → UnitData.
   */
  constructor(
    profile: AIBehaviorProfile,
    world: World,
    tracker: ResourceTracker,
    techSystem: TechTreeSystem,
    unitDataMap: ReadonlyMap<string, UnitData>,
  ) {
    this._profile = profile;
    this._world = world;
    this._tracker = tracker;
    this._techSystem = techSystem;
    this._unitDataMap = unitDataMap;
  }

  // -------------------------------------------------------------------------
  // AIState lifecycle
  // -------------------------------------------------------------------------

  enter(_ctx: AIContext): void {
    this._accumulator = 0;
  }

  /**
   * Ticks military production logic on the 1-second interval.
   *
   * @returns 'AttackState' when army reaches the supply threshold;
   *          'BuildState' if no military buildings are complete; null otherwise.
   */
  update(ctx: AIContext, deltaTime: number): string | null {
    this._accumulator += deltaTime;
    if (this._accumulator < ArmyState.INTERVAL) return null;
    this._accumulator = 0;

    // If we have hit the attack threshold, march.
    if (ctx.supplyUsed >= this._profile.armyPhase.attackSupplyThreshold) {
      return 'AttackState';
    }

    // Regress if military production lost (all destroyed).
    const hasMilitaryBuilding = [...BUILDING_TRAINS.keys()].some((id) =>
      ctx.completedBuildings.has(id),
    );
    if (!hasMilitaryBuilding) {
      return 'BuildState';
    }

    // Count current army composition.
    const { meleeCount, rangedCount } = this._countArmyComposition(ctx);

    // Queue units at each available military building.
    this._queueUnits(ctx, meleeCount, rangedCount);

    return null;
  }

  exit(_ctx: AIContext): void {
    // No per-entry state to clean up.
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Counts how many melee and ranged units the AI currently owns.
   */
  private _countArmyComposition(ctx: AIContext): { meleeCount: number; rangedCount: number } {
    let meleeCount = 0;
    let rangedCount = 0;
    const world = this._world;

    for (const [entity, unit] of world.query(UnitType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (unit.isWorker) continue;

      if (MELEE_UNIT_IDS.has(unit.unitId)) meleeCount += 1;
      if (RANGED_UNIT_IDS.has(unit.unitId)) rangedCount += 1;
    }

    return { meleeCount, rangedCount };
  }

  /**
   * Iterates completed military buildings and queues the unit type that
   * best brings the army composition toward the configured melee:ranged ratio.
   *
   * Ratio logic: if current melee:ranged exceeds the target ratio, prefer
   * queuing ranged (hunter at beast_den, shaman at spirit_lodge). Otherwise,
   * prefer melee (grunt at war_camp).
   */
  private _queueUnits(ctx: AIContext, meleeCount: number, rangedCount: number): void {
    const world = this._world;
    const ratio = this._profile.armyPhase.meleeToRangedRatio;

    // Determine preferred type based on current composition.
    // If we have no ranged yet, always need melee first (ratio > 0 means
    // we want meleeToRangedRatio melee per 1 ranged).
    const currentRatio = rangedCount === 0 ? Infinity : meleeCount / rangedCount;
    const wantMelee = currentRatio < ratio;

    for (const [entity, building] of world.query(BuildingType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (!building.isComplete) continue;
      if (world.hasComponent(entity, ConstructionType)) continue;

      const primaryUnit = BUILDING_TRAINS.get(building.buildingId);
      if (primaryUnit === undefined) continue;

      const queue = world.getComponent(entity, TrainingQueueType);
      if (queue === undefined) continue;
      if (queue.queue.length >= MAX_QUEUE_DEPTH) continue;

      // Pick the unit to queue.
      const unitToQueue = this._pickUnit(building.buildingId, wantMelee);
      if (unitToQueue === null) continue;

      const unitData = this._unitDataMap.get(unitToQueue);
      if (unitData === undefined) continue;
      if (!this._techSystem.canTrainUnit(ctx.playerId, 'orc', unitData.id, unitData.tier)) continue;

      if (!this._tracker.canAfford(ctx.playerId, unitData.cost)) continue;
      if (!this._tracker.hasSupply(ctx.playerId, unitData.supplyCost)) continue;

      queue.queue.push(unitToQueue);
      this._tracker.spend(ctx.playerId, unitData.cost);
    }
  }

  /**
   * Given a building ID and a preference flag, returns the most appropriate
   * unit ID to train. Falls back to the building's primary unit if the
   * preferred category is not available at this building.
   *
   * war_camp can train grunt (melee) OR berserker (melee, tier-2 — not gated
   * here since TechTreeSystem handles tier-gate enforcement at training time).
   */
  private _pickUnit(buildingId: string, wantMelee: boolean): string | null {
    switch (buildingId) {
      case 'war_camp':
        // Always melee — no choice between melee/ranged at this building.
        return 'grunt';
      case 'beast_den':
        // Always ranged — no melee option at this building.
        return wantMelee ? null : 'hunter';
      case 'spirit_lodge':
        // Shaman is magic-ranged — treated as ranged for ratio purposes.
        return wantMelee ? null : 'shaman';
      case 'siege_pit':
        // War catapult is ranged-siege.
        return wantMelee ? null : 'war_catapult';
      default:
        return null;
    }
  }
}
