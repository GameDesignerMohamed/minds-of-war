/**
 * Core Game Loop — fixed-timestep simulation with variable-rate rendering.
 *
 * Uses a fixed-timestep accumulator pattern so the simulation always advances
 * in deterministic `tickRate`-sized steps regardless of actual frame time.
 * Rendering (if a render callback is provided) runs at the display rate with a
 * `alpha` interpolation factor for smooth visuals between ticks.
 *
 * Spiral-of-death protection: if a single frame's accumulated time exceeds
 * `maxFrameTime`, the excess is discarded rather than running an unbounded
 * number of simulation ticks.
 *
 * Dependency injection: the loop accepts an `update` callback rather than
 * importing {@link World} directly, keeping this module free of gameplay
 * concerns and trivially testable in isolation.
 *
 * References:
 *   Fix Your Timestep — Gaffer On Games
 *   https://gafferongames.com/post/fix_your_timestep/
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Callback invoked once per fixed simulation tick. */
export type UpdateCallback = (deltaTime: number) => void;

/**
 * Optional render callback invoked every display frame.
 *
 * @param alpha - Interpolation factor [0, 1] between the previous and current
 *   simulation states. Use this to lerp rendered transforms for smooth motion.
 */
export type RenderCallback = (alpha: number) => void;

/** Configuration options for {@link GameLoop}. Values are loaded from config. */
export interface GameLoopConfig {
  /** Target simulation step in seconds. Default: 1/20 (20 Hz). */
  tickRate: number;
  /**
   * Maximum frame time before spiral-of-death protection clamps delta.
   * Default: 0.25 seconds (allows up to ~5 missed ticks before clamping).
   */
  maxFrameTime: number;
}

// ---------------------------------------------------------------------------
// GameLoop
// ---------------------------------------------------------------------------

/**
 * Drives the fixed-timestep simulation loop.
 *
 * @example
 * const loop = new GameLoop(
 *   { tickRate: 1 / 20, maxFrameTime: 0.25 },
 *   (dt) => world.update(dt),
 *   (alpha) => renderer.render(alpha),
 * );
 * loop.start();
 * // ...later:
 * loop.stop();
 */
export class GameLoop {
  private readonly _config: GameLoopConfig;
  private readonly _onUpdate: UpdateCallback;
  private readonly _onRender: RenderCallback | undefined;

  private _running: boolean = false;
  private _rafHandle: number = 0;

  /** Accumulated simulation time not yet consumed by ticks (seconds). */
  private _accumulator: number = 0;

  /** Timestamp of the previous requestAnimationFrame call (milliseconds). */
  private _previousTime: number = 0;

  /**
   * @param config   - Fixed-timestep configuration.
   * @param onUpdate - Simulation tick callback; receives the fixed delta time.
   * @param onRender - Optional render callback; receives interpolation alpha.
   */
  constructor(config: GameLoopConfig, onUpdate: UpdateCallback, onRender?: RenderCallback) {
    this._config = config;
    this._onUpdate = onUpdate;
    this._onRender = onRender;

    // Bind once so the same function reference is used for both rAF and cancel.
    this._tick = this._tick.bind(this);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Starts the game loop. No-op if already running.
   *
   * Schedules the first `requestAnimationFrame` and records the start time.
   */
  start(): void {
    if (this._running) {
      return;
    }
    this._running = true;
    this._accumulator = 0;
    this._previousTime = performance.now();
    this._rafHandle = requestAnimationFrame(this._tick);
  }

  /**
   * Stops the game loop. No-op if not running.
   *
   * Cancels the pending `requestAnimationFrame` and resets timing state.
   */
  stop(): void {
    if (!this._running) {
      return;
    }
    this._running = false;
    cancelAnimationFrame(this._rafHandle);
    this._rafHandle = 0;
    this._accumulator = 0;
  }

  /** Returns `true` if the loop is currently running. */
  get isRunning(): boolean {
    return this._running;
  }

  // -------------------------------------------------------------------------
  // Private Tick
  // -------------------------------------------------------------------------

  /**
   * Internal per-frame callback scheduled via `requestAnimationFrame`.
   *
   * Computes the frame delta, clamps it against `maxFrameTime`, advances the
   * accumulator, runs as many fixed-timestep ticks as it can, then optionally
   * calls the render callback with the fractional alpha.
   *
   * @param timestamp - High-resolution timestamp provided by the browser (ms).
   */
  private _tick(timestamp: number): void {
    if (!this._running) {
      return;
    }

    const { tickRate, maxFrameTime } = this._config;

    // Compute frame delta in seconds, clamped to prevent spiral-of-death.
    const rawDelta = (timestamp - this._previousTime) / 1_000;
    const frameDelta = Math.min(rawDelta, maxFrameTime);
    this._previousTime = timestamp;

    // Accumulate and drain in fixed steps.
    this._accumulator += frameDelta;
    while (this._accumulator >= tickRate) {
      this._onUpdate(tickRate);
      this._accumulator -= tickRate;
    }

    // Render with sub-tick interpolation alpha.
    if (this._onRender !== undefined) {
      const alpha = this._accumulator / tickRate;
      this._onRender(alpha);
    }

    this._rafHandle = requestAnimationFrame(this._tick);
  }
}
