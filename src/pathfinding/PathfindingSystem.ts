/**
 * PathfindingSystem — resolves A* paths for entities that need them.
 *
 * Runs before {@link MovementSystem} each tick. Detects entities that have a
 * movement target but no computed waypoints, calls {@link findPath}, and stores
 * the result on {@link MovementComponent.waypoints}.
 *
 * Batch limit:
 * At most {@link MAX_QUERIES_PER_TICK} path queries are processed per tick to
 * keep the AI update within the 2 ms performance budget. Remaining requests
 * are deferred to the next tick.
 *
 * Arrival contract:
 * PathfindingSystem only runs findPath once per target assignment. MovementSystem
 * owns waypoint following. When all waypoints are consumed MovementSystem clears
 * targetX/Z as the final arrival signal — preserving the contract that
 * HarvestSystem polls for undefined to detect arrival.
 *
 * Implements: design/gdd/pathfinding.md — PathfindingSystem section
 *
 * @module pathfinding/PathfindingSystem
 */

import { System } from '@/ecs/System';
import { MovementType, PositionType } from '@/ecs/components/GameComponents';
import { findPath } from './AStar';
import type { TileGrid } from '@/map/TileGrid';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum number of A* queries processed per tick.
 *
 * Prevents frame drops when many units are assigned targets simultaneously.
 * At the performance target of <1 ms per query and a 2 ms AI budget, 16
 * queries would cost up to ~16 ms — tuned down in practice; adjust via config.
 *
 * A* on a 96×96 grid with 2000 max iterations completes in well under 1 ms,
 * so 16 queries per tick keeps pathfinding under ~1 ms total, leaving
 * headroom for other systems.
 */
const MAX_QUERIES_PER_TICK = 16;

// ---------------------------------------------------------------------------
// PathfindingSystem
// ---------------------------------------------------------------------------

/**
 * ECS system that resolves A* paths for entities with pending movement targets.
 *
 * Registration order: must be registered BEFORE MovementSystem so that
 * waypoints are available for MovementSystem to consume in the same tick.
 *
 * @example
 * ```ts
 * const pathfindingSystem = new PathfindingSystem(tileGrid);
 * world.registerSystem(pathfindingSystem);
 * world.registerSystem(new MovementSystem(sceneManager));
 * ```
 */
export class PathfindingSystem extends System {
  readonly name = 'PathfindingSystem';

  private readonly _grid: TileGrid;

  /**
   * @param grid - The tile grid used for all path queries this system processes.
   */
  constructor(grid: TileGrid) {
    super();
    this._grid = grid;
  }

  // -------------------------------------------------------------------------
  // System lifecycle
  // -------------------------------------------------------------------------

  /**
   * Iterates entities with Movement + Position. For each entity that has a
   * movement target but empty waypoints, calls findPath and stores the result.
   *
   * Batch-limited to {@link MAX_QUERIES_PER_TICK} queries. Unreachable targets
   * cause the movement target to be cleared with a console warning.
   *
   * @param _deltaTime - Unused; pathfinding is not time-stepped.
   */
  update(_deltaTime: number): void {
    let queriesThisTick = 0;

    for (const [entity, movement] of this.world.query(MovementType, PositionType)) {
      if (queriesThisTick >= MAX_QUERIES_PER_TICK) {
        break;
      }

      // Skip entities with no active target.
      if (movement.targetX === undefined || movement.targetZ === undefined) {
        continue;
      }

      // Skip entities that already have a computed path waiting to be followed.
      // MovementSystem will work through the waypoints; we only compute once
      // per target assignment.
      if (movement.waypoints.length > 0) {
        continue;
      }

      const pos = this.world.getComponent(entity, PositionType);
      if (pos === undefined) continue;

      queriesThisTick++;

      const path = findPath(this._grid, pos.x, pos.z, movement.targetX, movement.targetZ);

      if (path === null) {
        // Target is unreachable — clear the order so downstream systems
        // (HarvestSystem, ConstructionSystem) are not left waiting forever.
        console.warn(
          `[PathfindingSystem] No path found for entity ${entity} ` +
            `from (${Math.round(pos.x)}, ${Math.round(pos.z)}) ` +
            `to (${movement.targetX}, ${movement.targetZ}). Clearing target.`,
        );
        movement.targetX = undefined;
        movement.targetZ = undefined;
        movement.waypoints = [];
        movement.waypointIndex = 0;
        continue;
      }

      // Store path on the movement component. MovementSystem will follow it.
      // Skip waypoint[0] when it equals the unit's current tile (already there).
      const firstWp = path[0];
      const startIsSelf = Math.round(pos.x) === firstWp.x && Math.round(pos.z) === firstWp.z;

      movement.waypoints = startIsSelf ? path.slice(1) : path;
      movement.waypointIndex = 0;
    }
  }
}
