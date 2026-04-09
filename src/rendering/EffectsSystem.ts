/**
 * EffectsSystem — simple visual effects for combat and unit events.
 *
 * Manages a pool of reusable effect meshes (flashes, particles).
 * Listens to game events and spawns appropriate visual feedback.
 *
 * @module rendering/EffectsSystem
 */

import * as THREE from 'three';
import { getVfxTexturePath } from '@/art/ArtLibrary';
import type { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import type { World } from '@/ecs/World';
import { PositionType } from '@/ecs/components/GameComponents';
import type { SceneManager } from '@/rendering/SceneManager';
import type { PositionComponent } from '@/ecs/components/GameComponents';
import type { EntityId } from '@/types';

interface ActiveEffect {
  key: string;
  mesh: THREE.Object3D;
  lifetime: number;
  elapsed: number;
  type: 'flash' | 'death' | 'explosion';
}

export class EffectsSystem {
  private readonly _sceneManager: SceneManager;
  private readonly _world: World;
  private readonly _effects: ActiveEffect[] = [];
  private readonly _textures = new Map<string, THREE.Texture>();
  private _nextEffectId = 0;

  // Pre-allocated geometries
  private readonly _flashGeo = new THREE.SphereGeometry(0.3, 6, 4);
  private readonly _flashMat = new THREE.MeshBasicMaterial({
    color: 0xffff44,
    transparent: true,
    opacity: 0.9,
  });
  private readonly _deathMat = new THREE.MeshBasicMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 0.8,
  });
  private readonly _explosionGeo = new THREE.SphereGeometry(0.8, 8, 6);
  private readonly _explosionMat = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.9,
  });

  constructor(sceneManager: SceneManager, world: World, gameEventBus: EventBus<GameEvents>) {
    this._sceneManager = sceneManager;
    this._world = world;

    // Listen for combat events
    gameEventBus.on('UNIT_ATTACKED', (d: unknown) => {
      const e = d as { targetEntity: EntityId };
      const pos = this._getPos(e.targetEntity);
      if (pos) this.spawnFlash(pos.x, pos.z);
    });

    gameEventBus.on('UNIT_DIED', (d: unknown) => {
      const e = d as { entityId: EntityId };
      const pos = this._getPos(e.entityId);
      if (pos) this.spawnDeath(pos.x, pos.z);
    });

    gameEventBus.on('BUILDING_DESTROYED', (d: unknown) => {
      const e = d as { entityId: EntityId };
      const pos = this._getPos(e.entityId);
      if (pos) this.spawnExplosion(pos.x, pos.z);
    });
  }

  private _getPos(entityId: EntityId): PositionComponent | undefined {
    return this._world.getComponent<PositionComponent>(entityId, PositionType);
  }

  spawnFlash(x: number, z: number): void {
    const key = `effect-${this._nextEffectId++}`;
    const mesh =
      this._createEffectMesh('hit_spark', x, 0.8, z, 1.1, 0xffffcc) ??
      new THREE.Mesh(this._flashGeo, this._flashMat.clone());
    mesh.position.set(x, 0.8, z);
    this._sceneManager.addObject(key, mesh);
    this._effects.push({ key, mesh, lifetime: 0.2, elapsed: 0, type: 'flash' });
  }

  spawnDeath(x: number, z: number): void {
    const key = `effect-${this._nextEffectId++}`;
    const mesh =
      this._createEffectMesh('smoke', x, 0.6, z, 1.8, 0xd87456) ??
      new THREE.Mesh(this._flashGeo, this._deathMat.clone());
    mesh.position.set(x, 0.5, z);
    mesh.scale.setScalar(1.5);
    this._sceneManager.addObject(key, mesh);
    this._effects.push({ key, mesh, lifetime: 0.5, elapsed: 0, type: 'death' });
  }

  spawnExplosion(x: number, z: number): void {
    const key = `effect-${this._nextEffectId++}`;
    const mesh =
      this._createEffectMesh('explosion', x, 1.0, z, 2.3, 0xffd090) ??
      new THREE.Mesh(this._explosionGeo, this._explosionMat.clone());
    mesh.position.set(x, 1.0, z);
    this._sceneManager.addObject(key, mesh);
    this._effects.push({ key, mesh, lifetime: 0.8, elapsed: 0, type: 'explosion' });
  }

  private _createEffectMesh(
    effectId: string,
    x: number,
    y: number,
    z: number,
    scale: number,
    color: number,
  ): THREE.Sprite | null {
    const texturePath = getVfxTexturePath(effectId);
    if (texturePath === null) {
      return null;
    }

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this._getTexture(texturePath),
        color,
        transparent: true,
        depthWrite: false,
      }),
    );
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);
    return sprite;
  }

  private _getTexture(url: string): THREE.Texture {
    let texture = this._textures.get(url);
    if (!texture) {
      texture = new THREE.TextureLoader().load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      this._textures.set(url, texture);
    }

    return texture;
  }

  /** Call once per render frame with the render delta time. */
  update(dt: number): void {
    for (let i = this._effects.length - 1; i >= 0; i--) {
      const fx = this._effects[i];
      fx.elapsed += dt;
      const t = fx.elapsed / fx.lifetime;

      if (t >= 1.0) {
        this._sceneManager.removeObject(fx.key);
        const material = (fx.mesh as THREE.Mesh | THREE.Sprite).material;
        if (material instanceof THREE.Material) {
          material.dispose();
        }
        this._effects.splice(i, 1);
        continue;
      }

      // Fade out + expand
      const mat = (fx.mesh as THREE.Mesh | THREE.Sprite).material as
        | THREE.MeshBasicMaterial
        | THREE.SpriteMaterial;
      mat.opacity = 1.0 - t;

      if (fx.type === 'death') {
        fx.mesh.scale.setScalar(1.5 + t * 0.5);
        fx.mesh.position.y = 0.5 + t * 0.3;
      } else if (fx.type === 'explosion') {
        fx.mesh.scale.setScalar(1.0 + t * 2.0);
      } else {
        fx.mesh.scale.setScalar(1.0 + t * 0.5);
      }
    }
  }

  dispose(): void {
    for (const fx of this._effects) {
      this._sceneManager.removeObject(fx.key);
    }
    this._effects.length = 0;
    this._flashGeo.dispose();
    this._flashMat.dispose();
    this._deathMat.dispose();
    this._explosionGeo.dispose();
    this._explosionMat.dispose();
    for (const texture of this._textures.values()) {
      texture.dispose();
    }
    this._textures.clear();
  }
}
