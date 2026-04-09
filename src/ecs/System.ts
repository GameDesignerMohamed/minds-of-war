/**
 * ECS System — abstract base class for all game systems.
 *
 * A System encapsulates a single behaviour that operates on entities whose
 * component composition matches the system's query. Systems are registered
 * with and ticked by {@link World}.
 *
 * Design notes:
 * - Systems receive a `World` reference via {@link init} (dependency injection),
 *   not through a constructor parameter, to break the circular import loop
 *   between System and World at the value level. An `import type` is used so
 *   the reference is erased at runtime, keeping the module graph acyclic.
 * - `update` is the only method guaranteed to be called every tick.
 * - `init` and `destroy` are optional lifecycle hooks.
 * - Systems must not store entity state between frames unless that state is
 *   itself a component — all persistent state lives in components.
 */

import type { World } from './World';

// ---------------------------------------------------------------------------
// System Abstract Base
// ---------------------------------------------------------------------------

/**
 * Abstract base class for all ECS systems.
 *
 * Subclass this and implement {@link update}. Override {@link init} and
 * {@link destroy} for setup/teardown logic.
 *
 * @example
 * class MovementSystem extends System {
 *   readonly name = 'MovementSystem';
 *
 *   update(deltaTime: number): void {
 *     for (const [entity, vel] of this.world.query(VelocityType)) {
 *       const pos = this.world.getComponent(entity, PositionType);
 *       if (pos) {
 *         pos.x += vel.vx * deltaTime;
 *         pos.z += vel.vz * deltaTime;
 *       }
 *     }
 *   }
 * }
 */
export abstract class System {
  /**
   * Human-readable identifier for this system, used in profiling traces and
   * error messages. Must be unique within a {@link World} instance.
   */
  abstract readonly name: string;

  /**
   * The {@link World} this system is attached to. Set by {@link World} when the
   * system is registered; not available during construction.
   *
   * Use the `import type` reference to {@link World} to avoid circular runtime
   * imports. The field is declared as `World` here but the concrete value is
   * only assigned after {@link init} is called.
   */
  protected world!: World;

  /** Whether this system should be ticked by the world each update. */
  enabled: boolean = true;

  // -------------------------------------------------------------------------
  // Lifecycle Hooks
  // -------------------------------------------------------------------------

  /**
   * Called once by {@link World.registerSystem} after the system is added.
   *
   * Override this to perform one-time setup that requires access to
   * {@link world} (component subscriptions, resource pre-loading, etc.).
   *
   * @param world - The owning world instance.
   */
  init(world: World): void {
    this.world = world;
  }

  /**
   * Called every simulation tick by {@link World.update}.
   *
   * Implement the core per-frame logic here. This method is only called when
   * {@link enabled} is `true`.
   *
   * @param deltaTime - Elapsed seconds since the last tick. Always positive and
   *   clamped by the game loop to prevent spiral-of-death scenarios.
   */
  abstract update(deltaTime: number): void;

  /**
   * Called by {@link World.unregisterSystem} before removal, and by
   * {@link World.destroy} during world teardown.
   *
   * Override to release subscriptions, timers, or other resources.
   */
  destroy(): void {
    // Default no-op; subclasses override as needed.
  }
}
