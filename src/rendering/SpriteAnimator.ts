import * as THREE from 'three';
import { type SpriteDirection, SpriteSheet } from './SpriteSheet';

export interface SpriteAnimationBindingOptions {
  state?: string;
  direction?: SpriteDirection;
  playing?: boolean;
}

export interface SpriteAnimationSnapshot {
  state: string;
  direction: SpriteDirection;
  frame: number;
  playing: boolean;
}

interface SpriteAnimationBinding {
  sprite: THREE.Sprite;
  sheet: SpriteSheet;
  material: THREE.SpriteMaterial;
  texture: THREE.Texture;
  sourceTexture: THREE.Texture;
  state: string;
  direction: SpriteDirection;
  frame: number;
  elapsed: number;
  playing: boolean;
}

export class SpriteAnimator {
  private readonly _bindings: Map<string, SpriteAnimationBinding> = new Map();

  register(
    sprite: THREE.Sprite,
    sheet: SpriteSheet,
    options: SpriteAnimationBindingOptions = {},
  ): void {
    const state = options.state ?? sheet.defaultState;
    const direction = options.direction ?? sheet.directions[0] ?? 'south';
    const animation = sheet.getAnimation(state);
    const material = this._ensureMaterial(sprite);
    const initialFrame = sheet.resolveFrame(state, direction, 0);
    const texture = initialFrame.texture.clone();
    texture.needsUpdate = true;
    material.map = texture;
    material.transparent = true;
    material.alphaTest = 0.01;
    material.needsUpdate = true;

    this._bindings.set(sprite.uuid, {
      sprite,
      sheet,
      material,
      texture,
      sourceTexture: initialFrame.texture,
      state,
      direction,
      frame: 0,
      elapsed: 0,
      playing: options.playing ?? animation.frameCount > 1,
    });

    this._applyFrame(this._requireBinding(sprite));
  }

  unregister(sprite: THREE.Sprite): void {
    this._bindings.delete(sprite.uuid);
  }

  has(sprite: THREE.Sprite): boolean {
    return this._bindings.has(sprite.uuid);
  }

  getBinding(sprite: THREE.Sprite): SpriteAnimationSnapshot | undefined {
    const binding = this._bindings.get(sprite.uuid);
    if (binding === undefined) {
      return undefined;
    }
    return {
      state: binding.state,
      direction: binding.direction,
      frame: binding.frame,
      playing: binding.playing,
    };
  }

  play(sprite: THREE.Sprite, state?: string, direction?: SpriteDirection): void {
    const binding = this._requireBinding(sprite);
    if (state !== undefined) {
      binding.state = state;
      binding.frame = 0;
      binding.elapsed = 0;
    }
    if (direction !== undefined) {
      binding.direction = direction;
    }
    binding.playing = true;
    this._applyFrame(binding);
  }

  pause(sprite: THREE.Sprite): void {
    this._requireBinding(sprite).playing = false;
  }

  stop(sprite: THREE.Sprite): void {
    const binding = this._requireBinding(sprite);
    binding.playing = false;
    binding.frame = 0;
    binding.elapsed = 0;
    this._applyFrame(binding);
  }

  setState(sprite: THREE.Sprite, state: string): void {
    const binding = this._requireBinding(sprite);
    binding.state = state;
    binding.frame = 0;
    binding.elapsed = 0;
    this._applyFrame(binding);
  }

  setDirection(sprite: THREE.Sprite, direction: SpriteDirection): void {
    const binding = this._requireBinding(sprite);
    binding.direction = direction;
    this._applyFrame(binding);
  }

  update(deltaSeconds: number): void {
    for (const binding of this._bindings.values()) {
      if (!binding.playing) {
        continue;
      }

      const animation = binding.sheet.getAnimation(binding.state);
      if (animation.frameCount <= 1 || animation.fps <= 0) {
        binding.playing = false;
        continue;
      }

      const frameDuration = 1 / animation.fps;
      binding.elapsed += deltaSeconds;

      while (binding.elapsed >= frameDuration) {
        binding.elapsed -= frameDuration;

        if (binding.frame < animation.frameCount - 1) {
          binding.frame += 1;
        } else if (animation.loop) {
          binding.frame = 0;
        } else {
          binding.frame = animation.frameCount - 1;
          binding.playing = false;
          binding.elapsed = 0;
          break;
        }

        this._applyFrame(binding);
      }
    }
  }

  private _requireBinding(sprite: THREE.Sprite): SpriteAnimationBinding {
    const binding = this._bindings.get(sprite.uuid);
    if (binding === undefined) {
      throw new Error(`Sprite ${sprite.uuid} is not registered with SpriteAnimator`);
    }
    return binding;
  }

  private _ensureMaterial(sprite: THREE.Sprite): THREE.SpriteMaterial {
    if (sprite.material instanceof THREE.SpriteMaterial) {
      return sprite.material;
    }

    const material = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.01 });
    sprite.material = material;
    return material;
  }

  private _applyFrame(binding: SpriteAnimationBinding): void {
    const frame = binding.sheet.resolveFrame(binding.state, binding.direction, binding.frame);

    if (binding.sourceTexture !== frame.texture || binding.material.map === null) {
      binding.texture = frame.texture.clone();
      binding.texture.needsUpdate = true;
      binding.sourceTexture = frame.texture;
      binding.material.map = binding.texture;
      binding.material.needsUpdate = true;
    }

    binding.texture.offset.set(frame.uvOffset.x, frame.uvOffset.y);
    binding.texture.repeat.set(frame.uvRepeat.x, frame.uvRepeat.y);
    binding.texture.needsUpdate = true;
    binding.sprite.scale.set(frame.scale.x, frame.scale.y, 1);
    binding.sprite.center.set(0.5, 0);
    binding.sprite.renderOrder = Math.max(binding.sprite.renderOrder, 1);
  }
}
