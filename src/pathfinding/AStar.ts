/**
 * AStar — grid-based A* pathfinding for Minds of War.
 *
 * Implements 4-connected Manhattan-heuristic A* on a {@link TileGrid}.
 * Uses {@link BinaryHeap} for the open set to achieve O(n log n) performance
 * instead of the O(n²) linear-scan pattern from the prototype.
 *
 * Performance target: a 96×96 grid with 2000 max iterations must complete
 * in under 1 ms per query. The implementation uses integer-keyed flat arrays
 * for g/f scores and parent tracking to avoid Map overhead in the hot loop.
 *
 * Zero-allocation contract for the neighbor step:
 * TileGrid.getNeighbors() returns a view into a shared mutable buffer. Each
 * neighbor's x and z values are copied to local variables immediately —
 * the Position reference is never stored across iterations.
 *
 * Implements: design/gdd/map-system.md — Pathfinding section
 *
 * @module pathfinding/AStar
 */

import { BinaryHeap } from './BinaryHeap';
import type { TileGrid } from '@/map/TileGrid';
import type { Position } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default cap on loop iterations to prevent freezes on unreachable targets. */
const DEFAULT_MAX_ITERATIONS = 2000;

// ---------------------------------------------------------------------------
// Internal node type (lives only inside findPath call stacks)
// ---------------------------------------------------------------------------

/** Internal A* node. Allocated once per opened tile per search. */
interface AStarNode {
  x: number;
  z: number;
  /** Total path cost from start to this node (g-score). */
  g: number;
  /** Estimated total cost start→node→end (f-score = g + h). */
  f: number;
  /** Flat grid index of the parent node, or -1 for the start node. */
  parentIndex: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Manhattan distance heuristic — admissible for a 4-connected grid with
 * minimum terrain cost of 1.0, so A* is guaranteed to find the optimal path.
 */
function heuristic(ax: number, az: number, bx: number, bz: number): number {
  return Math.abs(ax - bx) + Math.abs(az - bz);
}

/**
 * Finds the walkable tile closest to (targetX, targetZ) using a BFS expansion
 * outward from the target. Called when the exact destination is unwalkable.
 *
 * Search radius is bounded at half the grid's smaller dimension to prevent
 * runaway searches on large blocked areas.
 *
 * @returns Nearest walkable tile position, or null if none found within radius.
 */
function findNearestWalkable(
  grid: TileGrid,
  targetX: number,
  targetZ: number,
): { x: number; z: number } | null {
  const maxRadius = Math.floor(Math.min(grid.width, grid.height) / 2);

  for (let radius = 1; radius <= maxRadius; radius++) {
    // Scan a square ring at the given Chebyshev radius.
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        // Only check the border of the ring.
        if (Math.abs(dx) !== radius && Math.abs(dz) !== radius) {
          continue;
        }
        const nx = targetX + dx;
        const nz = targetZ + dz;
        if (grid.isWalkable(nx, nz)) {
          return { x: nx, z: nz };
        }
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// findPath
// ---------------------------------------------------------------------------

/**
 * Finds a path between two tile coordinates using A*.
 *
 * The start and end are rounded to the nearest integer tile. If the end tile
 * is unwalkable, the nearest walkable tile is substituted automatically.
 *
 * @param grid          - The walkability/cost grid to search.
 * @param startX        - Start column (will be rounded to integer).
 * @param startZ        - Start row (will be rounded to integer).
 * @param endX          - Goal column (will be rounded to integer).
 * @param endZ          - Goal row (will be rounded to integer).
 * @param maxIterations - Maximum open-set expansions before giving up.
 *   Defaults to {@link DEFAULT_MAX_ITERATIONS}. Prevents frame drops when
 *   the target is unreachable due to obstacles.
 * @returns An ordered array of {@link Position} waypoints from start to end
 *   (inclusive of both endpoints), or `null` if no path exists within the
 *   iteration budget.
 */
export function findPath(
  grid: TileGrid,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number,
  maxIterations: number = DEFAULT_MAX_ITERATIONS,
): Position[] | null {
  // Round to integer tile coordinates.
  const sx = Math.round(startX);
  const sz = Math.round(startZ);
  let ex = Math.round(endX);
  let ez = Math.round(endZ);

  // Trivial case: already at the destination.
  if (sx === ex && sz === ez) {
    return [{ x: sx, z: sz }];
  }

  // If end tile is blocked, find the nearest walkable substitute.
  if (!grid.isWalkable(ex, ez)) {
    const nearest = findNearestWalkable(grid, ex, ez);
    if (nearest === null) {
      return null; // Entire area is blocked — give up.
    }
    ex = nearest.x;
    ez = nearest.z;
  }

  // If start tile is blocked (unit clipped into terrain), also give up.
  if (!grid.isWalkable(sx, sz)) {
    return null;
  }

  const { width, height } = grid;
  const gridSize = width * height;

  // --- Flat-array score tables (avoids Map overhead in tight loop) ---

  /**
   * gScore[z * width + x] = best known cost from start to that tile.
   * Initialized to Infinity; start node = 0.
   */
  const gScore = new Float32Array(gridSize).fill(Infinity);

  /**
   * Tracks which node opened each cell. Stored as flat index of the opener.
   * -1 = unvisited. -2 = start node (no parent).
   */
  const parentFlat = new Int32Array(gridSize).fill(-1);

  /**
   * closedSet[flat] = 1 when the node has been fully expanded.
   * Using Uint8Array for minimal memory footprint.
   */
  const closedSet = new Uint8Array(gridSize);

  // Reusable heap (re-created per call; heap objects are small).
  const openHeap = new BinaryHeap<AStarNode>((n) => n.f);

  // Seed the start node.
  const startFlat = sz * width + sx;
  gScore[startFlat] = 0;
  parentFlat[startFlat] = -2; // sentinel: "is the start"

  openHeap.push({
    x: sx,
    z: sz,
    g: 0,
    f: heuristic(sx, sz, ex, ez),
    parentIndex: -2,
  });

  let iterations = 0;

  while (openHeap.size > 0 && iterations < maxIterations) {
    iterations++;

    const current = openHeap.pop()!;
    const cx = current.x;
    const cz = current.z;
    const currentFlat = cz * width + cx;

    // Skip if already expanded (stale heap entry due to re-insertion).
    if (closedSet[currentFlat] === 1) {
      continue;
    }
    closedSet[currentFlat] = 1;

    // Goal check.
    if (cx === ex && cz === ez) {
      return reconstructPath(parentFlat, width, cx, cz, sx, sz);
    }

    // Expand neighbors.
    // IMPORTANT: TileGrid.getNeighbors returns a view into a shared mutable
    // buffer. We must extract x and z as primitive numbers immediately.
    const neighbors = grid.getNeighbors(cx, cz);
    for (let i = 0; i < neighbors.length; i++) {
      const nx = neighbors[i].x; // copy primitive — buffer may be reused
      const nz = neighbors[i].z;
      const neighborFlat = nz * width + nx;

      if (closedSet[neighborFlat] === 1) {
        continue;
      }

      // g-score for moving to neighbor = current g + terrain cost of neighbor.
      const tentativeG = current.g + grid.getTerrainCost(nx, nz);

      if (tentativeG < gScore[neighborFlat]) {
        // Found a better path to this neighbor.
        gScore[neighborFlat] = tentativeG;
        parentFlat[neighborFlat] = currentFlat;

        const h = heuristic(nx, nz, ex, ez);
        openHeap.push({
          x: nx,
          z: nz,
          g: tentativeG,
          f: tentativeG + h,
          parentIndex: currentFlat,
        });
      }
    }
  }

  // Exhausted search space or hit iteration limit — no path found.
  return null;
}

// ---------------------------------------------------------------------------
// Path reconstruction
// ---------------------------------------------------------------------------

/**
 * Walks the parentFlat table from goal back to start and returns the waypoint
 * array in start-to-end order.
 *
 * @param parentFlat - Flat parent index table produced during the A* search.
 * @param width      - Grid width (used to convert flat index → x,z).
 * @param endX       - Goal tile column.
 * @param endZ       - Goal tile row.
 * @param startX     - Start tile column (stop condition).
 * @param startZ     - Start tile row (stop condition).
 * @returns Ordered waypoint array from start to end, inclusive.
 */
function reconstructPath(
  parentFlat: Int32Array,
  width: number,
  endX: number,
  endZ: number,
  startX: number,
  startZ: number,
): Position[] {
  const path: Position[] = [];
  let cx = endX;
  let cz = endZ;

  // Walk backwards from goal to start using parent links.
  while (!(cx === startX && cz === startZ)) {
    path.push({ x: cx, z: cz });
    const flat = parentFlat[cz * width + cx];
    if (flat === -2) {
      // Reached start node sentinel.
      break;
    }
    cx = flat % width;
    cz = Math.floor(flat / width);
  }

  // Include the start tile.
  path.push({ x: startX, z: startZ });

  // Reverse to get start→end order.
  path.reverse();

  return path;
}
