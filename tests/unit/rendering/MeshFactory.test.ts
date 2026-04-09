import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { getArtManifest, getBuildingArt, getCharacterStateSheet } from '@/art/ArtLibrary';
import { MeshFactory } from '@/rendering/MeshFactory';
import { Faction, TerrainType } from '@/types';

function publicAssetPath(assetUrl: string): string {
  return fileURLToPath(new URL(`../../../public${assetUrl}`, import.meta.url));
}

function parsePngDimensions(buffer: Buffer): { width: number; height: number } {
  const pngSignature = '89504e470d0a1a0a';
  expect(buffer.subarray(0, 8).toString('hex')).toBe(pngSignature);

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function createTexture(width: number, height: number): THREE.Texture {
  const texture = new THREE.Texture();
  Object.assign(texture, {
    image: { width, height },
  });
  return texture;
}

describe('MeshFactory', () => {
  it('returns THREE.Sprite visuals for units and buildings', () => {
    const factory = new MeshFactory() as MeshFactory & {
      _getTexture: (url: string) => THREE.Texture;
      _getTextureFrame: (
        url: string,
        col: number,
        row: number,
        columns: number,
        rows: number,
      ) => THREE.Texture;
    };
    const spriteTexture = createTexture(256, 256);
    factory._getTexture = () => spriteTexture;
    factory._getTextureFrame = () => spriteTexture;

    const unit = factory.createUnitMesh(Faction.Human, 'footman');
    const building = factory.createBuildingMesh(Faction.Orc, 'stronghold');
    const terrain = factory.createTerrainTile(
      { terrain: TerrainType.Grassland, x: 2, z: 3, atlasIndex: 0 },
      null,
    );

    expect(unit).toBeInstanceOf(THREE.Sprite);
    expect(building).toBeInstanceOf(THREE.Sprite);
    expect(terrain).toBeInstanceOf(THREE.Mesh);
    expect((unit as THREE.Sprite).material).toBeInstanceOf(THREE.SpriteMaterial);
    expect((building as THREE.Sprite).material).toBeInstanceOf(THREE.SpriteMaterial);
  });

  it('ships referenced art assets for the sprite-based presentation', () => {
    const manifest = getArtManifest();
    const archerIdle = getCharacterStateSheet('archer', 'idle');
    const stronghold = getBuildingArt('stronghold');

    expect(archerIdle).toBeTruthy();
    expect(stronghold).toBeTruthy();
    expect(existsSync(publicAssetPath(archerIdle!.src))).toBe(true);
    expect(existsSync(publicAssetPath(stronghold!.sprite))).toBe(true);

    const archerSize = parsePngDimensions(readFileSync(publicAssetPath(archerIdle!.src)));
    const strongholdSize = parsePngDimensions(readFileSync(publicAssetPath(stronghold!.sprite)));

    expect(archerSize.width).toBeGreaterThan(0);
    expect(archerSize.height).toBeGreaterThan(0);
    expect(strongholdSize.width).toBeGreaterThan(0);
    expect(strongholdSize.height).toBeGreaterThan(0);
    expect(Object.keys(manifest.characters).length).toBeGreaterThan(0);
    expect(Object.keys(manifest.buildings).length).toBeGreaterThan(0);
  });
});
