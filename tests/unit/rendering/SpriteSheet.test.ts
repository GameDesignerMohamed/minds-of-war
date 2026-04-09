import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { SpriteSheet } from '@/rendering/SpriteSheet';

function createTexture(width: number, height: number): THREE.Texture {
  const texture = new THREE.Texture();
  Object.assign(texture, {
    image: { width, height },
  });
  return texture;
}

describe('SpriteSheet', () => {
  it('resolves a frame into atlas UVs using the canonical row ordering', () => {
    const texture = createTexture(256, 512);
    const sheet = SpriteSheet.fromDefinition(
      {
        id: 'test-sheet',
        frameWidth: 64,
        frameHeight: 64,
        defaultState: 'walk',
        states: {
          walk: {
            textureUrl: 'walk.png',
            frameCount: 4,
            fps: 6,
          },
        },
      },
      { walk: texture },
    );

    const frame = sheet.resolveFrame('walk', 'north', 2);

    expect(frame.frame).toBe(2);
    expect(frame.uvRepeat.x).toBeCloseTo(0.25);
    expect(frame.uvRepeat.y).toBeCloseTo(0.125);
    expect(frame.uvOffset.x).toBeCloseTo(0.5);
    expect(frame.uvOffset.y).toBeCloseTo(0.375);
  });

  it('loads atlas manifests and resolves relative texture urls', async () => {
    const loadAsync = vi.fn(async (_url: string) => createTexture(256, 512));
    const sheet = await SpriteSheet.load('/sprites/placeholders/unit.sheet.json', {
      fetchJson: async () => ({
        id: 'loaded-sheet',
        frameWidth: 64,
        frameHeight: 64,
        defaultState: 'idle',
        states: {
          idle: {
            textureUrl: './unit.png',
            frameCount: 1,
            fps: 1,
          },
        },
      }),
      textureLoader: { loadAsync },
    });

    expect(loadAsync).toHaveBeenCalledWith('/sprites/placeholders/unit.png');
    expect(sheet.listStates()).toEqual(['idle']);
    expect(sheet.resolveFrame().texture).toBeInstanceOf(THREE.Texture);
  });
});
