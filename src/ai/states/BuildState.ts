/**
 * BuildState — AI state managing building construction and tech upgrades.
 *
 * BuildState monitors what the AI owns and issues construction orders for the
 * build priority list defined in the AI profile. It also triggers tier-upgrade
 * research on the HQ when the gold threshold is met.
 *
 * Responsibilities:
 *  1. Walk the faction build priority list (war_camp first, then supply
 *     buildings like war_hut, then advanced production buildings).
 *  2. If a required building is absent (not complete and not under construction),
 *     find an idle worker and issue a move-to-site order and spend the cost.
 *  3. When gold >= upgradeGoldThreshold and HQ is at tier 1, start tier-2 research.
 *  4. Transition to ArmyState when army production buildings are complete.
 *
 * Throttle: decisions run every 2.0 seconds (accumulator pattern).
 *
 * Transition table:
 *  - → ArmyState: when at least one military production building is complete
 *    (war_camp, beast_den, spirit_lodge, or siege_pit).
 *  - → EcoState: if worker count falls below minWorkers (eco emergency).
 *
 * Build priority (orc faction, IDs from assets/data/buildings/orcs.json):
 *  war_camp → war_hut → beast_den → spirit_lodge → war_hut → war_forge → siege_pit
 *
 * Implements: design/gdd/ai-fsm.md — BuildState section
 *
 * @module ai/states/BuildState
 */

import type { AIState } from '../AIStateMachine';
import type { AIContext } from '../AIContext';
import type { AIBehaviorProfile, BuildingData } from '../../config/ConfigLoader';
import type { World } from '../../ecs/World';
import type { ResourceTracker } from '../../economy/ResourceTracker';
import type { TechTreeSystem } from '../../buildings/TechTreeSystem';
import {
  OwnerType,
  UnitType,
  PositionType,
  MovementType,
  HarvesterType,
  TechType,
} from '../../ecs/components/GameComponents';
import { NULL_ENTITY } from '../../ecs/Entity';

// ---------------------------------------------------------------------------
// Build priority list for the orc faction
// (IDs verified against assets/data/buildings/orcs.json)
// ---------------------------------------------------------------------------

/**
 * Ordered list of building IDs the AI will try to construct in sequence.
 * Military production first, then supply, then advanced options.
 * Duplicate 'war_hut' is intentional — AI builds two supply buildings.
 */
const ORC_BUILD_PRIORITY: readonly string[] = [
  'war_camp', // trains grunt, berserker — primary military production
  'war_hut', // provides 8 supply (first copy)
  'beast_den', // trains hunter (ranged)
  'spirit_lodge', // trains shaman
  'war_hut', // provides 8 supply (second copy)
  'war_forge', // weapon/armor upgrade research
  'siege_pit', // trains war_catapult
];

/** Building IDs that count as "military production ready" for ArmyState transition. */
const MILITARY_BUILDINGS = new Set(['war_camp', 'beast_den', 'spirit_lodge', 'siege_pit']);

// ---------------------------------------------------------------------------
// BuildState
// ---------------------------------------------------------------------------

/**
 * AI building-and-tech state.
 *
 * @example
 * const buildingMap = new Map(orcBuildingsFile.buildings.map(b => [b.id, b]));
 * const build = new BuildState(
 *   profile, world, tracker, techSystem, buildingMap,
 * );
 * fsm.registerState(build);
 */
export class BuildState implements AIState<AIContext> {
  readonly name = 'BuildState';

  private readonly _profile: AIBehaviorProfile;
  private readonly _world: World;
  private readonly _tracker: ResourceTracker;
  private readonly _techSystem: TechTreeSystem;
  /**
   * Map of buildingId → BuildingData for the AI's faction.
   * Keyed by id field from buildings/orcs.json.
   */
  private readonly _buildingDataMap: ReadonlyMap<string, BuildingData>;

  /** Accumulator for throttling decisions to every 2.0 seconds. */
  private _accumulator = 0;
  /** Decision interval in seconds. */
  private static readonly INTERVAL = 2.0;

  /**
   * @param profile         - AI difficulty profile slice.
   * @param world           - ECS world for entity queries.
   * @param tracker         - ResourceTracker for canAfford checks.
   * @param techSystem      - TechTreeSystem to start research on the HQ.
   * @param buildingDataMap - Pre-built lookup map: buildingId → BuildingData.
   */
  constructor(
    profile: AIBehaviorProfile,
    world: World,
    tracker: ResourceTracker,
    techSystem: TechTreeSystem,
    buildingDataMap: ReadonlyMap<string, BuildingData>,
  ) {
    this._profile = profile;
    this._world = world;
    this._tracker = tracker;
    this._techSystem = techSystem;
    this._buildingDataMap = buildingDataMap;
  }

  // -------------------------------------------------------------------------
  // AIState lifecycle
  // -------------------------------------------------------------------------

  enter(_ctx: AIContext): void {
    this._accumulator = 0;
  }

  /**
   * Ticks the build logic on the 2-second interval.
   *
   * @returns 'ArmyState' when at least one military building is complete;
   *          'EcoState' on worker emergency; null otherwise.
   */
  update(ctx: AIContext, deltaTime: number): string | null {
    this._accumulator += deltaTime;
    if (this._accumulator < BuildState.INTERVAL) return null;
    this._accumulator = 0;

    // Worker emergency — drop back to eco.
    if (ctx.workerCount < this._profile.ecoPhase.minWorkers) {
      return 'EcoState';
    }

    // Try to start tech upgrade if threshold met.
    this._tryResearchUpgrade(ctx);

    // Issue a build order for the next needed building.
    this._tryBuild(ctx);

    // Transition to ArmyState when any military production building is complete.
    for (const id of MILITARY_BUILDINGS) {
      if (ctx.completedBuildings.has(id)) {
        return 'ArmyState';
      }
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
   * Starts tier-2 research on the HQ when gold threshold is met.
   *
   * Protocol (Option A from design session):
   *  1. Call TechTreeSystem.startResearch(hqEntity, 2) — sets TechComponent fields.
   *  2. If it returns true, read researchCost from the TechComponent and spend it.
   *
   * TechTreeSystem.startResearch() is a no-op if already researching or at max tier,
   * so we do not need a separate tier guard here.
   */
  private _tryResearchUpgrade(ctx: AIContext): void {
    if (ctx.hqEntity === NULL_ENTITY) return;
    if (ctx.gold < this._profile.buildPhase.upgradeGoldThreshold) return;

    const started = this._techSystem.startResearch(ctx.hqEntity, 2);
    if (!started) return;

    // Read the cost that TechTreeSystem stamped onto the TechComponent.
    const techData = this._world.getComponent(ctx.hqEntity, TechType);
    if (techData !== undefined && techData.researching) {
      this._tracker.spend(ctx.playerId, techData.researchCost);
    }
  }

  /**
   * Finds the next building in the priority list that is neither complete nor
   * under construction, and dispatches an idle worker toward a build site.
   *
   * One build order is issued per decision tick.
   */
  private _tryBuild(ctx: AIContext): void {
    // Determine which buildings we have already (complete or in-progress).
    // ORC_BUILD_PRIORITY may contain duplicates (two war_huts). We must track
    // how many of each ID we've already placed vs. how many the list needs.
    const needed = this._countNeeded(ctx);
    if (needed === null) return;

    const [targetBuildingId] = needed;
    const data = this._buildingDataMap.get(targetBuildingId);
    if (data === undefined) return;
    if (!this._techSystem.canConstructBuilding(ctx.playerId, 'orc', targetBuildingId)) return;

    if (!this._tracker.canAfford(ctx.playerId, data.cost)) return;

    const workerEntity = this._findIdleWorker(ctx);
    if (workerEntity === NULL_ENTITY) return;

    this._tracker.spend(ctx.playerId, data.cost);

    // Prevent a same-tick duplicate by pre-marking as under construction.
    ctx.buildingsUnderConstruction.add(targetBuildingId);

    // Direct the worker toward a build site 5 tiles west of its current
    // position. A dedicated placement system will replace this heuristic.
    const workerPos = this._world.getComponent(workerEntity, PositionType);
    const movement = this._world.getComponent(workerEntity, MovementType);
    if (workerPos !== undefined && movement !== undefined) {
      movement.targetX = workerPos.x - 5;
      movement.targetZ = workerPos.z;
    }
  }

  /**
   * Walks the priority list to find the first building ID that the AI still
   * needs to construct (accounting for duplicates in the priority list).
   *
   * Returns [buildingId] of the first needed entry, or null if all are satisfied.
   */
  private _countNeeded(ctx: AIContext): [string] | null {
    // Count how many of each building ID we already have (complete + in-progress).
    const have = new Map<string, number>();
    for (const id of ctx.completedBuildings) {
      have.set(id, (have.get(id) ?? 0) + 1);
    }
    for (const id of ctx.buildingsUnderConstruction) {
      have.set(id, (have.get(id) ?? 0) + 1);
    }

    // Count how many of each building the priority list wants in total.
    const want = new Map<string, number>();
    for (const id of ORC_BUILD_PRIORITY) {
      want.set(id, (want.get(id) ?? 0) + 1);
    }

    // Walk the priority list in order and find the first deficit.
    // We track how many of each ID we have already "claimed" from the priority
    // walk so duplicates are handled correctly.
    const claimed = new Map<string, number>();
    for (const id of ORC_BUILD_PRIORITY) {
      const wantCount = want.get(id) ?? 0;
      const haveCount = have.get(id) ?? 0;
      const claimedCount = claimed.get(id) ?? 0;
      claimed.set(id, claimedCount + 1);

      // If we still need this entry (total want > total have), it is the target.
      if (haveCount < wantCount && (claimed.get(id) ?? 0) <= wantCount - haveCount) {
        return [id];
      }
    }

    return null;
  }

  /**
   * Returns the EntityId of an idle worker owned by this AI player, or
   * NULL_ENTITY if none found.
   *
   * A worker is idle when:
   *  - Its HarvesterComponent state is 'idle' (or it has no harvester), AND
   *  - Its MovementComponent has no active target.
   *
   * The isWorker flag on UnitComponent is authoritative (design session Q6).
   */
  private _findIdleWorker(ctx: AIContext): number {
    const world = this._world;

    for (const [entity, unit] of world.query(UnitType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== ctx.playerId) continue;
      if (!unit.isWorker) continue;

      // Skip workers actively harvesting.
      const harvester = world.getComponent(entity, HarvesterType);
      if (harvester !== undefined && harvester.state !== 'idle') continue;

      // Skip workers already moving somewhere.
      const movement = world.getComponent(entity, MovementType);
      if (movement !== undefined && movement.targetX !== undefined) continue;

      return entity;
    }

    return NULL_ENTITY;
  }
}
