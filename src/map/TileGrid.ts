/**
 * TileGrid — 96×96 walkability and terrain cost grid for Minds of War.
 *
 * Provides a flat-array-backed spatial lookup for pathfinding, unit movement,
 * and building placement. All queries are O(1). Two typed arrays are used to
 * keep memory footprint minimal and avoid garbage collection pressure in hot
 * pathfinding loops (zero-allocation reads).
 *
 * Implements: design/gdd/map-system.md — Tile Grid section
 *
 * @module map/TileGrid
 */

import type { Position } from '../types';

// ---------------------------------------------------------------------------
// TileGrid
// ---------------------------------------------------------------------------

/**
 * Fixed-size walkability and movement-cost grid for the simulation map.
 *
 * Internal storage uses two flat typed arrays indexed by `z * width + x`:
 * - `_walkable`  — Uint8Array: 1 = walkable, 0 = blocked
 * - `_cost`      — Float32Array: movement cost multiplier (1.0 = normal speed)
 *
 * Defaults on construction: all tiles walkable, cost 1.0.
 *
 * @example
 * const grid = new TileGrid(96, 96);
 * grid.setWalkable(10, 20, false); // block a tile
 * const cost = grid.getTerrainCost(5, 5); // 1.0
 * const neighbors = grid.getNeighbors(10, 10);
 */
export class TileGrid {
  /** Grid width in tiles (number of columns). */
  readonly width: number;

  /** Grid height in tiles (number of rows). */
  readonly height: number;

  /**
   * Flat walkability array. Index = z * width + x.
   * Value: 1 = walkable, 0 = blocked.
   */
  private readonly _walkable: Uint8Array;

  /**
   * Flat terrain-cost array. Index = z * width + x.
   * Value: movement cost multiplier. 1.0 = normal, >1 = slower.
   */
  private readonly _cost: Float32Array;

  /**
   * Pre-allocated neighbor result buffer. Reused each {@link getNeighbors}
   * call to satisfy the zero-allocation requirement for hot pathfinding loops.
   *
   * Callers must not hold references to the returned array across frames —
   * it is overwritten on every call.
   */
  private readonly _neighborBuffer: Position[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    const size = width * height;
    this._walkable = new Uint8Array(size);
    this._cost = new Float32Array(size);

    // Initialize defaults: all walkable, cost 1.0.
    this._walkable.fill(1);
    this._cost.fill(1.0);

    // Pre-allocate worst-case neighbor buffer (4-connected grid = max 4 neighbors).
    this._neighborBuffer = [
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
    ];
  }

  // -------------------------------------------------------------------------
  // Bounds
  // -------------------------------------------------------------------------

  /**
   * Returns `true` if (x, z) is within the grid dimensions.
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  isInBounds(x: number, z: number): boolean {
    return x >= 0 && x < this.width && z >= 0 && z < this.height;
  }

  // -------------------------------------------------------------------------
  // Walkability
  // -------------------------------------------------------------------------

  /**
   * Returns `true` if the tile at (x, z) is walkable by ground units.
   *
   * Out-of-bounds coordinates return `false` (treat map edges as walls).
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  isWalkable(x: number, z: number): boolean {
    if (!this.isInBounds(x, z)) {
      return false;
    }
    return this._walkable[z * this.width + x] === 1;
  }

  /**
   * Sets the walkable flag for the tile at (x, z).
   *
   * No-op for out-of-bounds coordinates.
   *
   * @param x        - Column index.
   * @param z        - Row index.
   * @param walkable - `true` to allow movement, `false` to block.
   */
  setWalkable(x: number, z: number, walkable: boolean): void {
    if (!this.isInBounds(x, z)) {
      return;
    }
    this._walkable[z * this.width + x] = walkable ? 1 : 0;
  }

  // -------------------------------------------------------------------------
  // Terrain Cost
  // -------------------------------------------------------------------------

  /**
   * Returns the movement-cost multiplier for the tile at (x, z).
   *
   * Out-of-bounds coordinates return `Infinity` so pathfinders treat them as
   * impassable without a separate bounds check.
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  getTerrainCost(x: number, z: number): number {
    if (!this.isInBounds(x, z)) {
      return Infinity;
    }
    return this._cost[z * this.width + x];
  }

  /**
   * Sets the terrain cost for the tile at (x, z).
   *
   * No-op for out-of-bounds coordinates.
   *
   * @param x    - Column index.
   * @param z    - Row index.
   * @param cost - Movement cost multiplier. Must be > 0.
   */
  setTerrainCost(x: number, z: number, cost: number): void {
    if (!this.isInBounds(x, z)) {
      return;
    }
    this._cost[z * this.width + x] = cost;
  }

  // -------------------------------------------------------------------------
  // Neighbor Query
  // -------------------------------------------------------------------------

  /**
   * Returns the walkable 4-connected neighbors of (x, z).
   *
   * IMPORTANT — Zero-allocation contract:
   * The returned array is a pre-allocated internal buffer that is mutated and
   * reused on every call. Callers must consume the result immediately and must
   * not store a reference to the array across multiple calls.
   *
   * Diagonal movement is intentionally excluded — Minds of War uses a 4-connected
   * grid for ground units.
   *
   * @param x - Column index.
   * @param z - Row index.
   * @returns A slice of the internal buffer containing walkable neighbor positions.
   *   The length varies (0–4 depending on walls and bounds).
   *
   * @example
   * const neighbors = grid.getNeighbors(5, 5);
   * for (const n of neighbors) {
   *   // n.x, n.z — safe to read here only
   * }
   */
  getNeighbors(x: number, z: number): Position[] {
    let count = 0;

    // Cardinal directions: North, South, West, East.
    const candidates: [number, number][] = [
      [x, z - 1],
      [x, z + 1],
      [x - 1, z],
      [x + 1, z],
    ];

    for (const [nx, nz] of candidates) {
      if (this.isWalkable(nx, nz)) {
        // Mutate pre-allocated buffer slots.
        this._neighborBuffer[count].x = nx;
        this._neighborBuffer[count].z = nz;
        count++;
      }
    }

    // Return a view into the buffer up to the filled count.
    return this._neighborBuffer.slice(0, count);
  }
}
