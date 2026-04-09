/**
 * HpBarSystem
 *
 * Manages HTML-overlay HP bars that track above Three.js entity meshes.
 * Each bar is a positioned `<div>` in a fullscreen overlay container. World
 * positions are projected to screen space each frame via the active camera.
 *
 * Approved signature: `updateBar(entityId, currentHp, maxHp, worldPosition)`
 * where `entityId` is a numeric `EntityId` used as a stable DOM key.
 *
 * @module rendering/HpBarSystem
 *
 * @example
 * ```ts
 * const hpBars = new HpBarSystem(document.getElementById('ui-overlay')!);
 *
 * // Register a bar when a unit spawns:
 * hpBars.registerBar(42);
 *
 * // Update each frame (after scene render, before next frame):
 * hpBars.updateBar(42, unit.currentHp, unit.maxHp, unit.worldPosition, camera);
 *
 * // Remove when the unit dies:
 * hpBars.removeBar(42);
 *
 * // Clean up all bars on level unload:
 * hpBars.dispose();
 * ```
 *
 * Thread-safety: NOT thread-safe. Must be driven from the main thread.
 * Allocation: DOM elements are created in `registerBar` and destroyed in
 *             `removeBar`. No per-frame DOM creation; only style mutation.
 */

import * as THREE from 'three';
import type { EntityId } from '@/types';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** DOM elements composing a single HP bar entry. */
interface HpBarEntry {
  /** The outermost positioned container div. */
  container: HTMLDivElement;
  /** The inner fill bar div; width % reflects HP fraction. */
  fill: HTMLDivElement;
}

// ---------------------------------------------------------------------------
// Constants — tuning knobs
// ---------------------------------------------------------------------------

/** Width of the HP bar container in CSS pixels. */
const BAR_WIDTH_PX = 48;

/** Height of the HP bar container in CSS pixels. */
const BAR_HEIGHT_PX = 6;

/**
 * Screen-space pixel offset above the projected ground position.
 * Lifts the bar above the entity visually without being affected by camera angle.
 */
const SCREEN_Y_OFFSET_PX = 30;

/** CSS color when HP fraction is above the warning threshold. */
const COLOR_HEALTHY = '#22cc44';

/** CSS color when HP fraction is at or below the warning threshold. */
const COLOR_WARNING = '#ffaa00';

/** CSS color when HP fraction is at or below the critical threshold. */
const COLOR_CRITICAL = '#ee2222';

/** HP fraction (0–1) at which the bar color transitions to WARNING. */
const THRESHOLD_WARNING = 0.5;

/** HP fraction (0–1) at which the bar color transitions to CRITICAL. */
const THRESHOLD_CRITICAL = 0.25;

// ---------------------------------------------------------------------------
// HpBarSystem
// ---------------------------------------------------------------------------

/**
 * Drives a pool of HTML HP bars positioned in screen space above 3D entities.
 *
 * The overlay container must have `position: absolute` (or fixed) and cover
 * the full canvas, with `pointer-events: none` so it does not block mouse
 * input to the game canvas.
 */
export class HpBarSystem {
  /** The overlay container element into which all bar divs are appended. */
  private readonly _overlay: HTMLElement;

  /**
   * Active bar registry, keyed by EntityId.
   * Using a Map keeps registration and removal O(1).
   */
  private readonly _bars: Map<EntityId, HpBarEntry> = new Map();

  /**
   * Reusable NDC vector to avoid per-frame Vector3 allocation.
   * Holds the projected position from world space to NDC.
   */
  private readonly _ndcPos: THREE.Vector3 = new THREE.Vector3();

  /**
   * Constructs an HpBarSystem.
   *
   * @param overlay - A fullscreen HTML element that sits above the game canvas.
   *                  Recommended styles: `position:absolute; top:0; left:0;
   *                  width:100%; height:100%; pointer-events:none; overflow:hidden`.
   */
  constructor(overlay: HTMLElement) {
    this._overlay = overlay;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Creates and registers an HP bar DOM element for an entity.
   *
   * Safe to call if `entityId` is already registered — the existing bar is
   * removed and recreated. Typical call site: entity spawn event.
   *
   * @param entityId - The stable numeric ID of the entity (from ECS world).
   *
   * @example
   * ```ts
   * world.on('unit:spawned', (entityId) => hpBars.registerBar(entityId));
   * ```
   */
  registerBar(entityId: EntityId): void {
    // Clean up any pre-existing bar for this id
    if (this._bars.has(entityId)) {
      this.removeBar(entityId);
    }

    const container = document.createElement('div');
    container.style.cssText = [
      'position:absolute',
      `width:${BAR_WIDTH_PX}px`,
      `height:${BAR_HEIGHT_PX}px`,
      'background:rgba(0,0,0,0.55)',
      'border-radius:3px',
      'overflow:hidden',
      'transform:translate(-50%,-100%)',
      'pointer-events:none',
    ].join(';');

    // data attribute for debug inspection
    container.dataset['entityId'] = String(entityId);

    const fill = document.createElement('div');
    fill.style.cssText = [
      'height:100%',
      'width:100%',
      `background:${COLOR_HEALTHY}`,
      'transition:width 0.1s linear',
    ].join(';');

    container.appendChild(fill);
    this._overlay.appendChild(container);

    this._bars.set(entityId, { container, fill });
  }

  /**
   * Projects the entity's world position to screen space and updates the bar's
   * position, fill width, and color to reflect current HP.
   *
   * Must be called once per frame per visible entity, after `renderer.render()`
   * so the camera matrices are up to date.
   *
   * If `entityId` is not registered, this call is a no-op.
   *
   * @param entityId      - The entity whose bar to update.
   * @param currentHp     - Current HP value (clamped to [0, maxHp]).
   * @param maxHp         - Maximum HP value. Must be > 0.
   * @param worldPosition - The entity's world-space XZ position.
   *                        The system adds `WORLD_Y_OFFSET` internally.
   * @param camera        - The active camera, used for world-to-screen projection.
   *
   * @example
   * ```ts
   * // In game loop, after renderer.render():
   * for (const [id, unit] of world.units) {
   *   hpBars.updateBar(id, unit.hp, unit.maxHp, unit.position, camera);
   * }
   * ```
   */
  updateBar(
    entityId: EntityId,
    currentHp: number,
    maxHp: number,
    worldPosition: THREE.Vector3Like,
    camera: THREE.Camera,
  ): void {
    const entry = this._bars.get(entityId);
    if (entry === undefined) return;

    // -- Project ground-level position, then offset in screen pixels --
    // Use Y=0 (ground level) so the bar aligns with the mesh base,
    // then shift up by a fixed pixel amount.
    this._ndcPos.set(worldPosition.x, 0, worldPosition.z);
    this._ndcPos.project(camera);

    // NDC: x,y in [-1,1]. Convert to CSS pixel offset.
    const screenX = (this._ndcPos.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-this._ndcPos.y * 0.5 + 0.5) * window.innerHeight - SCREEN_Y_OFFSET_PX;

    // Hide bars that have gone behind the camera (NDC z > 1)
    const behind = this._ndcPos.z > 1;
    entry.container.style.display = behind ? 'none' : 'block';
    if (behind) return;

    entry.container.style.left = `${screenX}px`;
    entry.container.style.top = `${screenY}px`;

    // -- Update fill --
    const safeCurrent = Math.max(0, Math.min(currentHp, maxHp));
    const fraction = maxHp > 0 ? safeCurrent / maxHp : 0;
    entry.fill.style.width = `${fraction * 100}%`;
    entry.fill.style.background = HpBarSystem._colorForFraction(fraction);
  }

  /**
   * Removes the HP bar for an entity from the DOM and the registry.
   *
   * Safe to call with an unregistered `entityId` — does nothing.
   *
   * @param entityId - The entity whose bar to remove.
   *
   * @example
   * ```ts
   * world.on('unit:died', (entityId) => hpBars.removeBar(entityId));
   * ```
   */
  removeBar(entityId: EntityId): void {
    const entry = this._bars.get(entityId);
    if (entry === undefined) return;
    entry.container.remove();
    this._bars.delete(entityId);
  }

  /**
   * Returns `true` if an HP bar is currently registered for the given entity.
   *
   * @param entityId - The entity to test.
   */
  hasBar(entityId: EntityId): boolean {
    return this._bars.has(entityId);
  }

  /**
   * Returns the number of HP bars currently active in the overlay.
   */
  get barCount(): number {
    return this._bars.size;
  }

  /**
   * Removes all HP bars from the DOM and clears the registry.
   *
   * Call on level unload or scene teardown.
   *
   * @example
   * ```ts
   * hpBars.dispose(); // before unloading the level
   * ```
   */
  dispose(): void {
    for (const entry of this._bars.values()) {
      entry.container.remove();
    }
    this._bars.clear();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns the appropriate CSS color string for the given HP fraction.
   *
   * @param fraction - HP ratio in [0, 1].
   */
  private static _colorForFraction(fraction: number): string {
    if (fraction <= THRESHOLD_CRITICAL) return COLOR_CRITICAL;
    if (fraction <= THRESHOLD_WARNING) return COLOR_WARNING;
    return COLOR_HEALTHY;
  }
}
