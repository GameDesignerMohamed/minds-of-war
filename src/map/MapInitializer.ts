/**
 * MapInitializer — populates a TileGrid from MapConfig data.
 *
 * Translates the declarative map layout (cliffs, tree lines, building footprints)
 * into runtime walkability flags on a {@link TileGrid}. Called once at map load
 * time; subsequent runtime mutations (building placement/destruction) call
 * {@link blockFootprint} and {@link clearFootprint} directly.
 *
 * Implements: design/gdd/map-system.md — Map Initialization section
 *
 * Tree lines in the map data are axis-aligned segments described by start/end
 * positions. Initialization iterates every tile along the segment (inclusive)
 * and marks it unwalkable. Diagonal segments are not used in current map data
 * and are not supported — only one of X or Z may differ between start and end.
 *
 * @module map/MapInitializer
 */

import {
  type MapConfig,
  type CliffRect,
  type TerrainAtlasConfig,
  type TerrainAtlasFrame,
  type TerrainAtlasTileSet,
  type TreeLineEntry,
} from '../config/ConfigLoader';
import { TerrainType } from '../types';
import { TileGrid } from './TileGrid';

// ---------------------------------------------------------------------------
// Terrain layout output
// ---------------------------------------------------------------------------

export interface TerrainAtlasDefinition {
  image: string;
  columns: number;
  rows: number;
  tiles: Partial<Record<TerrainType, TerrainAtlasTileSet>>;
}

export interface TerrainTileDescriptor {
  x: number;
  z: number;
  terrain: TerrainType;
  atlasFrame: TerrainAtlasFrame | null;
  rotationQuarterTurns: 0 | 1 | 2 | 3;
}

export interface InitializedMapData {
  terrainAtlas: TerrainAtlasDefinition | null;
  terrainTiles: TerrainTileDescriptor[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TERRAIN_COSTS: Record<TerrainType, number> = {
  [TerrainType.Grassland]: 1.0,
  [TerrainType.Forest]: 1.35,
  [TerrainType.Cliff]: 1.0,
  [TerrainType.Road]: 1.0,
};

const TERRAIN_NAME_MAP: Record<string, TerrainType> = {
  grassland: TerrainType.Grassland,
  forest: TerrainType.Forest,
  cliff: TerrainType.Cliff,
  road: TerrainType.Road,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initializes the tile grid from the loaded map configuration.
 *
 * After this call:
 * - All cliff rectangles are blocked (unwalkable).
 * - All tree-line tiles are blocked (trees block ground movement).
 * - All other tiles retain their default walkable state.
 *
 * Building footprints are NOT set here — call {@link blockFootprint} when a
 * building is placed (after construction completes or at game start for
 * pre-placed buildings).
 *
 * @param grid      - The TileGrid to configure. Must match mapConfig dimensions.
 * @param mapConfig - Loaded map configuration from assets/data/maps/.
 *
 * @example
 * const grid = new TileGrid(96, 96);
 * const mapData = initializeMap(grid, config.map);
 * console.log(mapData.terrainTiles.length); // 9216 on a 96x96 map
 */
export function initializeMap(grid: TileGrid, mapConfig: MapConfig): InitializedMapData {
  const defaultTerrain = _toTerrainType(mapConfig.terrain.default);
  const terrain = _makeTerrainBuffer(grid.width, grid.height, defaultTerrain);
  const terrainAtlas = _normalizeTerrainAtlas(mapConfig.terrain.atlas);

  _applyDefaultTerrainCost(grid, defaultTerrain);
  _applyTreeLines(grid, terrain, mapConfig.treeLines);
  _applyCliffs(grid, terrain, mapConfig.terrain.cliffs);

  return {
    terrainAtlas,
    terrainTiles: _buildTerrainTiles(grid.width, grid.height, terrain, terrainAtlas),
  };
}

/**
 * Marks all tiles covered by a building footprint as unwalkable.
 *
 * Call this when a building finishes construction or when pre-placed buildings
 * are spawned at game start. The footprint is a square of `size × size` tiles
 * anchored at (x, z) as the top-left corner.
 *
 * @param grid - The TileGrid to modify.
 * @param x    - Top-left column of the footprint.
 * @param z    - Top-left row of the footprint.
 * @param size - Side length of the square footprint in tiles (e.g. 4 for a 4×4 building).
 *
 * @example
 * // Block a 4×4 keep at grid position (10, 10):
 * blockFootprint(grid, 10, 10, 4);
 */
export function blockFootprint(grid: TileGrid, x: number, z: number, size: number): void {
  _setFootprint(grid, x, z, size, false);
}

/**
 * Clears all tiles covered by a building footprint, restoring walkability.
 *
 * Call this when a building is destroyed so units can path through the rubble.
 *
 * @param grid - The TileGrid to modify.
 * @param x    - Top-left column of the footprint.
 * @param z    - Top-left row of the footprint.
 * @param size - Side length of the square footprint in tiles.
 *
 * @example
 * // Restore a 4×4 tile area after a building is destroyed:
 * clearFootprint(grid, 10, 10, 4);
 */
export function clearFootprint(grid: TileGrid, x: number, z: number, size: number): void {
  _setFootprint(grid, x, z, size, true);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Marks all tiles within each cliff rectangle as unwalkable.
 *
 * Cliff rects are defined as { x, z, w, h } where (x, z) is the top-left corner
 * and (w, h) is the extent in tiles.
 */
function _applyCliffs(grid: TileGrid, terrain: TerrainType[], cliffs: CliffRect[]): void {
  for (const cliff of cliffs) {
    const { x, z, w, h } = cliff.rect;
    for (let row = z; row < z + h; row++) {
      for (let col = x; col < x + w; col++) {
        _paintTerrain(grid, terrain, col, row, TerrainType.Cliff, false);
      }
    }
  }
}

/**
 * Marks all tiles along each tree line segment as unwalkable.
 *
 * Segments must be axis-aligned (either purely horizontal or purely vertical).
 * Start and end positions are both inclusive.
 */
function _applyTreeLines(grid: TileGrid, terrain: TerrainType[], treeLines: TreeLineEntry[]): void {
  for (const line of treeLines) {
    const { start, end } = line;

    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minZ = Math.min(start.z, end.z);
    const maxZ = Math.max(start.z, end.z);

    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        _paintTerrain(grid, terrain, x, z, TerrainType.Forest, false);
      }
    }
  }
}

function _applyDefaultTerrainCost(grid: TileGrid, terrain: TerrainType): void {
  const cost = TERRAIN_COSTS[terrain];
  for (let z = 0; z < grid.height; z++) {
    for (let x = 0; x < grid.width; x++) {
      grid.setTerrainCost(x, z, cost);
    }
  }
}

function _makeTerrainBuffer(width: number, height: number, terrain: TerrainType): TerrainType[] {
  return new Array<TerrainType>(width * height).fill(terrain);
}

function _paintTerrain(
  grid: TileGrid,
  terrain: TerrainType[],
  x: number,
  z: number,
  terrainType: TerrainType,
  walkable: boolean,
): void {
  if (!grid.isInBounds(x, z)) {
    return;
  }

  terrain[z * grid.width + x] = terrainType;
  grid.setWalkable(x, z, walkable);
  grid.setTerrainCost(x, z, TERRAIN_COSTS[terrainType]);
}

function _normalizeTerrainAtlas(atlas?: TerrainAtlasConfig): TerrainAtlasDefinition | null {
  if (!atlas) {
    return null;
  }

  const tiles: Partial<Record<TerrainType, TerrainAtlasTileSet>> = {};
  for (const [terrainName, tileSet] of Object.entries(atlas.tiles)) {
    if (tileSet.variants.length === 0) {
      continue;
    }

    tiles[_toTerrainType(terrainName)] = {
      variants: tileSet.variants.map(({ col, row }) => ({ col, row })),
      randomRotation: tileSet.randomRotation ?? false,
    };
  }

  return {
    image: atlas.image,
    columns: atlas.columns,
    rows: atlas.rows,
    tiles,
  };
}

function _buildTerrainTiles(
  width: number,
  height: number,
  terrain: TerrainType[],
  terrainAtlas: TerrainAtlasDefinition | null,
): TerrainTileDescriptor[] {
  const tiles = new Array<TerrainTileDescriptor>(width * height);
  let index = 0;

  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const terrainType = terrain[z * width + x];
      const hash = _hashTerrainCoords(x, z, terrainType);
      const tileSet = _resolveTileSet(terrainAtlas, terrainType);
      const variant = tileSet ? tileSet.variants[hash % tileSet.variants.length] : null;
      const rotationQuarterTurns =
        tileSet && tileSet.randomRotation ? (((hash >>> 8) & 0x3) as 0 | 1 | 2 | 3) : 0;

      tiles[index++] = {
        x,
        z,
        terrain: terrainType,
        atlasFrame: variant ? { col: variant.col, row: variant.row } : null,
        rotationQuarterTurns,
      };
    }
  }

  return tiles;
}

function _resolveTileSet(
  terrainAtlas: TerrainAtlasDefinition | null,
  terrainType: TerrainType,
): TerrainAtlasTileSet | null {
  if (!terrainAtlas) {
    return null;
  }

  return (
    terrainAtlas.tiles[terrainType] ??
    terrainAtlas.tiles[TerrainType.Grassland] ??
    Object.values(terrainAtlas.tiles).find(
      (tileSet): tileSet is TerrainAtlasTileSet => tileSet !== undefined,
    ) ??
    null
  );
}

function _toTerrainType(terrainName: string): TerrainType {
  return TERRAIN_NAME_MAP[terrainName.toLowerCase()] ?? TerrainType.Grassland;
}

function _hashTerrainCoords(x: number, z: number, terrainType: TerrainType): number {
  let hash =
    Math.imul(x + 1, 374761393) ^
    Math.imul(z + 1, 668265263) ^
    Math.imul(terrainType.length + terrainType.charCodeAt(0), 1442695041);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/**
 * Shared footprint writer used by {@link blockFootprint} and {@link clearFootprint}.
 */
function _setFootprint(
  grid: TileGrid,
  x: number,
  z: number,
  size: number,
  walkable: boolean,
): void {
  for (let row = z; row < z + size; row++) {
    for (let col = x; col < x + size; col++) {
      grid.setWalkable(col, row, walkable);
    }
  }
}
