import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getArtManifest } from '@/art/ArtLibrary';

const PROJECT_ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const PUBLIC_ROOT = resolve(PROJECT_ROOT, 'public');
const DIRECTION_ORDER = [
  'south',
  'south_east',
  'east',
  'north_east',
  'north',
  'north_west',
  'west',
  'south_west',
] as const;

function toPublicFile(assetPath: string): string {
  return resolve(PUBLIC_ROOT, assetPath.replace(/^\//, ''));
}

function readPngSize(filePath: string): { width: number; height: number } {
  const png = readFileSync(filePath);
  if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`Expected PNG header: ${filePath}`);
  }

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

describe('Art manifest', () => {
  it('ships full production character sheets in the documented grid format', () => {
    const manifest = getArtManifest();

    for (const [actorId, actor] of Object.entries(manifest.characters)) {
      for (const state of ['idle', 'walk', 'attack', 'hurt', 'death'] as const) {
        const sheet = actor.states[state];
        const filePath = toPublicFile(sheet.src);

        expect(existsSync(filePath), `${actorId}:${state}`).toBe(true);
        expect(sheet.frameSize).toBe(64);
        expect(sheet.rowCount).toBe(8);
        expect(sheet.directionOrder).toEqual(DIRECTION_ORDER);

        const size = readPngSize(filePath);
        expect(size.width).toBe(sheet.frameSize * sheet.frameCount);
        expect(size.height).toBe(sheet.frameSize * sheet.rowCount);
      }
    }
  });

  it('ships the runtime-referenced buildings, portraits, icons, UI frames, VFX, and terrain atlas', () => {
    const manifest = getArtManifest();

    for (const building of Object.values(manifest.buildings)) {
      const spritePath = toPublicFile(building.sprite);
      const portraitPath = toPublicFile(building.portrait);
      expect(existsSync(spritePath)).toBe(true);
      expect(readPngSize(spritePath)).toEqual({ width: 192, height: 192 });
      expect(existsSync(portraitPath)).toBe(true);
      expect(readPngSize(portraitPath)).toEqual({ width: 128, height: 128 });
    }

    for (const character of Object.values(manifest.characters)) {
      const portraitPath = toPublicFile(character.portrait);
      expect(existsSync(portraitPath)).toBe(true);
      expect(readPngSize(portraitPath)).toEqual({ width: 128, height: 128 });
    }

    for (const iconPath of Object.values(manifest.icons.resources)) {
      expect(readPngSize(toPublicFile(iconPath))).toEqual({ width: 64, height: 64 });
    }
    for (const iconPath of Object.values(manifest.icons.commands)) {
      expect(readPngSize(toPublicFile(iconPath))).toEqual({ width: 64, height: 64 });
    }
    for (const iconPath of Object.values(manifest.icons.abilities)) {
      expect(readPngSize(toPublicFile(iconPath))).toEqual({ width: 64, height: 64 });
    }

    for (const [frameId, frame] of Object.entries(manifest.ui.frames)) {
      const size = readPngSize(toPublicFile(frame.src));
      if (frameId === 'panel') {
        expect(size).toEqual({ width: 48, height: 48 });
      } else {
        expect(size).toEqual({ width: 32, height: 32 });
      }
      expect(frame.slice).toBeGreaterThan(0);
    }

    for (const vfxPath of Object.values(manifest.vfx)) {
      expect(readPngSize(toPublicFile(vfxPath))).toEqual({ width: 128, height: 128 });
    }

    expect(readPngSize(resolve(PUBLIC_ROOT, 'textures/terrain/terrain-atlas.png'))).toEqual({
      width: 256,
      height: 256,
    });
  });
});
