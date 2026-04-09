/**
 * SceneManager
 *
 * Owns the Three.js Scene and provides a stable API for adding, removing,
 * and querying renderable objects. All gameplay code interacts with the
 * scene through this class — direct access to `THREE.Scene` is intentionally
 * not exposed outside the rendering module.
 *
 * @module rendering/SceneManager
 *
 * @example
 * ```ts
 * const threeScene = new THREE.Scene();
 * const scene = new SceneManager(threeScene);
 * scene.addObject('ground', groundMesh);
 * scene.addObject('unit-42', unitMesh);
 *
 * // Retrieve for animation / position updates:
 * const mesh = scene.getObject('unit-42');
 *
 * // Hand the raw scene to the renderer each frame:
 * renderer.render(scene.threeScene, camera);
 * ```
 *
 * Thread-safety: NOT thread-safe. All calls must originate from the main thread.
 * Allocation: The internal Map grows with object registrations but no per-frame
 *             allocations occur once the scene is populated.
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// SceneManager
// ---------------------------------------------------------------------------

/**
 * Manages a Three.js Scene and a registry of named scene objects.
 *
 * Objects are registered by string key so that other systems (animation,
 * entity removal, HUD anchoring) can retrieve meshes without holding direct
 * references. Keys should be stable entity identifiers (e.g. `"unit-42"`,
 * `"building-7"`).
 */
export class SceneManager {
  /** The underlying Three.js scene. Exposed read-only for renderer access. */
  private readonly _scene: THREE.Scene;

  /**
   * Registry of named Three.js objects. Enables O(1) lookup by key without
   * traversing the scene graph.
   */
  private readonly _objects: Map<string, THREE.Object3D> = new Map();

  constructor(scene: THREE.Scene) {
    this._scene = scene;
    this._scene.background = new THREE.Color(0x050512); // dark Animoca theme
    this._setupLighting();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * The raw Three.js scene. Pass this directly to `renderer.render()`.
   *
   * Read-only: do not attach or detach objects directly — use `addObject` /
   * `removeObject` so the registry stays in sync.
   */
  get threeScene(): THREE.Scene {
    return this._scene;
  }

  /**
   * Adds a Three.js object to the scene and registers it under the given key.
   *
   * If a different object is already registered under `key` it is removed from
   * the scene before the new object is added. Registering the same object
   * reference under the same key is a no-op.
   *
   * @param key    - Stable identifier for this object (e.g. `"unit-42"`).
   * @param object - The Three.js object to add.
   *
   * @example
   * ```ts
   * scene.addObject('terrain', terrainMesh);
   * ```
   */
  addObject(key: string, object: THREE.Object3D): void {
    const existing = this._objects.get(key);
    if (existing === object) return;
    if (existing !== undefined) {
      this._scene.remove(existing);
    }
    this._objects.set(key, object);
    this._scene.add(object);
  }

  /**
   * Removes the object registered under `key` from the scene and the registry.
   *
   * Safe to call with an unregistered key — does nothing in that case.
   *
   * @param key - The key used when `addObject` was called.
   *
   * @example
   * ```ts
   * scene.removeObject('unit-42'); // entity died, clean up mesh
   * ```
   */
  removeObject(key: string): void {
    const object = this._objects.get(key);
    if (object === undefined) return;
    this._scene.remove(object);
    this._objects.delete(key);
  }

  /**
   * Returns the object registered under `key`, or `undefined` if not found.
   *
   * @param key - The registration key.
   * @returns The registered Three.js object, or `undefined`.
   *
   * @example
   * ```ts
   * const mesh = scene.getObject('unit-42');
   * if (mesh) mesh.position.set(wx, 0, wz);
   * ```
   */
  getObject(key: string): THREE.Object3D | undefined {
    return this._objects.get(key);
  }

  /**
   * Returns `true` if an object is registered under the given key.
   *
   * @param key - The registration key to test.
   */
  hasObject(key: string): boolean {
    return this._objects.has(key);
  }

  /**
   * Returns the number of objects currently tracked in the registry.
   *
   * Note: this is the registry count, not the scene graph child count, which
   * may differ if Three.js internal helpers are present.
   */
  get objectCount(): number {
    return this._objects.size;
  }

  /**
   * Removes all registered objects from the scene and clears the registry.
   *
   * Use when tearing down a level or transitioning scenes.
   *
   * @example
   * ```ts
   * scene.clear(); // before loading the next level
   * ```
   */
  clear(): void {
    for (const object of this._objects.values()) {
      this._scene.remove(object);
    }
    this._objects.clear();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Adds the base lighting rig to the scene.
   *
   * Lighting setup:
   * - Ambient light (soft fill, intensity 0.6) — prevents fully black shadows
   * - Directional light (sun, intensity 1.2) — primary shadow caster, positioned
   *   above and to the side of the map to cast diagonal shadows
   */
  private _setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this._scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;

    // Shadow camera frustum sized for a typical 32x32 tile map
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;

    // 2048x2048 shadow map — high enough for clean shadows without GPU overrun
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.001;

    this._scene.add(sun);
  }
}
