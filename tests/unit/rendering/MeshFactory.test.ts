import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { Faction, TerrainType } from '@/types';
import type { TerrainTileDescriptor } from '@/map/MapInitializer';

// Mock ArtLibrary so MeshFactory always falls back to geometry (no DOM needed)
vi.mock('@/art/ArtLibrary', () => ({
  getCharacterArt: () => null,
  getCharacterStateSheet: () => null,
  getBuildingArt: () => null,
}));

// Mock ModelLoader so async model loading doesn't run in tests
vi.mock('@/rendering/ModelLoader', () => ({
  loadCharacterModel: () => Promise.resolve(null),
  loadBuildingModel: () => Promise.resolve(null),
  loadResourceModel: () => Promise.resolve(null),
}));

// Import after mock is set up
const { MeshFactory } = await import('@/rendering/MeshFactory');

describe('MeshFactory', () => {
  it('returns geometry fallback for units and buildings when no art is loaded', () => {
    const factory = new MeshFactory();

    const unit = factory.createUnitMesh(Faction.Human, 'footman');
    const building = factory.createBuildingMesh(Faction.Orc, 'stronghold');

    // Fallback returns THREE.Group (composed primitives), not THREE.Sprite
    expect(unit).toBeInstanceOf(THREE.Group);
    expect(building).toBeInstanceOf(THREE.Group);
  });

  it('creates terrain tiles with the descriptor API', () => {
    const factory = new MeshFactory();

    const tile: TerrainTileDescriptor = {
      x: 2,
      z: 3,
      terrain: TerrainType.Grassland,
      atlasFrame: null,
      rotationQuarterTurns: 0,
    };

    const mesh = factory.createTerrainTile(tile, null);
    expect(mesh).toBeInstanceOf(THREE.Mesh);
    expect(mesh.position.x).toBe(2);
    expect(mesh.position.z).toBe(3);
  });
});
