/**
 * MovementSystem — advances units toward their movement target each tick.
 *
 * Implements: design/gdd/movement.md — unit movement mechanic
 *
 * Responsibilities:
 *  1. Iterate every entity with Position + Movement (targetX/Z defined).
 *  2. If waypoints are present (set by PathfindingSystem): move toward
 *     waypoints[waypointIndex]. On arrival at a waypoint, increment the index.
 *     When all waypoints are consumed, clear targetX/Z as the final arrival
 *     signal and empty the waypoints array.
 *  3. If no waypoints but targetX/Z are set: fall back to straight-line
 *     movement (backwards compatibility for callers that don't use pathfinding).
 *  4. On arrival (distance < ARRIVAL_THRESHOLD): clear targetX and targetZ
 *     by setting them to `undefined`. This is the arrival signal that downstream
 *     systems (HarvestSystem, ConstructionSystem) poll to detect arrival.
 *  5. Synchronise the Three.js scene object (if Renderable is present) so the
 *     visual mesh tracks the simulation position every frame.
 *
 * Decision (approved): MovementSystem clears targetX/Z on arrival. HarvestSystem
 * detects undefined to know the worker has reached its destination.
 * Waypoints are followed in order; the arrival signal fires only after the
 * last waypoint is reached, preserving the existing contract.
 *
 * Dependencies injected via constructor:
 *  - SceneManager — to update the Three.js mesh position each frame.
 *
 * @module units/MovementSystem
 */

import { System } from '../ecs/System';
import { PositionType, MovementType, RenderableType } from '../ecs/components/GameComponents';
import type { SceneManager } from '../rendering/SceneManager';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Distance in world units at which a unit is considered to have arrived at its
 * target. Must be smaller than the smallest valid step per frame to avoid
 * overshooting. Loaded as a constant; not exposed to config because it is a
 * numerical tolerance, not a gameplay tuning knob.
 */
const ARRIVAL_THRESHOLD = 0.05;

// ---------------------------------------------------------------------------
// MovementSystem
// ---------------------------------------------------------------------------

/**
 * Moves entities with an active movement order toward their target position.
 *
 * The update loop is zero-allocation: only existing component fields are read
 * and mutated, no new objects are created per tick.
 *
 * @example
 * ```ts
 * const movementSystem = new MovementSystem(sceneManager);
 * world.registerSystem(movementSystem);
 * ```
 */
export class MovementSystem extends System {
  readonly name = 'MovementSystem';

  private readonly _scene: SceneManager;

  /**
   * @param scene - Scene manager used to position the Three.js mesh for
   *   entities that have a RenderableComponent.
   */
  constructor(scene: SceneManager) {
    super();
    this._scene = scene;
  }

  // -------------------------------------------------------------------------
  // System lifecycle
  // -------------------------------------------------------------------------

  /**
   * Advances all active movement orders and synchronises scene mesh positions.
   *
   * When waypoints are present the entity steps toward waypoints[waypointIndex].
   * On waypoint arrival the index is incremented. When the last waypoint is
   * consumed the movement order is cleared (targetX/Z = undefined), which is the
   * downstream arrival signal consumed by HarvestSystem, ConstructionSystem, etc.
   *
   * If no waypoints exist but targetX/Z are defined, the entity moves in a
   * straight line to the target (backwards-compatibility path).
   *
   * @param deltaTime - Elapsed seconds since the last tick. Applied to speed to
   *   produce a frame-rate-independent displacement.
   */
  update(deltaTime: number): void {
    for (const [entity, movement] of this.world.query(MovementType, PositionType)) {
      // No active order — nothing to do.
      if (movement.targetX === undefined || movement.targetZ === undefined) {
        continue;
      }

      const pos = this.world.getComponent(entity, PositionType);
      if (pos === undefined) continue;

      // --- Determine current sub-target ---
      // If waypoints are available, move toward the next waypoint.
      // Otherwise fall back to straight-line toward the final target.
      const hasWaypoints =
        movement.waypoints !== undefined &&
        movement.waypoints.length > 0 &&
        movement.waypointIndex < movement.waypoints.length;

      let subTargetX: number;
      let subTargetZ: number;

      if (hasWaypoints) {
        subTargetX = movement.waypoints[movement.waypointIndex].x;
        subTargetZ = movement.waypoints[movement.waypointIndex].z;
      } else {
        subTargetX = movement.targetX;
        subTargetZ = movement.targetZ;
      }

      // --- Move toward sub-target ---
      const dx = subTargetX - pos.x;
      const dz = subTargetZ - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= ARRIVAL_THRESHOLD) {
        // Arrived at sub-target — snap position.
        pos.x = subTargetX;
        pos.z = subTargetZ;

        if (hasWaypoints) {
          // Advance to next waypoint.
          movement.waypointIndex++;

          // Check if we just consumed the last waypoint.
          if (movement.waypointIndex >= movement.waypoints.length) {
            // All waypoints done — final arrival. Clear the movement order.
            movement.waypoints = [];
            movement.waypointIndex = 0;
            movement.targetX = undefined;
            movement.targetZ = undefined;
          }
          // Otherwise continue; next tick will move to the incremented waypoint.
        } else {
          // Straight-line arrival — clear the order.
          movement.targetX = undefined;
          movement.targetZ = undefined;
        }
      } else {
        // Step toward sub-target by speed × deltaTime, capped to remaining dist.
        const step = Math.min(movement.speed * deltaTime, dist);
        pos.x += (dx / dist) * step;
        pos.z += (dz / dist) * step;
      }

      // Mirror position to the Three.js scene object if one is registered.
      const renderable = this.world.getComponent(entity, RenderableType);
      if (renderable !== undefined && renderable.visible) {
        const mesh = this._scene.getObject(renderable.sceneKey);
        if (mesh !== undefined) {
          mesh.position.x = pos.x;
          mesh.position.z = pos.z;
        }
      }
    }
  }
}
