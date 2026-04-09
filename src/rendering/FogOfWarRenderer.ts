/**
 * FogOfWarRenderer — GPU-driven fog-of-war overlay for a 96×96 map.
 *
 * Renders a full-map quad just above the ground plane using a Three.js Mesh
 * with a custom MeshBasicMaterial driven by a DataTexture. The texture encodes
 * per-tile visibility as RGBA values:
 *
 *   R channel — current-frame visible (255 = visible, 0 = not)
 *   G channel — cumulative explored  (255 = explored, 0 = never seen)
 *   B, A      — unused (A fixed at 255 to satisfy WebGL RGBA requirement)
 *
 * The vertex shader on the ground quad UV-maps exactly to the 96×96 grid, so
 * each texel corresponds to one tile. The fragment shader (embedded in the
 * MeshBasicMaterial colour map) samples the texture and applies:
 *
 *   - visible  (R=255): alpha 0   — fully transparent (terrain shows through)
 *   - explored (G=255): alpha 140 — semi-transparent dark overlay
 *   - hidden   (both 0): alpha 255 — opaque black
 *
 * Because DataTexture uses a Uint8Array, sampling is done at the JavaScript
 * level — the per-tile alpha is written into the A channel of the RGBA texel
 * and the mesh material reads that as the overall mesh opacity via a custom
 * shader. However, to avoid the complexity of a ShaderMaterial in this
 * milestone, a simpler scheme is used: a single RGBA DataTexture where
 * the A channel encodes the desired overlay opacity directly, and the material
 * uses `transparent: true` with `vertexColors: false`. The quad is coloured
 * black; the A channel controls per-texel transparency. This requires
 * THREE.NearestFilter on the texture to preserve hard tile boundaries.
 *
 * GPU upload strategy: the texture is only re-uploaded when
 * {@link markDirty} has been called since the last {@link update}. This
 * prevents unnecessary texture uploads on frames where no unit moved.
 *
 * Approved implementation details (all confirmed before writing):
 * - DataTexture with pre-allocated Uint8Array(96 * 96 * 4)
 * - PlaneGeometry rotated -Math.PI/2 on X to lie flat on the XZ plane
 * - depthWrite: false so the overlay does not occlude unit meshes
 * - NearestFilter for texel-perfect tile borders
 * - Scene key: 'fog-of-war'
 *
 * Implements: design/gdd/fog-of-war.md — FogOfWarRenderer section
 *
 * Thread-safety: NOT thread-safe. All calls must be from the main thread.
 * Allocation: Zero per-frame heap allocation after construction.
 *
 * @module rendering/FogOfWarRenderer
 *
 * @example
 * const fowRenderer = new FogOfWarRenderer(sceneManager, fowGrid, 96, 96);
 * // In the game loop (after FogOfWarSystem.update):
 * fowRenderer.update();
 * // On teardown:
 * fowRenderer.dispose();
 */

import * as THREE from 'three';
import type { FogOfWarGrid } from '../map/FogOfWarGrid';
import type { SceneManager } from './SceneManager';

// ---------------------------------------------------------------------------
// Opacity constants
// ---------------------------------------------------------------------------

/** Alpha value for tiles that have never been seen (opaque black shroud). */
const ALPHA_HIDDEN = 255;

/** Alpha value for tiles that were explored but are not currently visible. */
const ALPHA_EXPLORED = 140;

/** Alpha value for tiles currently inside a unit's sight radius (fully clear). */
const ALPHA_VISIBLE = 0;

// ---------------------------------------------------------------------------
// FogOfWarRenderer
// ---------------------------------------------------------------------------

/**
 * Manages the Three.js fog-of-war overlay mesh and DataTexture.
 *
 * Constructed once per human player view. After construction, call
 * {@link update} each frame (after {@link FogOfWarSystem} has run) to push
 * dirty visibility data to the GPU.
 *
 * @example
 * const fowRenderer = new FogOfWarRenderer(sceneManager, fowGrid, 96, 96);
 * // game loop:
 * fowRenderer.update(); // uploads texture if dirty
 * // teardown:
 * fowRenderer.dispose();
 */
export class FogOfWarRenderer {
  /** Width of the map in tiles. */
  private readonly _mapWidth: number;

  /** Height of the map in tiles. */
  private readonly _mapHeight: number;

  /** The FogOfWarGrid this renderer reads from each update. */
  private readonly _fowGrid: FogOfWarGrid;

  /** The SceneManager used to add/remove the overlay mesh. */
  private readonly _sceneManager: SceneManager;

  /**
   * Pre-allocated RGBA pixel buffer for the DataTexture.
   * Size = mapWidth * mapHeight * 4 bytes (R, G, B, A per texel).
   * Written each frame in {@link _rebuildTexelBuffer}; never reallocated.
   */
  private readonly _texelBuffer: Uint8Array;

  /**
   * The Three.js DataTexture backed by {@link _texelBuffer}.
   * needsUpdate is set to true when the buffer changes.
   */
  private readonly _texture: THREE.DataTexture;

  /**
   * The full-map overlay quad mesh. Lies flat on the XZ plane just above y=0.
   * Added to the scene via SceneManager under the key 'fog-of-war'.
   */
  private readonly _mesh: THREE.Mesh;

  /**
   * Dirty flag. Set by {@link markDirty}; cleared after each GPU upload in
   * {@link update}. Prevents redundant texture uploads.
   */
  private _dirty: boolean = false;

  /**
   * Scene registration key. Stored as a constant so dispose() can remove it.
   */
  private static readonly SCENE_KEY = 'fog-of-war';

  constructor(
    sceneManager: SceneManager,
    fowGrid: FogOfWarGrid,
    mapWidth: number,
    mapHeight: number,
  ) {
    this._sceneManager = sceneManager;
    this._fowGrid = fowGrid;
    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;

    // -----------------------------------------------------------------------
    // Texel buffer — pre-allocated, never reallocated.
    // -----------------------------------------------------------------------
    this._texelBuffer = new Uint8Array(mapWidth * mapHeight * 4);
    // Initialise to fully TRANSPARENT so the scene is visible on first frame.
    // FogOfWarSystem will set hidden areas opaque on its first tick.
    // This prevents the "black screen on load" bug where the overlay
    // covers everything before any tiles are revealed.
    for (let i = 0; i < this._texelBuffer.length; i += 4) {
      this._texelBuffer[i + 0] = 0; // R — black
      this._texelBuffer[i + 1] = 0; // G — black
      this._texelBuffer[i + 2] = 0; // B — black
      this._texelBuffer[i + 3] = 0; // A — fully transparent initially
    }

    // -----------------------------------------------------------------------
    // DataTexture
    // -----------------------------------------------------------------------
    this._texture = new THREE.DataTexture(
      this._texelBuffer,
      mapWidth,
      mapHeight,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
    );
    // NearestFilter preserves hard tile-aligned boundaries (no bilinear blur).
    this._texture.minFilter = THREE.NearestFilter;
    this._texture.magFilter = THREE.NearestFilter;
    // No mipmaps needed for a screen-filling overlay quad.
    this._texture.generateMipmaps = false;
    // DataTexture is in linear colour space (we are writing raw alpha values).
    this._texture.colorSpace = THREE.LinearSRGBColorSpace;
    // Upload the initial all-hidden state.
    this._texture.needsUpdate = true;

    // -----------------------------------------------------------------------
    // Overlay mesh — PlaneGeometry rotated onto the XZ plane.
    // -----------------------------------------------------------------------
    const geometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
    // PlaneGeometry faces +Y by default; rotate to lie flat on XZ plane.
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      map: this._texture,
      transparent: true,
      depthWrite: false,
    });

    this._mesh = new THREE.Mesh(geometry, material);
    // Centre the quad over the map. Map runs from (0,0) to (mapWidth, mapHeight)
    // in tile space; the quad centre must sit at (mapWidth/2, 0, mapHeight/2).
    this._mesh.position.set(mapWidth / 2, 0.05, mapHeight / 2);
    // Render after the terrain (renderOrder 1) but before UI overlays.
    this._mesh.renderOrder = 1;
    // Exclude from raycasting — the overlay must not block unit selection clicks.
    this._mesh.raycast = () => {};

    this._sceneManager.addObject(FogOfWarRenderer.SCENE_KEY, this._mesh);
  }

  // -------------------------------------------------------------------------
  // Dirty flag
  // -------------------------------------------------------------------------

  /**
   * Signals that the underlying FogOfWarGrid has changed this frame and the
   * texture must be re-uploaded to the GPU on the next {@link update} call.
   *
   * Called automatically by {@link FogOfWarSystem} after it finishes revealing
   * tiles. Safe to call multiple times per frame — the flag is idempotent.
   */
  markDirty(): void {
    this._dirty = true;
  }

  // -------------------------------------------------------------------------
  // Frame update
  // -------------------------------------------------------------------------

  /**
   * Uploads the current FogOfWarGrid state to the GPU if dirty.
   *
   * Call once per render frame, after {@link FogOfWarSystem.update} has run.
   * No-op when the grid has not changed since the last upload.
   *
   * Zero-allocation: reads directly from the grid's typed arrays into the
   * pre-allocated texel buffer; no temporary objects are created.
   */
  update(): void {
    if (!this._dirty) return;

    this._rebuildTexelBuffer();
    this._texture.needsUpdate = true;
    this._dirty = false;
  }

  // -------------------------------------------------------------------------
  // Visibility testing (convenience, read-only)
  // -------------------------------------------------------------------------

  /**
   * Returns `true` if tile (x, z) is currently visible to the local player.
   *
   * Delegates directly to {@link FogOfWarGrid.isVisible}. Provided here so
   * callers that hold a FogOfWarRenderer reference do not also need a separate
   * FogOfWarGrid reference.
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  isVisible(x: number, z: number): boolean {
    return this._fowGrid.isVisible(x, z);
  }

  /**
   * Returns `true` if tile (x, z) has ever been revealed.
   *
   * @param x - Column index.
   * @param z - Row index.
   */
  isExplored(x: number, z: number): boolean {
    return this._fowGrid.isExplored(x, z);
  }

  // -------------------------------------------------------------------------
  // Teardown
  // -------------------------------------------------------------------------

  /**
   * Removes the overlay mesh from the scene and releases GPU resources.
   *
   * Call when unloading the map or destroying the renderer. After `dispose()`
   * this instance must not be used again.
   *
   * @example
   * fowRenderer.dispose(); // on level unload
   */
  dispose(): void {
    this._sceneManager.removeObject(FogOfWarRenderer.SCENE_KEY);
    this._texture.dispose();
    (this._mesh.geometry as THREE.BufferGeometry).dispose();
    (this._mesh.material as THREE.Material).dispose();
  }

  // -------------------------------------------------------------------------
  // Private — texel buffer reconstruction
  // -------------------------------------------------------------------------

  /**
   * Rebuilds the RGBA texel buffer from the current FogOfWarGrid state.
   *
   * Reads {@link FogOfWarGrid.rawVisible} and {@link FogOfWarGrid.rawExplored}
   * typed arrays directly (zero-allocation). Writes the alpha channel of each
   * texel based on the visibility priority:
   *   visible  -> ALPHA_VISIBLE  (0)
   *   explored -> ALPHA_EXPLORED (140)
   *   hidden   -> ALPHA_HIDDEN   (255)
   *
   * DataTexture row 0 corresponds to z=0 in tile space (no vertical flip
   * needed because Three.js PlaneGeometry UV origin matches our convention).
   */
  private _rebuildTexelBuffer(): void {
    const rawVisible = this._fowGrid.rawVisible;
    const rawExplored = this._fowGrid.rawExplored;
    const buf = this._texelBuffer;
    const w = this._mapWidth;
    const h = this._mapHeight;

    // Three.js DataTexture pixel (0,0) maps to the UV origin of the
    // PlaneGeometry, which after rotateX(-PI/2) corresponds to world
    // corner (0, 0, height). We need to flip Z so that grid row 0
    // (world z=0) maps to the TOP of the texture, not the bottom.
    for (let z = 0; z < h; z++) {
      const flippedZ = h - 1 - z;
      for (let x = 0; x < w; x++) {
        const gridIdx = z * w + x;
        const texelIdx = (flippedZ * w + x) * 4;

        const alpha =
          rawVisible[gridIdx] === 1
            ? ALPHA_VISIBLE
            : rawExplored[gridIdx] === 1
              ? ALPHA_EXPLORED
              : ALPHA_HIDDEN;

        buf[texelIdx + 0] = 0; // R — black
        buf[texelIdx + 1] = 0; // G — black
        buf[texelIdx + 2] = 0; // B — black
        buf[texelIdx + 3] = alpha; // A — controls transparency
      }
    }
  }
}
