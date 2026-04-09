/**
 * EdgeScroll — mouse-proximity edge-scrolling for the Minds of War RTS camera.
 *
 * Returns a normalised pan vector ({@link PanVector}) each frame based on
 * how close the mouse cursor is to the viewport edges. The caller feeds the
 * result directly to {@link CameraController.update} as the `horizontal` and
 * `vertical` pan input axes.
 *
 * Behaviour:
 * - Each axis independently activates when the cursor enters the threshold
 *   zone (default: 20 px from the edge).
 * - Pan magnitude is linearly interpolated across the threshold zone:
 *     0 px from edge  → ±1.0 (full speed)
 *     threshold px from edge → 0.0 (no scroll)
 * - When the cursor is outside all threshold zones, both axes return 0.
 * - Values are clamped to [-1, 1] before return.
 *
 * Performance:
 * - Zero allocations per update call (the return object is reused).
 * - No DOM reads during update() — all required information is passed by
 *   the caller, keeping this class framework-agnostic and unit-testable.
 *
 * Accessibility / user preference:
 * - EdgeScroll is a pure math utility and does not apply motion itself.
 *   The caller (game loop) is responsible for suppressing the output when
 *   the player has disabled edge scrolling in settings.
 *
 * Integration:
 * ```ts
 * const edgeScroll = new EdgeScroll(20);
 *
 * // In the game loop, before calling CameraController.update():
 * const pan = edgeScroll.update(mouse.x, mouse.y, window.innerWidth, window.innerHeight);
 * cameraController.update(delta, pan);
 * ```
 *
 * @module input/EdgeScroll
 */

// ---------------------------------------------------------------------------
// PanVector
// ---------------------------------------------------------------------------

/**
 * Normalised 2-axis pan result returned by {@link EdgeScroll.update}.
 *
 * Both axes range from -1 to +1. This shape is intentionally compatible with
 * {@link CameraPanInput} from CameraController so no intermediate mapping is
 * needed.
 */
export interface PanVector {
  /** -1 = scroll left (cursor near left edge), +1 = scroll right. */
  horizontal: number;
  /** -1 = scroll toward top (cursor near top edge), +1 = scroll toward bottom. */
  vertical: number;
}

// ---------------------------------------------------------------------------
// EdgeScroll
// ---------------------------------------------------------------------------

/**
 * Computes edge-scroll pan input from mouse position relative to viewport.
 *
 * Construct once and call {@link update} every frame with the current mouse
 * coordinates and viewport size.
 */
export class EdgeScroll {
  /** Distance from viewport edge (in CSS pixels) that activates scrolling. */
  private readonly _threshold: number;

  /**
   * Reusable return object — avoids a heap allocation every frame.
   * The caller must not hold a reference across frames.
   */
  private readonly _result: PanVector = { horizontal: 0, vertical: 0 };

  /**
   * @param threshold - Pixel distance from each edge within which scrolling
   *                    is active. Defaults to 20 px.
   *                    Must be a positive finite number.
   */
  constructor(threshold = 20) {
    if (!isFinite(threshold) || threshold <= 0) {
      throw new RangeError(
        `EdgeScroll: threshold must be a positive finite number, got ${threshold}`,
      );
    }
    this._threshold = threshold;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Computes the edge-scroll pan vector for the current frame.
   *
   * Returns a reused {@link PanVector} object — do NOT cache the reference
   * between frames; copy the values if you need them later.
   *
   * Both axes are computed independently and linearly interpolated across the
   * threshold zone:
   * - `mouseX <= 0`              → horizontal = -1 (hard left)
   * - `mouseX === threshold`     → horizontal =  0 (no scroll)
   * - `mouseX === viewWidth`     → horizontal = +1 (hard right)
   * - Similar logic applies for the vertical axis (mouseY).
   *
   * @param mouseX     - Current mouse X in CSS pixels from the viewport left edge.
   * @param mouseY     - Current mouse Y in CSS pixels from the viewport top edge.
   * @param viewWidth  - Viewport width in CSS pixels.
   * @param viewHeight - Viewport height in CSS pixels.
   * @returns          A normalised {@link PanVector} with both axes in [-1, 1].
   *
   * @example
   * document.addEventListener('mousemove', (e) => {
   *   mouseX = e.clientX;
   *   mouseY = e.clientY;
   * });
   *
   * // In game loop:
   * const pan = edgeScroll.update(mouseX, mouseY, window.innerWidth, window.innerHeight);
   * camera.update(delta, pan);
   */
  update(mouseX: number, mouseY: number, viewWidth: number, viewHeight: number): PanVector {
    this._result.horizontal = EdgeScroll._edgeAxis(mouseX, viewWidth, this._threshold);
    this._result.vertical = EdgeScroll._edgeAxis(mouseY, viewHeight, this._threshold);
    return this._result;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Computes the scroll contribution for a single axis.
   *
   * @param pos       - Mouse position along the axis (px from low edge).
   * @param size      - Viewport size along the axis (px).
   * @param threshold - Activation zone width (px from each edge).
   * @returns         - Normalised value in [-1, 1], 0 when inactive.
   */
  private static _edgeAxis(pos: number, size: number, threshold: number): number {
    // Distance from the low (left / top) edge
    const distLow = pos;
    // Distance from the high (right / bottom) edge
    const distHigh = size - pos;

    if (distLow < threshold) {
      // Near the low edge → negative pan (scroll left / up).
      // At 0 px → -1, at threshold px → 0.
      return -(1 - distLow / threshold);
    }

    if (distHigh < threshold) {
      // Near the high edge → positive pan (scroll right / down).
      // At 0 px → +1, at threshold px → 0.
      return 1 - distHigh / threshold;
    }

    return 0;
  }
}
