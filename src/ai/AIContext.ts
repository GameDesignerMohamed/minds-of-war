/**
 * AIContext — shared mutable blackboard passed to every AI state each tick.
 *
 * The context is the single data-sharing contract between the AIController and
 * each concrete AIState. States read inputs from it and write outputs back to it
 * so that the controller can act on their decisions without coupling states to
 * each other.
 *
 * Design notes:
 * - All fields are plain values — no methods, no ECS references. States receive
 *   the World and ResourceTracker separately so the context stays serializable
 *   and easy to snapshot for debugging.
 * - `previousStateName` is set by AIController BEFORE forcing a DefenseOverride
 *   transition, so DefenseOverride can restore the prior state on exit.
 * - Supply counts are refreshed by AISystem each tick before passing the context
 *   down to the active state, so states always read current values.
 *
 * Implements: design/gdd/ai-fsm.md — AIContext section
 *
 * @module ai/AIContext
 */

import type { EntityId } from '../types';

// ---------------------------------------------------------------------------
// AIContext
// ---------------------------------------------------------------------------

/**
 * Shared blackboard for all AI states owned by a single AIController.
 *
 * One AIContext instance is created per AI player and lives for the duration of
 * the game session. AISystem refreshes the read-only snapshot fields each tick
 * before handing control to the active state.
 *
 * @example
 * // Inside a state's update():
 * if (ctx.supplyUsed >= ctx.attackSupplyThreshold) {
 *   return 'AttackState';
 * }
 */
export interface AIContext {
  // -------------------------------------------------------------------------
  // Player identity
  // -------------------------------------------------------------------------

  /** Player identifier matching OwnerComponent.playerId ('human' | 'orc'). */
  readonly playerId: string;

  // -------------------------------------------------------------------------
  // Economy snapshot — refreshed by AISystem each tick
  // -------------------------------------------------------------------------

  /** Current gold balance of this AI player. */
  gold: number;

  /** Current wood balance of this AI player. */
  wood: number;

  /** Units of supply currently consumed by the AI's living units. */
  supplyUsed: number;

  /** Current maximum supply cap (buildings provide this). */
  supplyCap: number;

  // -------------------------------------------------------------------------
  // Worker counts — computed by AISystem each tick
  // -------------------------------------------------------------------------

  /** How many worker units are alive and owned by this AI. */
  workerCount: number;

  // -------------------------------------------------------------------------
  // Army counts — computed by AISystem each tick
  // -------------------------------------------------------------------------

  /** How many non-worker combat units are alive and owned by this AI. */
  armySize: number;

  // -------------------------------------------------------------------------
  // Building presence flags — computed by AISystem each tick
  // -------------------------------------------------------------------------

  /**
   * Set of building IDs (from BuildingComponent.buildingId) for buildings
   * that are fully complete and owned by this AI. Used by BuildState to avoid
   * issuing duplicate build orders.
   */
  completedBuildings: Set<string>;

  /**
   * Set of building IDs currently under construction (ConstructionComponent
   * present). Prevents BuildState from queuing redundant builds.
   */
  buildingsUnderConstruction: Set<string>;

  // -------------------------------------------------------------------------
  // HQ entity reference
  // -------------------------------------------------------------------------

  /**
   * EntityId of the AI's stronghold / keep entity. Used by BuildState when
   * issuing TechTree research via TechTreeSystem. NULL_ENTITY (0) if not yet
   * found.
   */
  hqEntity: EntityId;

  // -------------------------------------------------------------------------
  // Defense state bookkeeping
  // -------------------------------------------------------------------------

  /**
   * Name of the state that was active when DefenseOverride was triggered.
   * Set by AIController before the forced transition; read by DefenseOverride
   * on exit to restore the previous state.
   *
   * Empty string when no defense is pending.
   */
  previousStateName: string;

  /**
   * Accumulated seconds since DefenseOverride became active.
   * Reset to 0 when DefenseOverride exits.
   */
  defenseTimer: number;
}
