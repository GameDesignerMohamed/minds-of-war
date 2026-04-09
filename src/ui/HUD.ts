/**
 * HUD — heads-up display root for Minds of War.
 *
 * Creates and manages the top-level HUD DOM layer: the resource bar across
 * the top of the viewport, and a minimap placeholder in the bottom-right.
 * Each widget is a fixed-position element; the caller owns the game canvas
 * and decides the overall page layout — HUD elements never overlap the canvas
 * interaction area.
 *
 * The HUD observes game state through an injected event bus and never reads
 * or writes ECS data directly.
 *
 * Visual spec:
 * - Dark background panels with 70 % opacity (rgba(10,12,16,0.70))
 * - Cyan accent text (#3df2c0, Space Mono for values)
 * - Section labels in Poppins 600
 * - Smooth CSS transitions on all numeric counters (counter-roll handled in
 *   _animateValue)
 *
 * Accessibility:
 * - All resource values have aria-label attributes.
 * - Font sizes use rem; root font-size is respected.
 * - No animation plays when prefers-reduced-motion is active.
 *
 * @example
 * const hud = new HUD(bus);
 * hud.mount(document.body);
 *
 * // Update resources from game events:
 * bus.emit('resourceUpdate', { gold: 500, wood: 120 });
 *
 * // Teardown:
 * hud.destroy();
 */

import { EventBus } from '@/core/EventBus';
import { applyUiFrameStyles, getResourceIconPath } from '@/art/ArtLibrary';

// ---------------------------------------------------------------------------
// Event map consumed by HUD
// ---------------------------------------------------------------------------

/** Subset of game events that the HUD needs to observe. */
export interface HUDEvents {
  /** Fired whenever the player's resource counts change. */
  resourceUpdate: { gold: number; wood: number };
  /** Fired when the in-game clock advances (integer seconds). */
  clockUpdate: { seconds: number };
  /** Fired when supply usage or cap changes. */
  supplyUpdate: { current: number; cap: number };
}

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------

/**
 * Top-level HUD root element.
 *
 * Manages the fixed HUD layout:
 * - Resource bar: top-center of viewport.
 * - Left sidebar: minimap, selection details, and command card.
 *
 * Call {@link mount} to inject into the DOM, {@link destroy} to clean up.
 */
export class HUD {
  private readonly _bus: EventBus<HUDEvents>;

  private _container: HTMLElement | null = null;
  private _goldEl: HTMLElement | null = null;
  private _woodEl: HTMLElement | null = null;
  private _supplyEl: HTMLElement | null = null;
  private _clockEl: HTMLElement | null = null;
  private _minimapFrame: HTMLElement | null = null;
  private _selectionFrame: HTMLElement | null = null;
  private _commandFrame: HTMLElement | null = null;

  /** Stores unsubscribe handles so destroy() can clean them up. */
  private readonly _unsubs: Array<() => void> = [];

  /** Cached reduced-motion preference — read once at mount time. */
  private _reducedMotion = false;

  /**
   * @param bus - Game event bus. Must carry the {@link HUDEvents} topic shape.
   */
  constructor(bus: EventBus<HUDEvents>) {
    this._bus = bus;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Creates HUD elements and appends them to `parent`.
   *
   * Safe to call only once. Call {@link destroy} and create a new instance
   * if you need to remount.
   *
   * @param parent - The DOM element to append HUD nodes into.
   *                 Typically `document.body`.
   */
  mount(parent: HTMLElement): void {
    if (this._container !== null) return;

    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._container = this._buildContainer();
    this._buildResourceBar();
    this._buildSidebar();

    parent.appendChild(this._container);

    this._unsubs.push(
      this._bus.on('resourceUpdate', ({ gold, wood }) => {
        this._setResource('gold', gold);
        this._setResource('wood', wood);
      }),
      this._bus.on('clockUpdate', ({ seconds }) => {
        this._setClock(seconds);
      }),
      this._bus.on('supplyUpdate', ({ current, cap }) => {
        if (this._supplyEl) this._supplyEl.textContent = `${current}/${cap}`;
      }),
    );
  }

  /**
   * Removes HUD DOM nodes and unsubscribes all event listeners.
   */
  destroy(): void {
    for (const unsub of this._unsubs) unsub();
    this._unsubs.length = 0;
    this._container?.remove();
    this._container = null;
  }

  /**
   * Exposes the minimap frame element so an external minimap renderer can
   * append its canvas into it.
   *
   * Returns `null` before {@link mount} is called.
   */
  get minimapFrame(): HTMLElement | null {
    return this._minimapFrame;
  }

  get selectionFrame(): HTMLElement | null {
    return this._selectionFrame;
  }

  get commandFrame(): HTMLElement | null {
    return this._commandFrame;
  }

  // -------------------------------------------------------------------------
  // DOM construction (private)
  // -------------------------------------------------------------------------

  private _buildContainer(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'hud-root';
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '100',
      fontFamily: "'Space Mono', 'Poppins', monospace",
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildResourceBar(): void {
    const bar = document.createElement('div');
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-label', 'Resource bar');
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '32px',
      alignItems: 'center',
      padding: '6px 24px',
      borderRadius: '0 0 8px 8px',
      backdropFilter: 'blur(6px)',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    applyUiFrameStyles(bar, 'panel', 14, 'rgba(10,12,16,0.88)');
    bar.style.borderTop = '';

    bar.appendChild(this._buildResourceWidget('gold', 'Gold', getResourceIconPath('gold') ?? '⬡'));
    bar.appendChild(this._buildDivider());
    bar.appendChild(this._buildResourceWidget('wood', 'Wood', getResourceIconPath('wood') ?? '⬟'));
    bar.appendChild(this._buildDivider());
    bar.appendChild(
      this._buildResourceWidget('supply', 'Supply', getResourceIconPath('supply') ?? '⊞'),
    );
    bar.appendChild(this._buildDivider());

    // Clock widget
    const clockWrap = document.createElement('div');
    Object.assign(clockWrap.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    } satisfies Partial<CSSStyleDeclaration>);

    const clockLabel = document.createElement('span');
    clockLabel.textContent = 'TIME';
    Object.assign(clockLabel.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.65rem',
      color: 'rgba(255,255,255,0.45)',
      letterSpacing: '0.08em',
    } satisfies Partial<CSSStyleDeclaration>);

    this._clockEl = document.createElement('span');
    this._clockEl.setAttribute('aria-label', 'Elapsed time');
    this._clockEl.textContent = '00:00';
    Object.assign(this._clockEl.style, {
      fontFamily: "'Space Mono', monospace",
      fontWeight: '700',
      fontSize: '0.95rem',
      color: '#3df2c0',
      minWidth: '50px',
    } satisfies Partial<CSSStyleDeclaration>);

    clockWrap.appendChild(clockLabel);
    clockWrap.appendChild(this._clockEl);
    bar.appendChild(clockWrap);

    this._container!.appendChild(bar);
  }

  private _buildResourceWidget(id: string, label: string, icon: string): HTMLElement {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    } satisfies Partial<CSSStyleDeclaration>);

    const iconEl = icon.startsWith('/')
      ? document.createElement('img')
      : document.createElement('span');
    iconEl.setAttribute('aria-hidden', 'true');

    if (iconEl instanceof HTMLImageElement) {
      iconEl.src = icon;
      iconEl.alt = '';
      Object.assign(iconEl.style, {
        width: '18px',
        height: '18px',
        imageRendering: 'pixelated',
      } satisfies Partial<CSSStyleDeclaration>);
    } else {
      iconEl.textContent = icon;
      Object.assign(iconEl.style, {
        fontSize: '0.9rem',
        color: '#3df2c0',
      } satisfies Partial<CSSStyleDeclaration>);
    }

    const labelEl = document.createElement('span');
    labelEl.textContent = label.toUpperCase();
    Object.assign(labelEl.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.65rem',
      color: 'rgba(255,255,255,0.45)',
      letterSpacing: '0.08em',
    } satisfies Partial<CSSStyleDeclaration>);

    const valueEl = document.createElement('span');
    valueEl.id = `hud-${id}`;
    valueEl.setAttribute('aria-label', `${label} count`);
    valueEl.textContent = '0';
    Object.assign(valueEl.style, {
      fontFamily: "'Space Mono', monospace",
      fontWeight: '700',
      fontSize: '0.95rem',
      color: '#3df2c0',
      minWidth: '52px',
      textAlign: 'right',
      transition: this._reducedMotion ? 'none' : 'color 0.2s',
    } satisfies Partial<CSSStyleDeclaration>);

    if (id === 'gold') this._goldEl = valueEl;
    else if (id === 'wood') this._woodEl = valueEl;
    else if (id === 'supply') {
      this._supplyEl = valueEl;
      valueEl.textContent = '0/10';
    }

    wrap.appendChild(iconEl);
    wrap.appendChild(labelEl);
    wrap.appendChild(valueEl);
    return wrap;
  }

  private _buildDivider(): HTMLElement {
    const d = document.createElement('div');
    Object.assign(d.style, {
      width: '1px',
      height: '20px',
      background: 'rgba(61,242,192,0.20)',
    } satisfies Partial<CSSStyleDeclaration>);
    d.setAttribute('aria-hidden', 'true');
    return d;
  }

  private _buildSidebar(): void {
    const sidebar = document.createElement('aside');
    sidebar.id = 'hud-sidebar';
    sidebar.setAttribute('role', 'complementary');
    sidebar.setAttribute('aria-label', 'Battlefield command sidebar');
    Object.assign(sidebar.style, {
      position: 'fixed',
      left: '12px',
      bottom: '12px',
      width: '360px',
      maxWidth: 'calc(100vw - 24px)',
      height: 'min(640px, calc(100vh - 96px))',
      display: 'grid',
      gridTemplateRows: '180px minmax(0, 1fr) 220px',
      gap: '10px',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);

    const minimap = this._createSidebarSection('Minimap');
    minimap.id = 'hud-minimap';
    applyUiFrameStyles(minimap, 'minimap', 16, 'rgba(10,12,16,0.92)');
    minimap.appendChild(this._buildSidebarPlaceholder('MINIMAP'));
    this._minimapFrame = minimap;

    const selection = this._createSidebarSection('Selection details');
    selection.id = 'hud-selection-frame';
    applyUiFrameStyles(selection, 'panel', 14, 'rgba(10,12,16,0.92)');
    this._selectionFrame = selection;

    const command = this._createSidebarSection('Command card');
    command.id = 'hud-command-frame';
    applyUiFrameStyles(command, 'panel', 14, 'rgba(10,12,16,0.92)');
    this._commandFrame = command;

    sidebar.appendChild(minimap);
    sidebar.appendChild(selection);
    sidebar.appendChild(command);
    this._container!.appendChild(sidebar);
  }

  private _createSidebarSection(label: string): HTMLElement {
    const frame = document.createElement('div');
    frame.setAttribute('role', 'region');
    frame.setAttribute('aria-label', label);
    Object.assign(frame.style, {
      position: 'relative',
      overflow: 'hidden',
      pointerEvents: 'auto',
      boxSizing: 'border-box',
    } satisfies Partial<CSSStyleDeclaration>);
    return frame;
  }

  private _buildSidebarPlaceholder(text: string): HTMLElement {
    const placeholder = document.createElement('div');
    placeholder.textContent = text;
    Object.assign(placeholder.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.7rem',
      color: 'rgba(61,242,192,0.25)',
      letterSpacing: '0.12em',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    return placeholder;
  }

  // -------------------------------------------------------------------------
  // Update helpers (private)
  // -------------------------------------------------------------------------

  private _setResource(type: 'gold' | 'wood', value: number): void {
    const el = type === 'gold' ? this._goldEl : this._woodEl;
    if (el === null || el === undefined) return;
    if (!this._reducedMotion) {
      this._animateValue(el, value);
    } else {
      el.textContent = String(value);
    }
  }

  private _setClock(totalSeconds: number): void {
    if (this._clockEl === null) return;
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    this._clockEl.textContent = `${m}:${s}`;
  }

  /**
   * Briefly flashes the element to the brighter accent colour on value change,
   * then fades back. Uses CSS transitions; no JS timers needed for the actual
   * animation — only a single RAF to trigger the state classes.
   *
   * Motion is suppressed when prefers-reduced-motion is active.
   */
  private _animateValue(el: HTMLElement, value: number): void {
    el.textContent = String(value);
    el.style.color = '#ffffff';
    // Reset back after transition completes (200 ms matches the CSS transition).
    const handle = setTimeout(() => {
      el.style.color = '#3df2c0';
    }, 160);
    // Store on element to allow cancellation if update fires again quickly.
    const prev = (el as HTMLElement & { _flashHandle?: ReturnType<typeof setTimeout> })
      ._flashHandle;
    if (prev !== undefined) clearTimeout(prev);
    (el as HTMLElement & { _flashHandle?: ReturnType<typeof setTimeout> })._flashHandle = handle;
  }
}
