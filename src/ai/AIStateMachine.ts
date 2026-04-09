/**
 * AIStateMachine — generic, named-state finite state machine for AI controllers.
 *
 * States are registered by string name and implement the {@link AIState}
 * interface. Transitions are driven by return values from {@link AIState.update}:
 * returning a string triggers a transition to the named state; returning `null`
 * or `undefined` keeps the current state active.
 *
 * Lifecycle per state:
 *   enter(ctx) → update(ctx, dt)* → exit(ctx)
 *
 * The FSM supports forced transitions (used by AIController for DefenseOverride)
 * via {@link AIStateMachine.forceTransition}. Both voluntary and forced
 * transitions call exit on the outgoing state and enter on the incoming state.
 *
 * Design notes:
 * - Generic over `TContext` so any context shape can be used without casting.
 * - State names are strings to keep data-driven configuration straightforward.
 * - No transition table — states decide their own successors. This keeps the
 *   logic self-contained and the FSM simple.
 *
 * Implements: design/gdd/ai-fsm.md — AIStateMachine section
 *
 * @module ai/AIStateMachine
 */

// ---------------------------------------------------------------------------
// AIState interface
// ---------------------------------------------------------------------------

/**
 * Interface that every concrete AI state must implement.
 *
 * @typeParam TContext - The shared blackboard type passed to every state method.
 *
 * @example
 * class EcoState implements AIState<AIContext> {
 *   readonly name = 'EcoState';
 *   enter(ctx: AIContext): void { ... }
 *   update(ctx: AIContext, dt: number): string | null { ... }
 *   exit(ctx: AIContext): void { ... }
 * }
 */
export interface AIState<TContext> {
  /** Unique name used to register and look up this state in the FSM. */
  readonly name: string;

  /**
   * Called once when the FSM transitions INTO this state.
   *
   * Use to reset internal accumulators, initialize per-entry data, or log
   * debug information.
   *
   * @param ctx - The shared AI blackboard.
   */
  enter(ctx: TContext): void;

  /**
   * Called every tick while this state is active.
   *
   * Return the name of the next state to transition to, or `null` / `undefined`
   * to remain in the current state.
   *
   * @param ctx        - The shared AI blackboard (pre-populated by AISystem).
   * @param deltaTime  - Seconds elapsed since the last tick.
   * @returns The name of the next state, or null to stay in this state.
   */
  update(ctx: TContext, deltaTime: number): string | null | undefined;

  /**
   * Called once when the FSM transitions OUT OF this state.
   *
   * Use to clean up any per-state side-effects (e.g. clearing issued orders).
   *
   * @param ctx - The shared AI blackboard.
   */
  exit(ctx: TContext): void;
}

// ---------------------------------------------------------------------------
// AIStateMachine
// ---------------------------------------------------------------------------

/**
 * Generic finite state machine for AI controllers.
 *
 * Manages a registry of named {@link AIState} instances and drives the
 * enter/update/exit lifecycle as the active state changes.
 *
 * @typeParam TContext - The shared blackboard type threaded through all states.
 *
 * @example
 * const fsm = new AIStateMachine<AIContext>();
 * fsm.registerState(new EcoState(config));
 * fsm.registerState(new BuildState(config, world, tracker));
 * fsm.start('EcoState', ctx);
 *
 * // In game loop:
 * fsm.update(ctx, deltaTime);
 */
export class AIStateMachine<TContext> {
  private readonly _states: Map<string, AIState<TContext>> = new Map();
  private _active: AIState<TContext> | null = null;

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  /**
   * Registers a state with the FSM.
   *
   * Overwrites any previously registered state with the same name (allows
   * hot-swap of state implementations in tooling, though uncommon at runtime).
   *
   * @param state - The state instance to register.
   */
  registerState(state: AIState<TContext>): void {
    this._states.set(state.name, state);
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Activates the FSM by entering the named initial state.
   *
   * Must be called before any {@link update} calls. No-op if the named state
   * does not exist (logs a warning in debug builds).
   *
   * @param stateName  - Name of the state to start in.
   * @param ctx        - The shared AI blackboard.
   */
  start(stateName: string, ctx: TContext): void {
    const state = this._states.get(stateName);
    if (state === undefined) {
      console.warn(`[AIStateMachine] start: unknown state "${stateName}"`);
      return;
    }
    this._active = state;
    state.enter(ctx);
  }

  /**
   * Ticks the active state and performs any transitions it requests.
   *
   * If the active state's {@link AIState.update} returns a non-null string,
   * `exit` is called on the current state and `enter` on the next. Chains of
   * transitions in a single tick are NOT followed — only one transition per
   * update call (prevents infinite loops).
   *
   * @param ctx       - The shared AI blackboard.
   * @param deltaTime - Seconds elapsed since the last tick.
   */
  update(ctx: TContext, deltaTime: number): void {
    if (this._active === null) return;

    const next = this._active.update(ctx, deltaTime);

    if (next != null && next !== this._active.name) {
      this._transition(next, ctx);
    }
  }

  /**
   * Forces an immediate transition to the named state, bypassing the normal
   * update return path.
   *
   * Used by AIController to trigger DefenseOverride from event handlers that
   * run outside the update loop.
   *
   * No-op if the target state is already active or if the named state does
   * not exist.
   *
   * @param stateName - The state to transition to immediately.
   * @param ctx       - The shared AI blackboard.
   */
  forceTransition(stateName: string, ctx: TContext): void {
    if (this._active?.name === stateName) return;
    this._transition(stateName, ctx);
  }

  /**
   * Returns the name of the currently active state, or `null` if the FSM has
   * not been started.
   */
  get activeStateName(): string | null {
    return this._active?.name ?? null;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _transition(nextName: string, ctx: TContext): void {
    const next = this._states.get(nextName);
    if (next === undefined) {
      console.warn(`[AIStateMachine] transition: unknown state "${nextName}"`);
      return;
    }
    this._active?.exit(ctx);
    this._active = next;
    next.enter(ctx);
  }
}
