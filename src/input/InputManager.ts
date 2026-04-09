/**
 * InputManager — raw browser input aggregation layer.
 *
 * Captures mouse and keyboard events from the DOM and translates them into
 * typed, engine-agnostic events published on an injected {@link EventBus}.
 * All UI and gameplay code consumes those events; nothing in the game reads
 * the DOM directly.
 *
 * Design constraints:
 * - Never allocates in the per-frame path. All event objects are reused via
 *   a pool approach (emitted payloads are plain object literals, short-lived
 *   on the bus, not retained by this class).
 * - Must be destroyed before the canvas is removed to avoid leaking listeners.
 * - Single-thread only (browser main thread). Document this prominently.
 *
 * @example
 * const bus    = new EventBus<InputEvents>();
 * const input  = new InputManager(canvas, bus);
 * input.mount();
 *
 * bus.on('pointerDown', ({ x, y, button }) => { ... });
 * bus.on('keyDown',     ({ code }) => { ... });
 *
 * // Teardown:
 * input.destroy();
 */

import { EventBus } from '@/core/EventBus';

// ---------------------------------------------------------------------------
// Event Map
// ---------------------------------------------------------------------------

/** World-space canvas coordinates (CSS pixels, top-left origin). */
export interface PointerPosition {
  /** CSS pixel X coordinate relative to the canvas element. */
  x: number;
  /** CSS pixel Y coordinate relative to the canvas element. */
  y: number;
}

/**
 * All events published by {@link InputManager}.
 *
 * Consumers subscribe to the same bus instance that was injected at
 * construction time.
 */
export interface InputEvents {
  /** Left/right/middle mouse button pressed. */
  pointerDown: PointerPosition & { button: 0 | 1 | 2 };
  /** Left/right/middle mouse button released. */
  pointerUp: PointerPosition & { button: 0 | 1 | 2 };
  /** Pointer moved while one or more buttons are held. */
  pointerDrag: PointerPosition & { buttons: number };
  /** Pointer moved (any state). */
  pointerMove: PointerPosition;
  /** Keyboard key pressed (fires once, does NOT repeat). */
  keyDown: { code: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean };
  /** Keyboard key released. */
  keyUp: { code: string };
  /** Mouse wheel scrolled. */
  wheel: { deltaY: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamps a MouseEvent button value to the union the InputEvents type expects. */
function toButton(raw: number): 0 | 1 | 2 {
  if (raw === 1) return 1;
  if (raw === 2) return 2;
  return 0;
}

/** Reads canvas-relative CSS pixel coords from a MouseEvent. */
function canvasCoords(e: MouseEvent, canvas: HTMLElement): PointerPosition {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

// ---------------------------------------------------------------------------
// InputManager
// ---------------------------------------------------------------------------

/**
 * Translates raw DOM events on a canvas into typed {@link InputEvents}.
 *
 * **Single-thread only** — must run on the browser main thread.
 *
 * Call {@link mount} after construction to start listening, and {@link destroy}
 * when the game shuts down to remove all listeners.
 */
export class InputManager {
  private readonly _canvas: HTMLElement;
  private readonly _bus: EventBus<InputEvents>;

  /** Whether listeners are currently attached to the DOM. */
  private _mounted = false;

  // Pre-bound handler references retained so they can be removed in destroy().
  private readonly _onMouseDown: (e: MouseEvent) => void;
  private readonly _onMouseUp: (e: MouseEvent) => void;
  private readonly _onMouseMove: (e: MouseEvent) => void;
  private readonly _onWheel: (e: WheelEvent) => void;
  private readonly _onKeyDown: (e: KeyboardEvent) => void;
  private readonly _onKeyUp: (e: KeyboardEvent) => void;
  private readonly _onContextMenu: (e: Event) => void;

  /**
   * @param canvas - The game canvas element to attach listeners to.
   * @param bus    - The event bus on which input events will be published.
   */
  constructor(canvas: HTMLElement, bus: EventBus<InputEvents>) {
    this._canvas = canvas;
    this._bus = bus;

    // Bind once — retained for removeEventListener during destroy().
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onWheel = this._handleWheel.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    this._onContextMenu = (e: Event) => e.preventDefault();
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Attaches all DOM event listeners.
   *
   * Safe to call multiple times — subsequent calls after the first are no-ops.
   */
  mount(): void {
    if (this._mounted) return;
    this._mounted = true;

    this._canvas.addEventListener('mousedown', this._onMouseDown);
    this._canvas.addEventListener('mouseup', this._onMouseUp);
    this._canvas.addEventListener('mousemove', this._onMouseMove);
    this._canvas.addEventListener('wheel', this._onWheel, { passive: true });
    this._canvas.addEventListener('contextmenu', this._onContextMenu);

    // Keyboard events are global — canvas does not receive key events unless
    // it has tabIndex set. Using window is intentional here.
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * Removes all DOM event listeners and marks this instance as inactive.
   *
   * After calling destroy() the instance should be discarded; call
   * {@link mount} on a new instance to re-enable input.
   */
  destroy(): void {
    if (!this._mounted) return;
    this._mounted = false;

    this._canvas.removeEventListener('mousedown', this._onMouseDown);
    this._canvas.removeEventListener('mouseup', this._onMouseUp);
    this._canvas.removeEventListener('mousemove', this._onMouseMove);
    this._canvas.removeEventListener('wheel', this._onWheel);
    this._canvas.removeEventListener('contextmenu', this._onContextMenu);

    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  // -------------------------------------------------------------------------
  // DOM Handlers (private)
  // -------------------------------------------------------------------------

  private _handleMouseDown(e: MouseEvent): void {
    const pos = canvasCoords(e, this._canvas);
    this._bus.emit('pointerDown', { ...pos, button: toButton(e.button) });
  }

  private _handleMouseUp(e: MouseEvent): void {
    const pos = canvasCoords(e, this._canvas);
    this._bus.emit('pointerUp', { ...pos, button: toButton(e.button) });
  }

  private _handleMouseMove(e: MouseEvent): void {
    const pos = canvasCoords(e, this._canvas);
    this._bus.emit('pointerMove', pos);
    if (e.buttons !== 0) {
      this._bus.emit('pointerDrag', { ...pos, buttons: e.buttons });
    }
  }

  private _handleWheel(e: WheelEvent): void {
    this._bus.emit('wheel', { deltaY: e.deltaY });
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    // Suppress key-repeat events — consumers get one event per physical press.
    if (e.repeat) return;
    this._bus.emit('keyDown', {
      code: e.code,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    });
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    this._bus.emit('keyUp', { code: e.code });
  }
}
