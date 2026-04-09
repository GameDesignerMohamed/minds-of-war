import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { SpriteAnimator } from '@/rendering/SpriteAnimator';
import { SpriteSheet } from '@/rendering/SpriteSheet';

function createTexture(width: number, height: number): THREE.Texture {
  const texture = new THREE.Texture();
  Object.assign(texture, {
    image: { width, height },
  });
  return texture;
}

describe('SpriteAnimator', () => {
  it('advances looping animations frame-by-frame', () => {
    const texture = createTexture(256, 512);
    const sheet = SpriteSheet.fromDefinition(
      {
        id: 'loop-sheet',
        frameWidth: 64,
        frameHeight: 64,
        defaultState: 'walk',
        states: {
          walk: {
            textureUrl: 'walk.png',
            frameCount: 4,
            fps: 4,
            loop: true,
          },
        },
      },
      { walk: texture },
    );
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial());
    const animator = new SpriteAnimator();

    animator.register(sprite, sheet, { state: 'walk', playing: true });
    animator.update(0.26);

    expect(animator.getBinding(sprite)).toMatchObject({
      state: 'walk',
      frame: 1,
      playing: true,
    });
    expect((sprite.material as THREE.SpriteMaterial).map?.offset.x).toBeCloseTo(0.25);
  });

  it('clamps non-looping animations on the final frame', () => {
    const texture = createTexture(192, 512);
    const sheet = SpriteSheet.fromDefinition(
      {
        id: 'one-shot-sheet',
        frameWidth: 64,
        frameHeight: 64,
        defaultState: 'attack',
        states: {
          attack: {
            textureUrl: 'attack.png',
            frameCount: 3,
            fps: 10,
            loop: false,
          },
        },
      },
      { attack: texture },
    );
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial());
    const animator = new SpriteAnimator();

    animator.register(sprite, sheet, { state: 'attack', playing: true });
    animator.update(1);

    expect(animator.getBinding(sprite)).toMatchObject({
      state: 'attack',
      frame: 2,
      playing: false,
    });
  });
});
