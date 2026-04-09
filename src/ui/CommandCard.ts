/**
 * CommandCard — sidebar ability/action button grid.
 *
 * Renders a 3×3 (or smaller) grid of context-sensitive command buttons.
 * The available commands are determined by the current selection and provided
 * by the caller via {@link CommandCardItem} definitions. Keyboard shortcuts
 * (Q/W/E/A/S/D etc.) are displayed on each button and trigger the same
 * callback as a click.
 *
 * The CommandCard owns no command logic itself — it invokes caller-provided
 * callbacks when a button is activated, and the caller (typically a
 * CommandDispatcher wrapper) decides what to do.
 *
 * Layout: fills the command-card section of the left HUD sidebar.
 *
 * Visual spec:
 * - 3-column grid of square buttons.
 * - Inactive buttons: rgba(10,12,16,0.75) fill, cyan border 18 % opacity.
 * - Hover/focus: cyan border 50 % opacity, 4 % cyan fill.
 * - Active/pressed: filled with rgba(61,242,192,0.18).
 * - Disabled buttons: 30 % opacity, cursor not-allowed.
 * - Hotkey badge: top-right corner, Poppins 600, small.
 *
 * Accessibility:
 * - Each button is a <button> with aria-label from the item definition.
 * - Disabled buttons carry aria-disabled="true".
 * - The grid is role="toolbar".
 * - Keyboard navigation: Tab/Shift+Tab cycles buttons; Enter/Space activates.
 *
 * @example
 * const card = new CommandCard();
 * card.mount(document.body);
 *
 * card.setCommands([
 *   { id: 'move',   label: 'Move',   hotkey: 'M', onActivate: () => { ... } },
 *   { id: 'attack', label: 'Attack', hotkey: 'A', onActivate: () => { ... } },
 * ]);
 *
 * // On keyDown from InputManager, forward to card:
 * card.handleHotkey('KeyA');
 *
 * // Teardown:
 * card.destroy();
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import { applyUiFrameStyles } from '@/art/ArtLibrary';

/**
 * Defines a single command button in the command card grid.
 */
export interface CommandCardItem {
  /** Stable identifier — used as the button's id attribute. */
  id: string;

  /** Human-readable name, used as the button aria-label and tooltip. */
  label: string;

  /**
   * Single uppercase letter shown as the hotkey badge (e.g. 'M', 'A').
   * Also the character matched by {@link CommandCard.handleHotkey} when
   * KeyboardEvent.code is `'Key${hotkey}'`.
   */
  hotkey: string;

  /**
   * Icon shown in the button centre.
   * Accepts a public image path, a single emoji, a short text symbol, or empty string.
   *
   * @example '/art/icons/commands/attack.png', '⚔', 'S'
   */
  icon?: string;

  /** When true the button is rendered but cannot be activated. */
  disabled?: boolean;

  /** Invoked when the button is clicked or its hotkey is pressed. */
  onActivate: () => void;
}

// ---------------------------------------------------------------------------
// CommandCard
// ---------------------------------------------------------------------------

/**
 * Context-sensitive command button grid.
 *
 * Manages its own root element. Call {@link mount} to attach
 * to the DOM, {@link setCommands} to update the buttons, and {@link destroy}
 * to clean up.
 */
export class CommandCard {
  private _root: HTMLElement | null = null;
  private _grid: HTMLElement | null = null;
  private _items: CommandCardItem[] = [];

  /** Map of hotkey letter → button element, for fast hotkey dispatch. */
  private readonly _hotkeyMap: Map<string, HTMLButtonElement> = new Map();

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Creates the command card DOM and appends it to `parent`.
   *
   * @param parent - Element to append into, typically `document.body`.
   */
  mount(parent: HTMLElement): void {
    if (this._root !== null) return;
    this._root = this._buildRoot();
    this._grid = this._buildGrid();
    this._root.appendChild(this._grid);
    parent.appendChild(this._root);
    this._injectBaseStyles();
  }

  /** Removes the card from the DOM and clears all references. */
  destroy(): void {
    this._root?.remove();
    this._root = null;
    this._grid = null;
    this._hotkeyMap.clear();
    this._items = [];
  }

  // -------------------------------------------------------------------------
  // Command management
  // -------------------------------------------------------------------------

  /**
   * Replaces the current button set with the provided items.
   *
   * A maximum of 9 items are rendered (3 × 3 grid). Extra items are silently
   * ignored. Pass an empty array to clear all buttons.
   *
   * @param items - Ordered array of command definitions. Grid fills
   *                left-to-right, top-to-bottom.
   */
  setCommands(items: CommandCardItem[]): void {
    this._items = items.slice(0, 9);
    this._hotkeyMap.clear();
    if (this._grid !== null) {
      this._renderButtons();
    }
  }

  /**
   * Activates the command mapped to the pressed keyboard code, if any.
   *
   * Expects a `KeyboardEvent.code` string such as `'KeyA'`. Extracts the
   * letter portion and looks up the hotkey map.
   *
   * @param code - KeyboardEvent.code from {@link InputManager}.
   */
  handleHotkey(code: string): void {
    // Codes like 'KeyA', 'KeyQ', 'KeyS' — extract the letter.
    const letter = code.startsWith('Key') ? code.slice(3).toUpperCase() : code.toUpperCase();
    const btn = this._hotkeyMap.get(letter);
    if (btn !== undefined && !btn.disabled) {
      btn.click();
    }
  }

  // -------------------------------------------------------------------------
  // DOM construction (private)
  // -------------------------------------------------------------------------

  private _buildRoot(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'command-card';
    Object.assign(el.style, {
      width: '100%',
      height: '100%',
      padding: '14px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'auto',
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildGrid(): HTMLElement {
    const el = document.createElement('div');
    el.setAttribute('role', 'toolbar');
    el.setAttribute('aria-label', 'Unit commands');
    Object.assign(el.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
      gap: '8px',
      flex: '1',
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _renderButtons(): void {
    if (this._grid === null) return;
    this._grid.innerHTML = '';
    this._hotkeyMap.clear();

    for (let i = 0; i < 9; i++) {
      const item = this._items[i];
      if (item !== undefined) {
        const btn = this._buildButton(item);
        this._grid.appendChild(btn);
        this._hotkeyMap.set(item.hotkey.toUpperCase(), btn);
      } else {
        // Empty cell placeholder — preserves grid shape.
        const empty = document.createElement('div');
        Object.assign(empty.style, {
          width: '100%',
          aspectRatio: '1 / 1',
        } satisfies Partial<CSSStyleDeclaration>);
        this._grid.appendChild(empty);
      }
    }
  }

  private _buildButton(item: CommandCardItem): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = `cmd-${item.id}`;
    btn.type = 'button';
    btn.disabled = item.disabled ?? false;
    btn.setAttribute('aria-label', `${item.label}${item.hotkey ? ` (${item.hotkey})` : ''}`);
    if (item.disabled) {
      btn.setAttribute('aria-disabled', 'true');
    }

    Object.assign(btn.style, {
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      borderRadius: '4px',
      cursor: item.disabled ? 'not-allowed' : 'pointer',
      opacity: item.disabled ? '0.30' : '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '1.3rem',
      fontFamily: "'Poppins', sans-serif",
      transition: 'background 0.12s, border-color 0.12s',
      outline: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    applyUiFrameStyles(btn, 'button', 4, 'rgba(10,12,16,0.78)');

    // Icon or label text
    const iconValue = item.icon ?? item.label.charAt(0);
    const iconEl = iconValue.startsWith('/')
      ? document.createElement('img')
      : document.createElement('span');
    iconEl.setAttribute('aria-hidden', 'true');

    if (iconEl instanceof HTMLImageElement) {
      iconEl.src = iconValue;
      iconEl.alt = '';
      Object.assign(iconEl.style, {
        pointerEvents: 'none',
        width: '28px',
        height: '28px',
        imageRendering: 'pixelated',
      } satisfies Partial<CSSStyleDeclaration>);
    } else {
      iconEl.textContent = iconValue;
      Object.assign(iconEl.style, {
        pointerEvents: 'none',
        fontSize: '1.3rem',
        lineHeight: '1',
      } satisfies Partial<CSSStyleDeclaration>);
    }
    btn.appendChild(iconEl);

    // Hotkey badge — top-right corner
    if (item.hotkey) {
      const badge = document.createElement('span');
      badge.textContent = item.hotkey.toUpperCase();
      badge.setAttribute('aria-hidden', 'true');
      Object.assign(badge.style, {
        position: 'absolute',
        top: '3px',
        right: '4px',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: '600',
        fontSize: '0.58rem',
        color: '#3df2c0',
        lineHeight: '1',
        pointerEvents: 'none',
        letterSpacing: '0',
      } satisfies Partial<CSSStyleDeclaration>);
      btn.appendChild(badge);
    }

    // Label tooltip — bottom edge
    const tip = document.createElement('span');
    tip.textContent = item.label;
    tip.setAttribute('aria-hidden', 'true');
    Object.assign(tip.style, {
      position: 'absolute',
      bottom: '-28px',
      left: '50%',
      transform: 'translateX(-50%)',
      whiteSpace: 'nowrap',
      background: 'rgba(10,12,16,0.96)',
      border: '1px solid rgba(61,242,192,0.20)',
      borderRadius: '3px',
      padding: '2px 6px',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '0.65rem',
      color: '#ffffff',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 0.15s',
      zIndex: '10',
    } satisfies Partial<CSSStyleDeclaration>);
    btn.appendChild(tip);

    // Hover / focus interactions
    if (!item.disabled) {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(61,242,192,0.04)';
        btn.style.borderColor = 'rgba(61,242,192,0.50)';
        tip.style.opacity = '1';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(10,12,16,0.75)';
        btn.style.borderColor = 'rgba(61,242,192,0.18)';
        tip.style.opacity = '0';
      });
      btn.addEventListener('focus', () => {
        btn.style.borderColor = 'rgba(61,242,192,0.70)';
        tip.style.opacity = '1';
      });
      btn.addEventListener('blur', () => {
        btn.style.borderColor = 'rgba(61,242,192,0.18)';
        tip.style.opacity = '0';
      });
      btn.addEventListener('mousedown', () => {
        btn.style.background = 'rgba(61,242,192,0.18)';
      });
      btn.addEventListener('mouseup', () => {
        btn.style.background = 'rgba(61,242,192,0.04)';
      });

      btn.addEventListener('click', () => {
        item.onActivate();
      });
    }

    return btn;
  }

  // -------------------------------------------------------------------------
  // Global style injection (once per document)
  // -------------------------------------------------------------------------

  private _injectBaseStyles(): void {
    const STYLE_ID = 'command-card-styles';
    if (document.getElementById(STYLE_ID) !== null) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #command-card button:focus-visible {
        outline: 2px solid #3df2c0;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }
}
