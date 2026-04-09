/**
 * SelectionRect — canvas-overlay drag selection rectangle.
 *
 * Renders the visual rubber-band selection box as the player drags the cursor.
 * Implemented as a positioned <div> on top of the game canvas for zero GPU
 * overhead. Exposes only start/update/end methods; the caller (an input
 * handler) drives it in response to pointerDown / pointerDrag / pointerUp
 * events.
 *
 * Visual spec:
 * - Border: 1 px solid #3df2c0 (cyan)
 * - Fill:   rgba(61,242,192,0.06)
 * - No border-radius — sharp RTS aesthetic
 *
 * Accessibility: The rect is aria-hidden — it is a visual affordance only.
 *
 * @example
 * const rect = new SelectionRect();
 * rect.mount(document.body);
 *
 * // On drag start:
 * rect.begin({ x: 40, y: 60 });
 *
 * // Each mousemove during drag:
 * rect.update({ x: 180, y: 220 });
 *
 * // On mouse up:
 * const box = rect.end(); // returns { origin, current } for SelectionManager
 *
 * // Teardown:
 * rect.destroy();
 */

import type { Position } from '@/types';

// ---------------------------------------------------------------------------
// SelectionBox — returned by end()
// ---------------------------------------------------------------------------

/**
 * The start and end corners of a completed drag, in the coordinate space
 * used during the drag (typically CSS canvas pixels).
 */
export interface SelectionBox {
  /** The position where the drag began. */
  origin: Position;
  /** The position where the drag ended. */
  current: Position;
}

// ---------------------------------------------------------------------------
// SelectionRect
// ---------------------------------------------------------------------------

/**
 * Renders the drag-select rubber-band rectangle as a DOM overlay.
 *
 * The element lives in a fixed-position container above the canvas and below
 * UI panels (z-index 50).
 */
export class SelectionRect {
  private _container: HTMLElement | null = null;
  private _rectEl: HTMLElement | null = null;

  private _dragging = false;
  private _origin: Position = { x: 0, z: 0 };
  private _current: Position = { x: 0, z: 0 };

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Creates the overlay container and rect element and appends them to `parent`.
   *
   * @param parent - Element to append into, typically `document.body`.
   */
  mount(parent: HTMLElement): void {
    if (this._container !== null) return;

    this._container = document.createElement('div');
    Object.assign(this._container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '50',
      overflow: 'hidden',
    } satisfies Partial<CSSStyleDeclaration>);
    this._container.setAttribute('aria-hidden', 'true');

    this._rectEl = document.createElement('div');
    Object.assign(this._rectEl.style, {
      position: 'absolute',
      display: 'none',
      border: '1px solid #3df2c0',
      background: 'rgba(61,242,192,0.06)',
      // No border-radius — RTS aesthetic
    } satisfies Partial<CSSStyleDeclaration>);

    this._container.appendChild(this._rectEl);
    parent.appendChild(this._container);
  }

  /** Removes the overlay from the DOM. */
  destroy(): void {
    this._container?.remove();
    this._container = null;
    this._rectEl = null;
    this._dragging = false;
  }

  // -------------------------------------------------------------------------
  // Drag control API
  // -------------------------------------------------------------------------

  /**
   * Begins a new drag at the given position.
   *
   * @param pos - Starting canvas-space position (CSS pixels).
   */
  begin(pos: Position): void {
    this._dragging = true;
    this._origin = { ...pos };
    this._current = { ...pos };
    this._applyRect();
    if (this._rectEl !== null) {
      this._rectEl.style.display = 'block';
    }
  }

  /**
   * Updates the drag rectangle's live end corner.
   *
   * Should be called on every mousemove event during an active drag.
   * No-op if {@link begin} has not been called.
   *
   * @param pos - Current cursor position (CSS pixels).
   */
  update(pos: Position): void {
    if (!this._dragging) return;
    this._current = { ...pos };
    this._applyRect();
  }

  /**
   * Ends the drag, hides the rect, and returns the completed box.
   *
   * After calling this method the rect is hidden and the instance is ready
   * for the next drag cycle. Returns `null` if no drag was active.
   *
   * @returns The completed {@link SelectionBox}, or `null` if not dragging.
   */
  end(): SelectionBox | null {
    if (!this._dragging) return null;

    const box: SelectionBox = {
      origin: { ...this._origin },
      current: { ...this._current },
    };

    this._dragging = false;
    if (this._rectEl !== null) {
      this._rectEl.style.display = 'none';
    }

    return box;
  }

  /**
   * Cancels an in-progress drag without returning a selection box.
   *
   * Use this when the drag is interrupted (e.g., window loses focus).
   */
  cancel(): void {
    this._dragging = false;
    if (this._rectEl !== null) {
      this._rectEl.style.display = 'none';
    }
  }

  /** Returns `true` if a drag is currently in progress. */
  get isDragging(): boolean {
    return this._dragging;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Recomputes and applies the CSS geometry of the rect element from the
   * current origin and cursor positions.
   *
   * Uses `left/top/width/height` (not `transform`) so the element occupies
   * the correct bounding box in the stacking context without any matrix math.
   * Handles all four drag directions correctly by computing min/max inline.
   */
  private _applyRect(): void {
    if (this._rectEl === null) return;

    const x1 = this._origin.x;
    const z1 = this._origin.z;
    const x2 = this._current.x;
    const z2 = this._current.z;

    const left = Math.min(x1, x2);
    const top = Math.min(z1, z2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(z2 - z1);

    this._rectEl.style.left = `${left}px`;
    this._rectEl.style.top = `${top}px`;
    this._rectEl.style.width = `${width}px`;
    this._rectEl.style.height = `${height}px`;
  }
}
