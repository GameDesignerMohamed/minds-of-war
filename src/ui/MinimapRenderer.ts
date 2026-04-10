/**
 * MinimapRenderer — canvas-based overhead minimap for the Minds of War HUD.
 *
 * Renders a 160×160 pixel canvas showing entity positions mapped from world
 * space (96×96 tiles) to canvas pixels. Entities are colour-coded by faction:
 * - Units: cyan (#e8a840) for Human, red (#ff5533) for Orc.
 * - Buildings: same palette, drawn as 3×3 px squares.
 * - Resource nodes (gold mines): gold (#f2c03d) dots.
 *
 * Terrain geometry (forests, cliffs) is not currently stored in ECS and is
 * therefore not drawn. When a terrain component is added to the ECS this
 * renderer should be updated to query it.
 *
 * Fog-of-war awareness:
 * - Entities are only drawn if their tile is currently visible OR explored
 *   according to the provided {@link FogOfWarGrid}.
 * - Explored-but-not-visible entities are drawn at 40 % opacity to indicate
 *   last-known position.
 *
 * Camera viewport:
 * - A white rectangle outline shows the approximate camera frustum projected
 *   onto the minimap. The CameraController exposes camera.position (X, Z) and
 *   the approximate view extents are estimated from a fixed 60° FOV and camera
 *   height of 80 units, which matches the CameraController defaults.
 *
 * Click-to-pan:
 * - Clicking the canvas converts the canvas pixel to a world Position and calls
 *   onClickPosition. The caller is expected to forward this to
 *   CameraController.centerOn().
 *
 * Throttle:
 * - Redraws are throttled to at most one per 500 ms to avoid unnecessary
 *   canvas work. Call update() every frame; the throttle is internal.
 *
 * Accessibility:
 * - Canvas has aria-label and role="img".
 * - Canvas is keyboard-focusable; Enter/Space re-centres to map centre.
 * - Respects prefers-reduced-motion (skips animated fade-in of container).
 *
 * @example
 * const minimap = new MinimapRenderer(world, fogGrid, 96, 96, (pos) => {
 *   camera.centerOn(pos.x, pos.z);
 * });
 * minimap.mount(hud.minimapFrame!);
 *
 * // In game loop:
 * minimap.update();
 *
 * // On teardown:
 * minimap.dispose();
 */

import { World } from '@/ecs/World';
import { FogOfWarGrid } from '@/map/FogOfWarGrid';
import type { Position } from '@/types';
import {
  PositionType,
  OwnerType,
  BuildingType,
  UnitType,
  ResourceNodeType,
} from '@/ecs/components/GameComponents';
import type {
  PositionComponent,
  OwnerComponent,
  BuildingComponent,
  ResourceNodeComponent,
} from '@/ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Pixel dimensions of the minimap canvas. */
const CANVAS_SIZE = 160;

/** Background fill colour — matches Animoca dark theme. */
const BG_COLOR = '#050512';

/** Faction dot colours. */
const COLOR_HUMAN = '#e8a840';
const COLOR_ORC = '#ff5533';
const COLOR_RESOURCE = '#f2c03d';

/** Dot radius for units (in canvas pixels). */
const UNIT_RADIUS = 1.5;

/** Half-size (in canvas pixels) for building squares. */
const BUILDING_HALF = 2;

/** Camera viewport approximation: fixed height matching CameraController default. */
const CAMERA_HEIGHT_WORLD = 80;
/** Approximate vertical FOV in radians (60° converted). */
const CAMERA_FOV_RAD = (60 * Math.PI) / 180;

/** Throttle interval in milliseconds. */
const REDRAW_INTERVAL_MS = 500;

// ---------------------------------------------------------------------------
// MinimapRenderer
// ---------------------------------------------------------------------------

/**
 * Manages a canvas overlay that renders the game world from above.
 *
 * Mount into the HUD minimap frame element. Call update() each game loop
 * tick; internal throttling limits actual redraws to ~2 per second.
 */
export class MinimapRenderer {
  private readonly _world: World;
  private readonly _fogGrid: FogOfWarGrid;
  private readonly _mapW: number;
  private readonly _mapH: number;
  private readonly _onClick: (worldPos: Position) => void;

  private _container: HTMLElement | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;

  /** Timestamp of the last canvas redraw (from performance.now()). */
  private _lastDrawMs = -Infinity;

  /** Whether the user prefers reduced motion. */
  private readonly _reducedMotion: boolean;

  /**
   * @param world            - The ECS world to query entity positions from.
   * @param fogGrid          - The local player's fog-of-war grid.
   * @param mapWidth         - World tile width (default 96).
   * @param mapHeight        - World tile height (default 96).
   * @param onClickPosition  - Called with the world-space Position when the
   *                           player clicks the minimap.
   */
  constructor(
    world: World,
    fogGrid: FogOfWarGrid,
    mapWidth: number,
    mapHeight: number,
    onClickPosition: (worldPos: Position) => void,
  ) {
    this._world = world;
    this._fogGrid = fogGrid;
    this._mapW = mapWidth;
    this._mapH = mapHeight;
    this._onClick = onClickPosition;
    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Creates the minimap label and canvas, then appends both to `parent`.
   *
   * Clears any existing placeholder content in the parent before mounting.
   * Safe to call only once. Create a new instance to remount.
   *
   * @param parent - The HUD minimap frame element (e.g. hud.minimapFrame).
   */
  mount(parent: HTMLElement): void {
    if (this._canvas !== null) return;

    // Clear placeholder text from HUD frame.
    parent.innerHTML = '';

    this._container = this._buildContainer();

    // Label above canvas
    const label = this._buildLabel();
    this._container.appendChild(label);

    // Canvas
    this._canvas = this._buildCanvas();
    this._ctx = this._canvas.getContext('2d');
    this._container.appendChild(this._canvas);

    parent.appendChild(this._container);

    // Fade-in (skip if reduced motion)
    if (!this._reducedMotion) {
      this._container.style.opacity = '0';
      requestAnimationFrame(() => {
        if (this._container !== null) {
          this._container.style.transition = 'opacity 0.3s ease';
          this._container.style.opacity = '1';
        }
      });
    }

    // Draw immediately so there is never a blank canvas on first frame.
    this._draw();
    this._lastDrawMs = performance.now();
  }

  /**
   * Triggers a canvas redraw if the throttle interval has elapsed.
   *
   * Call this once per game loop frame. The actual redraw only runs at most
   * once every 500 ms.
   */
  update(): void {
    if (this._canvas === null) return;
    const now = performance.now();
    if (now - this._lastDrawMs < REDRAW_INTERVAL_MS) return;
    this._lastDrawMs = now;
    this._draw();
  }

  /** Removes the minimap elements from the DOM and clears all references. */
  dispose(): void {
    this._container?.remove();
    this._container = null;
    this._canvas = null;
    this._ctx = null;
  }

  // -------------------------------------------------------------------------
  // DOM construction (private)
  // -------------------------------------------------------------------------

  private _buildContainer(): HTMLElement {
    const el = document.createElement('div');
    Object.assign(el.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      width: '100%',
      height: '100%',
      padding: '10px',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildLabel(): HTMLElement {
    const el = document.createElement('div');
    el.textContent = 'MINIMAP';
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, {
      fontFamily: "'Space Mono', monospace",
      fontWeight: '700',
      fontSize: '0.65rem',
      letterSpacing: '0.14em',
      color: 'rgba(232,168,64,0.50)',
      userSelect: 'none',
      lineHeight: '1',
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Minimap — overview of the battlefield');
    canvas.tabIndex = 0;

    Object.assign(canvas.style, {
      width: `${CANVAS_SIZE}px`,
      height: `${CANVAS_SIZE}px`,
      display: 'block',
      cursor: 'crosshair',
      borderRadius: '2px',
      outline: 'none',
      maxWidth: '100%',
      maxHeight: '100%',
    } satisfies Partial<CSSStyleDeclaration>);

    canvas.addEventListener('click', this._handleClick.bind(this));
    canvas.addEventListener('keydown', (e: KeyboardEvent) => {
      // Enter or Space re-centres view to map centre.
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        this._onClick({ x: this._mapW / 2, z: this._mapH / 2 });
      }
    });
    // Focus ring style via CSS injection (once per document)
    this._injectFocusStyle();

    return canvas;
  }

  private _injectFocusStyle(): void {
    const STYLE_ID = 'minimap-focus-style';
    if (document.getElementById(STYLE_ID) !== null) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      canvas[aria-label*="Minimap"]:focus-visible {
        outline: 2px solid #e8a840;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  // -------------------------------------------------------------------------
  // Click handler (private)
  // -------------------------------------------------------------------------

  private _handleClick(e: MouseEvent): void {
    if (this._canvas === null) return;

    const rect = this._canvas.getBoundingClientRect();
    // CSS pixels relative to canvas top-left
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    // Scale from CSS pixels → canvas pixels (handles HiDPI via CSS width override)
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    const canvasX = cssX * scaleX;
    const canvasY = cssY * scaleY;

    const worldPos = this._canvasToWorld(canvasX, canvasY);
    this._onClick(worldPos);
  }

  // -------------------------------------------------------------------------
  // Coordinate mapping (private)
  // -------------------------------------------------------------------------

  /** Maps a world tile coordinate to a canvas pixel coordinate. */
  private _worldToCanvas(worldX: number, worldZ: number): { cx: number; cz: number } {
    return {
      cx: (worldX / this._mapW) * CANVAS_SIZE,
      cz: (worldZ / this._mapH) * CANVAS_SIZE,
    };
  }

  /** Maps a canvas pixel coordinate to an approximate world tile position. */
  private _canvasToWorld(canvasX: number, canvasZ: number): Position {
    return {
      x: (canvasX / CANVAS_SIZE) * this._mapW,
      z: (canvasZ / CANVAS_SIZE) * this._mapH,
    };
  }

  // -------------------------------------------------------------------------
  // Drawing (private)
  // -------------------------------------------------------------------------

  /**
   * Performs a full canvas redraw.
   *
   * Draw order (painter's algorithm, back to front):
   * 1. Background
   * 2. Resource nodes
   * 3. Buildings
   * 4. Units
   * 5. Camera viewport rectangle
   */
  private _draw(): void {
    const ctx = this._ctx;
    if (ctx === null) return;

    // 1. Background
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Resource nodes (gold mines)
    this._drawResourceNodes(ctx);

    // 3. Buildings
    this._drawBuildings(ctx);

    // 4. Units
    this._drawUnits(ctx);

    // 5. Camera viewport (no camera reference held — drawn by caller if needed;
    //    see _drawViewportRect below which is called externally when a camera
    //    reference is available via updateWithCamera())
  }

  /** Draws gold mine dots. */
  private _drawResourceNodes(ctx: CanvasRenderingContext2D): void {
    for (const [entity, node] of this._world.query<ResourceNodeComponent>(ResourceNodeType)) {
      if (node.remaining <= 0) continue;
      const pos = this._world.getComponent<PositionComponent>(entity, PositionType);
      if (pos === undefined) continue;

      const tileX = Math.floor(pos.x);
      const tileZ = Math.floor(pos.z);
      const vis = this._fogGrid.getState(tileX, tileZ);
      if (vis === 'hidden') continue;

      const { cx, cz } = this._worldToCanvas(pos.x, pos.z);

      ctx.globalAlpha = vis === 'explored' ? 0.4 : 1.0;
      ctx.fillStyle = COLOR_RESOURCE;
      ctx.beginPath();
      ctx.arc(cx, cz, UNIT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  /** Draws building squares, coloured by faction. */
  private _drawBuildings(ctx: CanvasRenderingContext2D): void {
    for (const [entity] of this._world.query<BuildingComponent>(BuildingType)) {
      const pos = this._world.getComponent<PositionComponent>(entity, PositionType);
      const owner = this._world.getComponent<OwnerComponent>(entity, OwnerType);
      if (pos === undefined || owner === undefined) continue;

      const tileX = Math.floor(pos.x);
      const tileZ = Math.floor(pos.z);
      const vis = this._fogGrid.getState(tileX, tileZ);
      if (vis === 'hidden') continue;

      const { cx, cz } = this._worldToCanvas(pos.x, pos.z);
      const color = owner.faction === 'Orc' ? COLOR_ORC : COLOR_HUMAN;

      ctx.globalAlpha = vis === 'explored' ? 0.4 : 1.0;
      ctx.fillStyle = color;
      ctx.fillRect(cx - BUILDING_HALF, cz - BUILDING_HALF, BUILDING_HALF * 2, BUILDING_HALF * 2);
    }
    ctx.globalAlpha = 1.0;
  }

  /** Draws unit dots, coloured by faction. */
  private _drawUnits(ctx: CanvasRenderingContext2D): void {
    // Query entities that have both Position and Owner but NOT Building
    // (buildings are already drawn above). We use UnitType as the primary
    // to exclude buildings without a secondary filter allocation.
    for (const [entity] of this._world.query(UnitType)) {
      const pos = this._world.getComponent<PositionComponent>(entity, PositionType);
      const owner = this._world.getComponent<OwnerComponent>(entity, OwnerType);
      if (pos === undefined || owner === undefined) continue;

      const tileX = Math.floor(pos.x);
      const tileZ = Math.floor(pos.z);
      const vis = this._fogGrid.getState(tileX, tileZ);
      if (vis === 'hidden') continue;

      const { cx, cz } = this._worldToCanvas(pos.x, pos.z);
      const color = owner.faction === 'Orc' ? COLOR_ORC : COLOR_HUMAN;

      ctx.globalAlpha = vis === 'explored' ? 0.4 : 1.0;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cz, UNIT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Draws the camera viewport rectangle on top of the minimap.
   *
   * This is a separate public method so that callers who have a reference to
   * the CameraController can call it after update() each frame at full
   * framerate (viewport rect changes every frame; the entity layer is throttled).
   *
   * The viewport extent is estimated from the camera's Y height and a fixed
   * 60° FOV. This is an approximation — the actual projection depends on
   * aspect ratio — but is close enough for a minimap hint.
   *
   * @param cameraX - CameraController.camera.position.x
   * @param cameraZ - CameraController.camera.position.z
   */
  drawViewport(cameraX: number, cameraZ: number): void {
    const ctx = this._ctx;
    if (ctx === null) return;

    // Approximate half-extent of the visible world area in world units.
    // tan(fov/2) * height gives the half-width of the view frustum at ground.
    const halfExtent = Math.tan(CAMERA_FOV_RAD / 2) * CAMERA_HEIGHT_WORLD;

    const minX = cameraX - halfExtent;
    const minZ = cameraZ - halfExtent;
    const extW = halfExtent * 2;
    const extH = halfExtent * 2;

    const { cx: rx, cz: rz } = this._worldToCanvas(minX, minZ);
    const rw = (extW / this._mapW) * CANVAS_SIZE;
    const rh = (extH / this._mapH) * CANVAS_SIZE;

    ctx.strokeStyle = 'rgba(255,255,255,0.70)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, rz, rw, rh);
  }
}
