/**
 * FogOfWarSystem — ECS system that updates per-player fog-of-war state each tick.
 *
 * Each frame the system:
 * 1. Calls {@link FogOfWarGrid.beginFrame} to clear the visible layer.
 * 2. Queries every entity that has both a PositionComponent and an OwnerComponent.
 * 3. For each such entity, runs a Bresenham-circle reveal:
 *    - Iterates every tile in a diamond of radius `defaultSightRange` (8).
 *    - For each candidate tile, casts a Bresenham line from the unit's tile.
 *    - The line stops at the first unwalkable tile encountered.
 *    - Both the source tile and the first blocking tile are marked visible;
 *      tiles behind the blocker are not revealed (hard LOS occlusion).
 * 4. Notifies {@link FogOfWarRenderer} that the grid is dirty so it uploads
 *    the updated data to the GPU on the next render frame.
 *
 * Sight range: No sightRange field on UnitComponent — all units use the
 * `defaultSightRange` constant (8 tiles). This is the approved simplification
 * for the current milestone. A per-unit override can be added later by
 * reading from a SightComponent without breaking this system's structure.
 *
 * LOS blocker rule: any tile where {@link TileGrid.isWalkable} returns `false`
 * is treated as an opaque blocker (cliffs and trees both block LOS). This is
 * the approved simplification for the current milestone.
 *
 * Implements: design/gdd/fog-of-war.md — FogOfWarSystem section
 *
 * Thread-safety: NOT thread-safe. Must be called from the main simulation thread.
 * Allocation: Zero per-frame heap allocation in the update loop.
 *
 * @module map/FogOfWarSystem
 *
 * @example
 * const fowSystem = new FogOfWarSystem(tileGrid, fowGrid, 'human', renderer);
 * world.registerSystem(fowSystem);
 * // System ticks automatically each frame via world.update(dt).
 */

import { System } from '../ecs/System';
import { PositionType } from '../ecs/components/GameComponents';
import { OwnerType } from '../ecs/components/GameComponents';
import { FogOfWarGrid } from './FogOfWarGrid';
import { TileGrid } from './TileGrid';
import type { FogOfWarRenderer } from '../rendering/FogOfWarRenderer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Default sight radius in tiles for all units.
 *
 * Approved simplification: no per-unit override. All ground units and buildings
 * use this value. Value sourced from design/gdd/fog-of-war.md tuning knobs.
 */
const DEFAULT_SIGHT_RANGE = 8;

// ---------------------------------------------------------------------------
// FogOfWarSystem
// ---------------------------------------------------------------------------

/**
 * Per-player fog-of-war update system.
 *
 * One instance is created per human player. Each instance owns its own
 * {@link FogOfWarGrid} and only reveals tiles for entities owned by
 * {@link localPlayerId}.
 *
 * @example
 * const fowSystem = new FogOfWarSystem(tileGrid, fowGrid, 'human', renderer);
 * world.registerSystem(fowSystem);
 */
export class FogOfWarSystem extends System {
  readonly name = 'FogOfWarSystem';

  /** The walkability grid used for LOS occlusion checks. */
  private readonly _tileGrid: TileGrid;

  /** The visibility state grid this system writes to each tick. */
  private readonly _fowGrid: FogOfWarGrid;

  /**
   * The player ID whose units this system reveals sight for.
   * Matched against OwnerComponent.playerId via strict string equality.
   */
  private readonly _localPlayerId: string;

  /**
   * Reference to the renderer; set via {@link setRenderer} after construction.
   * Optional — if null, the system still updates the grid but skips the GPU upload.
   */
  private _renderer: FogOfWarRenderer | null;

  /**
   * Scratch array for Bresenham line points. Pre-allocated to the maximum number
   * of steps a sight-range-8 ray can take across the grid diagonal. Avoids
   * allocation inside the per-unit, per-ray inner loop.
   *
   * Max ray length: DEFAULT_SIGHT_RANGE + 1 steps (source tile + 8 steps).
   */
  private readonly _rayBuffer: { x: number; z: number }[];

  constructor(
    tileGrid: TileGrid,
    fowGrid: FogOfWarGrid,
    localPlayerId: string,
    renderer: FogOfWarRenderer | null = null,
  ) {
    super();
    this._tileGrid = tileGrid;
    this._fowGrid = fowGrid;
    this._localPlayerId = localPlayerId;
    this._renderer = renderer;

    // Pre-allocate ray scratch buffer: source + up to DEFAULT_SIGHT_RANGE steps.
    const maxSteps = DEFAULT_SIGHT_RANGE + 1;
    this._rayBuffer = Array.from({ length: maxSteps }, () => ({ x: 0, z: 0 }));
  }

  // -------------------------------------------------------------------------
  // Renderer wiring
  // -------------------------------------------------------------------------

  /**
   * Attaches or replaces the renderer that receives dirty notifications.
   *
   * Call this after the renderer is constructed if it was not available at
   * FogOfWarSystem construction time.
   *
   * @param renderer - The renderer to notify, or `null` to detach.
   */
  setRenderer(renderer: FogOfWarRenderer | null): void {
    this._renderer = renderer;
  }

  // -------------------------------------------------------------------------
  // System lifecycle
  // -------------------------------------------------------------------------

  /**
   * Main per-tick update. Reveals tiles visible to all entities owned by the
   * local player, then marks the renderer dirty for a GPU upload.
   *
   * @param _deltaTime - Elapsed seconds since the last tick (unused; FoW is
   *   recalculated fully from current positions each frame).
   */
  update(_deltaTime: number): void {
    // Step 1: reset current-frame visible layer.
    this._fowGrid.beginFrame();

    // Step 2: reveal for every entity owned by this player.
    for (const [entity, pos] of this.world.query(PositionType, OwnerType)) {
      const owner = this.world.getComponent(entity, OwnerType);
      if (owner === undefined) continue;
      if (owner.playerId !== this._localPlayerId) continue;

      const tileX = Math.floor(pos.x);
      const tileZ = Math.floor(pos.z);
      this._revealCircle(tileX, tileZ, DEFAULT_SIGHT_RANGE);
    }

    // Step 3: notify renderer that grid data changed.
    if (this._renderer !== null) {
      this._renderer.markDirty();
    }
  }

  // -------------------------------------------------------------------------
  // LOS reveal
  // -------------------------------------------------------------------------

  /**
   * Reveals all tiles within `radius` of (cx, cz) that have unobstructed LOS.
   *
   * Uses a diamond iteration (Manhattan distance ≤ radius) to select candidate
   * tiles, then casts a Bresenham line from (cx, cz) to each candidate. The line
   * stops at the first unwalkable tile. Both the source tile and the first
   * blocking tile are revealed; tiles further along the ray are not.
   *
   * @param cx     - Centre column (unit's tile X).
   * @param cz     - Centre row (unit's tile Z).
   * @param radius - Sight radius in tiles.
   */
  private _revealCircle(cx: number, cz: number, radius: number): void {
    // Always reveal the unit's own tile.
    this._fowGrid.reveal(cx, cz);

    for (let dz = -radius; dz <= radius; dz++) {
      const maxDx = radius - Math.abs(dz);
      for (let dx = -maxDx; dx <= maxDx; dx++) {
        if (dx === 0 && dz === 0) continue; // own tile already revealed above
        this._castRay(cx, cz, cx + dx, cz + dz);
      }
    }
  }

  /**
   * Casts a Bresenham line from (x0, z0) toward (x1, z1).
   *
   * Iterates tile-by-tile along the line. At each step:
   * - If the tile is unwalkable: reveal it (blocker tile is visible) then stop.
   * - Otherwise: reveal it and continue.
   *
   * The source tile (x0, z0) is always revealed; it is handled by
   * {@link _revealCircle} before this method is called.
   *
   * @param x0 - Source column.
   * @param z0 - Source row.
   * @param x1 - Target column (the candidate tile on the circle perimeter).
   * @param z1 - Target row.
   */
  private _castRay(x0: number, z0: number, x1: number, z1: number): void {
    // Standard Bresenham integer line algorithm.
    let x = x0;
    let z = z0;

    const dx = Math.abs(x1 - x0);
    const dz = Math.abs(z1 - z0);
    const sx = x0 < x1 ? 1 : -1;
    const sz = z0 < z1 ? 1 : -1;
    let err = dx - dz;

    while (true) {
      // Skip the source tile — it was already revealed by _revealCircle.
      if (x !== x0 || z !== z0) {
        const walkable = this._tileGrid.isWalkable(x, z);
        // Reveal this tile regardless (blocker tile must be visible).
        this._fowGrid.reveal(x, z);

        if (!walkable) {
          // Hard blocker — stop the ray here; do not reveal tiles beyond.
          return;
        }
      }

      // Check if we reached the target tile.
      if (x === x1 && z === z1) {
        return;
      }

      // Advance Bresenham.
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        z += sz;
      }
    }
  }
}
