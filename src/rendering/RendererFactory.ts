/**
 * RendererFactory
 *
 * Constructs the best available Three.js renderer for the current browser.
 * Prefers WebGPU (via `three/webgpu`) and transparently falls back to WebGL
 * when WebGPU is unavailable.
 *
 * @module rendering/RendererFactory
 *
 * @example
 * ```ts
 * const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
 * const renderer = await RendererFactory.create(canvas);
 * // renderer is always typed as THREE.WebGLRenderer for downstream compatibility
 * ```
 *
 * Thread-safety: NOT thread-safe. Must be called from the main thread.
 * Allocation: One-time setup; no per-frame allocations.
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Describes which renderer backend was selected at construction time. */
export type RendererBackend = 'webgpu' | 'webgl';

/** The constructed renderer paired with the backend that was chosen. */
export interface RendererResult {
  /** The Three.js renderer instance. Cast to WebGLRenderer for API access. */
  renderer: THREE.WebGLRenderer;
  /** Which backend is actually running behind the renderer. */
  backend: RendererBackend;
}

// ---------------------------------------------------------------------------
// RendererFactory
// ---------------------------------------------------------------------------

/**
 * Static factory that creates and configures a Three.js renderer.
 *
 * Renderer configuration is applied consistently regardless of backend:
 * - Shadow maps enabled (PCFSoftShadowMap)
 * - Physically correct tone mapping (ACESFilmic)
 * - Device pixel ratio clamped to 2 (performance budget)
 * - Output color space: SRGBColorSpace
 */
export class RendererFactory {
  /** Maximum device pixel ratio. Capped to limit fill-rate on HiDPI displays. */
  private static readonly MAX_PIXEL_RATIO = 2;

  /**
   * Creates and returns the best available renderer for the current browser.
   *
   * Attempts WebGPU first. If the browser does not support WebGPU, or if
   * WebGPU initialization throws, falls back silently to WebGLRenderer.
   *
   * @param canvas - The HTMLCanvasElement to render into.
   * @returns A RendererResult containing the configured renderer and the
   *          backend that was selected.
   *
   * @example
   * ```ts
   * const { renderer, backend } = await RendererFactory.create(canvas);
   * console.log(`Running on ${backend}`);
   * renderer.setSize(window.innerWidth, window.innerHeight);
   * ```
   */
  static async create(canvas: HTMLCanvasElement): Promise<RendererResult> {
    const webgpuResult = await RendererFactory.tryCreateWebGPU(canvas);
    if (webgpuResult !== null) {
      return webgpuResult;
    }

    console.info('[RendererFactory] WebGPU unavailable — falling back to WebGL.');
    const renderer = RendererFactory.createWebGL(canvas);
    return { renderer, backend: 'webgl' };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Attempts to construct a WebGPURenderer.
   *
   * The `three/webgpu` module is dynamically imported so that it is only
   * loaded when WebGPU may be available, keeping the initial bundle lighter
   * for WebGL-only users.
   *
   * @returns A configured RendererResult on success, or null on any failure.
   */
  private static async tryCreateWebGPU(canvas: HTMLCanvasElement): Promise<RendererResult | null> {
    if (!navigator.gpu) {
      return null;
    }

    try {
      // r172 exports WebGPURenderer as a named export from 'three/webgpu'.
      const { WebGPURenderer } = await import('three/webgpu');

      const gpuRenderer = new WebGPURenderer({ canvas, antialias: true });
      await gpuRenderer.init();

      // Cast to WebGLRenderer so all downstream systems share a single type.
      // The public API surface used by this project (setSize, render, shadowMap,
      // toneMapping, outputColorSpace) is identical on both renderers.
      const renderer = gpuRenderer as unknown as THREE.WebGLRenderer;
      RendererFactory.applySharedConfig(renderer);

      console.info('[RendererFactory] WebGPURenderer initialized.');
      return { renderer, backend: 'webgpu' };
    } catch (err: unknown) {
      console.warn('[RendererFactory] WebGPU init failed:', err);
      return null;
    }
  }

  /**
   * Creates a standard WebGLRenderer as the fallback backend.
   *
   * @returns A fully configured THREE.WebGLRenderer.
   */
  private static createWebGL(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    RendererFactory.applySharedConfig(renderer);
    console.info('[RendererFactory] WebGLRenderer initialized.');
    return renderer;
  }

  /**
   * Applies identical visual and performance configuration to any renderer.
   *
   * Kept in one place so WebGPU and WebGL paths are always in sync.
   *
   * @param renderer - The renderer to configure.
   */
  private static applySharedConfig(renderer: THREE.WebGLRenderer): void {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, RendererFactory.MAX_PIXEL_RATIO));
  }
}
