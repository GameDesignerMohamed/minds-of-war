/**
 * AISystem — ECS System wrapper that drives all AI player controllers each tick.
 *
 * AISystem is a thin orchestrator. It holds the list of {@link AIController}
 * instances created at game setup and calls {@link AIController.update} on each
 * one during the World tick.
 *
 * Construction:
 *  AISystem is constructed with an empty controller list. Callers must call
 *  {@link AISystem.addController} for each AI player after building the
 *  controller hierarchy (AIStateMachine + states + AIController + init()).
 *
 * Registration order:
 *  Register AISystem AFTER all economy, building, and training systems so that
 *  context snapshots pulled during the AI update reflect the same-frame results
 *  from those systems.
 *
 * Performance:
 *  Each AIController.update() is throttled inside its states (accumulator
 *  pattern). AISystem itself has no throttle — it calls every controller every
 *  frame; throttling lives in each individual AIState.
 *
 * Implements: design/gdd/ai-fsm.md — AISystem section
 *
 * @module ai/AISystem
 */

import { System } from '../ecs/System';
import type { AIController } from './AIController';

// ---------------------------------------------------------------------------
// AISystem
// ---------------------------------------------------------------------------

/**
 * ECS System that ticks all registered AI player controllers.
 *
 * @example
 * const aiSystem = new AISystem();
 * world.registerSystem(aiSystem);
 *
 * // After building each AI player's controller:
 * aiSystem.addController(orcController);
 */
export class AISystem extends System {
  readonly name = 'AISystem';

  private readonly _controllers: AIController[] = [];

  // -------------------------------------------------------------------------
  // Controller management
  // -------------------------------------------------------------------------

  /**
   * Adds an already-initialized {@link AIController} to this system's tick list.
   *
   * Call {@link AIController.init} before adding. The controller will receive
   * an `update` call on the next world tick.
   *
   * @param controller - The controller to register.
   */
  addController(controller: AIController): void {
    this._controllers.push(controller);
  }

  /**
   * Removes an {@link AIController} from the tick list and calls its destroy()
   * to clean up event subscriptions.
   *
   * @param controller - The controller to remove.
   */
  removeController(controller: AIController): void {
    const index = this._controllers.indexOf(controller);
    if (index !== -1) {
      this._controllers.splice(index, 1);
      controller.destroy();
    }
  }

  // -------------------------------------------------------------------------
  // System.update
  // -------------------------------------------------------------------------

  /**
   * Ticks every registered AI controller in insertion order.
   *
   * @param deltaTime - Seconds elapsed since the previous tick.
   */
  update(deltaTime: number): void {
    for (const controller of this._controllers) {
      controller.update(deltaTime);
    }
  }

  // -------------------------------------------------------------------------
  // System.destroy
  // -------------------------------------------------------------------------

  /**
   * Destroys all registered controllers (removes their event subscriptions)
   * and clears the controller list.
   */
  override destroy(): void {
    for (const controller of this._controllers) {
      controller.destroy();
    }
    this._controllers.length = 0;
  }
}
