/**
 * AIController — top-level brain for a single AI player.
 *
 * One AIController exists per AI-controlled player. It owns:
 *  - The {@link AIStateMachine} driving high-level state transitions.
 *  - The {@link AIContext} blackboard shared by all states.
 *  - Event subscriptions (BUILDING_DESTROYED) that trigger DefenseOverride.
 *
 * Responsibilities:
 *  - Populate the AIContext snapshot each tick from ResourceTracker and World.
 *  - Drive the FSM update call.
 *  - Listen for BUILDING_DESTROYED events targeting the AI's buildings and force
 *    a DefenseOverride transition when triggered.
 *
 * The controller does NOT tick itself — AISystem calls {@link AIController.update}
 * each frame after populating the economic snapshot.
 *
 * Construction:
 *  Pass an already-configured {@link AIStateMachine} (states registered, not
 *  yet started) and a pre-built {@link AIContext}. The controller calls
 *  `fsm.start('EcoState', ctx)` during its own {@link AIController.init}.
 *
 * Implements: design/gdd/ai-fsm.md — AIController section
 *
 * @module ai/AIController
 */

import type { AIContext } from './AIContext';
import type { AIStateMachine } from './AIStateMachine';
import type { ResourceTracker } from '../economy/ResourceTracker';
import type { EventBus, Unsubscribe } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { World } from '../ecs/World';
import type { AIBehaviorProfile } from '../config/ConfigLoader';
import {
  OwnerType,
  BuildingType,
  ConstructionType,
  UnitType,
} from '../ecs/components/GameComponents';
import { NULL_ENTITY } from '../ecs/Entity';

// ---------------------------------------------------------------------------
// AIController
// ---------------------------------------------------------------------------

/**
 * Orchestrates one AI player's decision loop.
 *
 * @example
 * const ctrl = new AIController(
 *   'orc', profile, fsm, ctx, world, tracker, eventBus,
 * );
 * ctrl.init();
 *
 * // Per tick (called by AISystem):
 * ctrl.update(deltaTime);
 *
 * // Teardown:
 * ctrl.destroy();
 */
export class AIController {
  private readonly _playerId: string;
  private readonly _profile: AIBehaviorProfile;
  private readonly _fsm: AIStateMachine<AIContext>;
  private readonly _ctx: AIContext;
  private readonly _world: World;
  private readonly _tracker: ResourceTracker;
  private readonly _bus: EventBus<GameEvents>;

  /** EventBus unsubscribe handles — cleaned up in destroy(). */
  private readonly _unsubs: Unsubscribe[] = [];

  /**
   * @param playerId - Matches OwnerComponent.playerId ('human' | 'orc').
   * @param profile  - The AI difficulty profile slice (e.g. config.aiBehavior['normal']).
   * @param fsm      - A configured but not-yet-started AIStateMachine.
   * @param ctx      - The pre-built AIContext for this player.
   * @param world    - ECS world (for context snapshot queries).
   * @param tracker  - ResourceTracker (for gold/wood/supply snapshot).
   * @param bus      - Game-wide event bus (for BUILDING_DESTROYED subscription).
   */
  constructor(
    playerId: string,
    profile: AIBehaviorProfile,
    fsm: AIStateMachine<AIContext>,
    ctx: AIContext,
    world: World,
    tracker: ResourceTracker,
    bus: EventBus<GameEvents>,
  ) {
    this._playerId = playerId;
    this._profile = profile;
    this._fsm = fsm;
    this._ctx = ctx;
    this._world = world;
    this._tracker = tracker;
    this._bus = bus;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Starts the FSM in EcoState and wires event subscriptions.
   *
   * Call once after construction, before the first update tick.
   */
  init(): void {
    this._subscribeToEvents();
    this._fsm.start('EcoState', this._ctx);
  }

  /**
   * Called every tick by AISystem after the context snapshot has been refreshed.
   *
   * Delegates to the FSM, which ticks the active state and performs any
   * requested transitions.
   *
   * @param deltaTime - Seconds elapsed since the last tick.
   */
  update(deltaTime: number): void {
    this._refreshContext();
    this._fsm.update(this._ctx, deltaTime);
  }

  /**
   * Removes all event subscriptions. Call when the game session ends.
   */
  destroy(): void {
    for (const unsub of this._unsubs) unsub();
    this._unsubs.length = 0;
  }

  // -------------------------------------------------------------------------
  // Context snapshot refresh
  // -------------------------------------------------------------------------

  /**
   * Populates all derived fields on the AIContext from live ECS and economy data.
   *
   * Called at the top of every update() so states always see current values.
   * This is O(N) over entities with OwnerComponent — acceptable given the small
   * entity counts in an RTS (< 200 entities per faction).
   */
  private _refreshContext(): void {
    // --- Economy snapshot from ResourceTracker ---
    const resources = this._tracker.getResources(this._playerId);
    if (resources !== undefined) {
      this._ctx.gold = resources.gold;
      this._ctx.wood = resources.wood;
      this._ctx.supplyUsed = resources.supplyUsed;
      this._ctx.supplyCap = resources.supplyCap;
    }

    // --- Reset per-tick computed fields ---
    this._ctx.workerCount = 0;
    this._ctx.armySize = 0;
    this._ctx.completedBuildings.clear();
    this._ctx.buildingsUnderConstruction.clear();
    this._ctx.hqEntity = NULL_ENTITY;

    const world = this._world;

    // --- Count units owned by this player ---
    for (const [entity, unit] of world.query(UnitType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== this._playerId) continue;

      if (unit.isWorker) {
        this._ctx.workerCount += 1;
      } else {
        this._ctx.armySize += 1;
      }
    }

    // --- Catalog buildings owned by this player ---
    for (const [entity, building] of world.query(BuildingType, OwnerType)) {
      const owner = world.getComponent(entity, OwnerType);
      if (owner?.playerId !== this._playerId) continue;

      if (world.hasComponent(entity, ConstructionType)) {
        this._ctx.buildingsUnderConstruction.add(building.buildingId);
      } else {
        this._ctx.completedBuildings.add(building.buildingId);
      }

      // The stronghold/HQ is the building that is not under construction
      // and matches the faction's HQ building ID.
      if (building.buildingId === 'stronghold' && !world.hasComponent(entity, ConstructionType)) {
        this._ctx.hqEntity = entity;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Event subscriptions
  // -------------------------------------------------------------------------

  private _subscribeToEvents(): void {
    this._unsubs.push(
      this._bus.on('BUILDING_DESTROYED', (e) => {
        // Only react when one of OUR buildings is attacked.
        if (e.playerId !== this._playerId) return;
        if (!this._profile.defenseOverride.triggerOnBuildingAttacked) return;

        // Record where we came from so DefenseOverride can return.
        this._ctx.previousStateName = this._fsm.activeStateName ?? 'EcoState';
        this._ctx.defenseTimer = 0;

        this._fsm.forceTransition('DefenseOverride', this._ctx);
      }),
    );
  }
}
