/**
 * CameraController — orthographic top-down RTS camera (Warcraft 2 style).
 *
 * Uses THREE.OrthographicCamera at a high angle (~70 degrees) looking down
 * at the map. Supports WASD/edge-scroll panning, mouse wheel zoom, and
 * map-bound clamping so the camera never shows void outside the map.
 *
 * @module rendering/CameraController
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CameraPanInput {
  horizontal: number;
  vertical: number;
}

// ---------------------------------------------------------------------------
// CameraController
// ---------------------------------------------------------------------------

export class CameraController {
  readonly camera: THREE.OrthographicCamera;

  private readonly _panSpeed: number;
  private readonly _mapWidth: number;
  private readonly _mapHeight: number;

  /** How many world units are visible horizontally at zoom=1. */
  private readonly _baseViewWidth: number;

  /** Zoom is locked — no runtime zoom changes allowed. */
  private readonly _zoom = 1.0;

  /** Camera offset from look-target: high angle, slight tilt toward player. */
  private static readonly CAM_OFFSET = new THREE.Vector3(0, 60, 20);

  /** The world-space XZ point the camera is looking at. */
  private readonly _lookTarget = new THREE.Vector3();

  /** Scratch vector for pan delta — zero allocations per frame. */
  private readonly _moveDir = new THREE.Vector3();

  /** Viewport dimensions in CSS pixels. */
  private _viewW: number;
  private _viewH: number;

  constructor(
    viewportWidth: number,
    viewportHeight: number,
    options: {
      panSpeed?: number;
      mapWidth?: number;
      mapHeight?: number;
      baseViewWidth?: number;
    } = {},
  ) {
    const { panSpeed = 30, mapWidth = 96, mapHeight = 96, baseViewWidth = 50 } = options;

    this._panSpeed = panSpeed;
    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;
    this._baseViewWidth = baseViewWidth;
    this._viewW = viewportWidth;
    this._viewH = viewportHeight;

    // Create orthographic camera with initial frustum
    const aspect = viewportWidth / viewportHeight;
    const halfW = baseViewWidth / 2;
    const halfH = halfW / aspect;

    this.camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 200);

    // Default look target = map center
    this._lookTarget.set(mapWidth / 2, 0, mapHeight / 2);
    this._updateCameraTransform();
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  update(deltaSeconds: number, input: CameraPanInput): void {
    const h = THREE.MathUtils.clamp(input.horizontal, -1, 1);
    const v = THREE.MathUtils.clamp(input.vertical, -1, 1);

    if (h !== 0 || v !== 0) {
      const distance = this._panSpeed * deltaSeconds;
      this._lookTarget.x += h * distance;
      this._lookTarget.z += v * distance;
    }

    this._clampToMapBounds();
    this._updateCameraTransform();
  }

  centerOn(worldX: number, worldZ: number): void {
    this._lookTarget.x = worldX;
    this._lookTarget.z = worldZ;
    this._clampToMapBounds();
    this._updateCameraTransform();
  }

  /** No-op — zoom is locked. Kept for API compatibility. */
  setZoom(_factor: number): void {
    /* locked */
  }

  /** No-op — zoom is locked. */
  adjustZoom(_delta: number): void {
    /* locked */
  }

  get zoom(): number {
    return this._zoom;
  }

  /** Half-width of the visible area in world units (accounts for zoom). */
  get viewHalfWidth(): number {
    return this._baseViewWidth / 2 / this._zoom;
  }

  /** Half-height of the visible area in world units (accounts for zoom). */
  get viewHalfHeight(): number {
    const aspect = this._viewW / this._viewH;
    return this.viewHalfWidth / aspect;
  }

  onResize(newWidth: number, newHeight: number): void {
    this._viewW = newWidth;
    this._viewH = newHeight;
    this._updateFrustum();
    this._clampToMapBounds();
    this._updateCameraTransform();
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private _updateFrustum(): void {
    const halfW = this.viewHalfWidth;
    const halfH = this.viewHalfHeight;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
  }

  private _clampToMapBounds(): void {
    const halfW = this.viewHalfWidth;
    const halfH = this.viewHalfHeight;

    // Clamp so visible area never exceeds map bounds
    // If the view is larger than the map (zoomed way out), center on map
    if (halfW * 2 >= this._mapWidth) {
      this._lookTarget.x = this._mapWidth / 2;
    } else {
      this._lookTarget.x = THREE.MathUtils.clamp(this._lookTarget.x, halfW, this._mapWidth - halfW);
    }

    if (halfH * 2 >= this._mapHeight) {
      this._lookTarget.z = this._mapHeight / 2;
    } else {
      this._lookTarget.z = THREE.MathUtils.clamp(
        this._lookTarget.z,
        halfH,
        this._mapHeight - halfH,
      );
    }
  }

  private _updateCameraTransform(): void {
    const offset = CameraController.CAM_OFFSET;
    this.camera.position.set(
      this._lookTarget.x + offset.x,
      this._lookTarget.y + offset.y,
      this._lookTarget.z + offset.z,
    );
    this.camera.lookAt(this._lookTarget);
  }
}
