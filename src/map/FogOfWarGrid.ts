/**
 * FogOfWarGrid — per-player tile visibility state for a 96×96 map.
 *
 * Tracks two visibility layers per tile:
 * - **visible**  — the tile is currently inside at least one unit's sight
 *   radius this frame. Rendered as full colour.
 * - **explored** — the tile was visible at some earlier point this game.
 *   Rendered as a darkened shroud. Once explored, a tile is never un-explored.
 *
 * Storage: two flat Uint8Array buffers, indexed by `z * width + x`. Using
 * typed arrays keeps the hot-path update loop allocation-free and cache-friendly.
 *
 * Each frame FogOfWarSystem calls {@link beginFrame} to reset the visible layer,
 * then calls {@link reveal} for every tile a unit can see, then reads
 * {@link getState} / {@link getRawVisible} / {@link getRawExplored} to push
 * the result to {@link FogOfWarRenderer}.
 *
 * Implements: design/gdd/fog-of-war.md — FogOfWarGrid section
 *
 * @module map/FogOfWarGrid
 */

// ---------------------------------------------------------------------------
// TileVisibility
// ---------------------------------------------------------------------------

/**
 * The visibility state of a single tile from one player's perspective.
 *
 * - `hidden`   — never seen; opaque black shroud.
 * - `explored` — previously seen; darkened shroud reveals terrain geometry.
 * - `visible`  — currently inside a unit's sight radius; full colour.
 */
export type TileVisibility = 'hidden' | 'explored' | 'visible';

// ---------------------------------------------------------------------------
// FogOfWarGrid
// ---------------------------------------------------------------------------

/**
 * Flat-array visibility grid for a single player.
 *
 * Construct one instance per human player (AI players do not need a FoW grid
 * unless a spectator mode is implemented later).
 *
 * @example
 * const fowGrid = new FogOfWarGrid(96, 96);
 *
 * // Each simulation tick:
 * fowGrid.beginFrame();                 // clear current-frame visible bits
 * fowGrid.reveal(unitX, unitZ);         // called for every tile a unit sees
 * const state = fowGrid.getState(x, z); // 'hidden' | 'explored' | 'visible'
 */
export class FogOfWarGrid {
  /** Grid width in tiles (columns). */
  readonly width: number;

  /** Grid height in tiles (rows). */
  readonly height: number;

  /**
   * Per-tile visibility for the current frame.
   * Index = z * width + x. Value: 0 = not visible, 1 = visible.
   * Reset to all-zero by {@link beginFrame} each tick.
   */
  private readonly _visible: Uint8Array;

  /**
   * Cumulative exploration state across all frames.
   * Index = z * width + x. Value: 0 = never seen, 1 = explored.
   * Monotonically grows — once a tile is explored it is never reset.
   */
  private readonly _explored: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    const size = width * height;
    this._visible = new Uint8Array(size);
    this._explored = new Uint8Array(size);
    // Both arrays default to 0 (Uint8Array zero-initialises automatically).
  }

  // -------------------------------------------------------------------------
  // Frame lifecycle
  // -------------------------------------------------------------------------

  /**
   * Resets all per-frame visibility to 0.
   *
   * Call once at the start of each simulation tick, before any {@link reveal}
   * calls for that tick. Does NOT clear the explored layer.
   *
   * Zero-allocation: uses TypedArray.fill which operates on the existing buffer.
   */
  beginFrame(): void {
    this._visible.fill(0);
  }

  // -------------------------------------------------------------------------
  // Mutation
  // -------------------------------------------------------------------------

  /**
   * Marks tile (x, z) as visible this frame, and permanently explored.
   *
   * Out-of-bounds coordinates are silently ignored so Bresenham loops in
   * {@link FogOfWarSystem} do not need a separate bounds check.
   *
   * @param x - Column index (0 to width - 1).
   * @param z - Row index (0 to height - 1).
   */
  reveal(x: number, z: number): void {
    if (x < 0 || x >= this.width || z < 0 || z >= this.height) {
      return;
    }
    const idx = z * this.width + x;
    this._visible[idx] = 1;
    this._explored[idx] = 1;
  }

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /**
   * Returns the visibility state of tile (x, z) for this player.
   *
   * Out-of-bounds coordinates always return `'hidden'`.
   *
   * @param x - Column index.
   * @param z - Row index.
   * @returns `'visible'` > `'explored'` > `'hidden'` in priority order.
   *
   * @example
   * if (fowGrid.getState(tx, tz) === 'visible') {
   *   renderUnit(tx, tz);
   * }
   */
  getState(x: number, z: number): TileVisibility {
    if (x < 0 || x >= this.width || z < 0 || z >= this.height) {
      return 'hidden';
    }
    const idx = z * this.width + x;
    if (this._visible[idx] === 1) return 'visible';
    if (this._explored[idx] === 1) return 'explored';
    return 'hidden';
  }

  /**
   * Returns `true` if the tile is currently visible (inside a live sight radius).
   *
   * O(1), no allocation. Prefer this over {@link getState} in hot rendering loops
   * where you only need the binary visible/not-visible answer.
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  isVisible(x: number, z: number): boolean {
    if (x < 0 || x >= this.width || z < 0 || z >= this.height) {
      return false;
    }
    return this._visible[z * this.width + x] === 1;
  }

  /**
   * Returns `true` if the tile has ever been revealed (explored or currently visible).
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  isExplored(x: number, z: number): boolean {
    if (x < 0 || x >= this.width || z < 0 || z >= this.height) {
      return false;
    }
    return this._explored[z * this.width + x] === 1;
  }

  // -------------------------------------------------------------------------
  // Raw buffer access (for FogOfWarRenderer — read-only semantics)
  // -------------------------------------------------------------------------

  /**
   * Direct read-only reference to the current-frame visible array.
   *
   * Intended for {@link FogOfWarRenderer} to copy data into a texture without
   * an extra allocation. Callers must not mutate this buffer.
   *
   * Index = z * width + x. Value: 0 or 1.
   */
  get rawVisible(): Readonly<Uint8Array> {
    return this._visible;
  }

  /**
   * Direct read-only reference to the cumulative explored array.
   *
   * Intended for {@link FogOfWarRenderer}. Callers must not mutate this buffer.
   *
   * Index = z * width + x. Value: 0 or 1.
   */
  get rawExplored(): Readonly<Uint8Array> {
    return this._explored;
  }
}
