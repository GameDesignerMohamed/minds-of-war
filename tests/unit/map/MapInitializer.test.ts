import { describe, it, expect } from 'vitest';
import type { MapConfig } from '@/config/ConfigLoader';
import { TileGrid } from '@/map/TileGrid';
import { initializeMap } from '@/map/MapInitializer';
import { TerrainType } from '@/types';

const mapConfig: MapConfig = {
  name: 'Terrain Test',
  gridSize: 4,
  tileSize: 1,
  startingPositions: {
    player1: { x: 0, z: 0, corner: 'NW' },
    player2: { x: 3, z: 3, corner: 'SE' },
  },
  goldMines: [],
  treeLines: [{ start: { x: 1, z: 1 }, end: { x: 1, z: 2 }, treesPerTile: 1 }],
  terrain: {
    default: 'grassland',
    atlas: {
      image: '/textures/terrain/terrain-atlas.png',
      columns: 4,
      rows: 4,
      tiles: {
        grassland: {
          variants: [
            { col: 0, row: 0 },
            { col: 1, row: 0 },
          ],
          randomRotation: true,
        },
        forest: {
          variants: [
            { col: 0, row: 1 },
            { col: 1, row: 1 },
          ],
          randomRotation: true,
        },
        cliff: {
          variants: [
            { col: 0, row: 2 },
            { col: 1, row: 2 },
          ],
          randomRotation: true,
        },
      },
    },
    cliffs: [{ rect: { x: 2, z: 2, w: 1, h: 1 } }],
  },
};

describe('MapInitializer', () => {
  it('returns deterministic atlas-backed terrain layout data', () => {
    const first = initializeMap(new TileGrid(4, 4), mapConfig);
    const second = initializeMap(new TileGrid(4, 4), mapConfig);

    expect(first.terrainAtlas?.image).toBe('/textures/terrain/terrain-atlas.png');
    expect(first.terrainTiles).toHaveLength(16);
    expect(first.terrainTiles).toEqual(second.terrainTiles);
  });

  it('marks forests and cliffs as blocked terrain types', () => {
    const grid = new TileGrid(4, 4);
    const terrainData = initializeMap(grid, mapConfig);
    const byCoord = (x: number, z: number) =>
      terrainData.terrainTiles.find((tile) => tile.x === x && tile.z === z)!;

    expect(byCoord(0, 0).terrain).toBe(TerrainType.Grassland);
    expect(byCoord(0, 0).atlasFrame).not.toBeNull();
    expect(byCoord(1, 1).terrain).toBe(TerrainType.Forest);
    expect(byCoord(2, 2).terrain).toBe(TerrainType.Cliff);
    expect(grid.isWalkable(1, 1)).toBe(false);
    expect(grid.isWalkable(2, 2)).toBe(false);
    expect(grid.getTerrainCost(1, 1)).toBeGreaterThan(1);
  });
});
