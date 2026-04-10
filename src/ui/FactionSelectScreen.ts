/**
 * FactionSelectScreen — full-screen faction selection overlay for Minds of War.
 *
 * Displayed before the match begins. The player picks either The Vanguard
 * (Humans) or The Blood-Bound (Orcs). Clicking a faction card calls
 * {@link onSelect} with the matching {@link PlayerId}, then removes the overlay.
 *
 * Localization note:
 * All user-visible strings are routed through the module-local `t()` stub.
 * Replace the stub body with a real localization lookup (e.g. i18next or a
 * project-wide L10n singleton) when the localization system is implemented.
 *
 * Accessibility:
 * - The overlay is role="dialog" with aria-modal and aria-labelledby.
 * - Focus is trapped inside the overlay while it is visible.
 * - The two faction cards are <button> elements with descriptive aria-labels.
 * - Keyboard: Tab/Shift+Tab cycles between cards; Enter/Space selects.
 * - Supports prefers-reduced-motion (card hover transitions are instant).
 *
 * Gamepad note:
 * This screen must be reachable via gamepad. The caller is responsible for
 * emitting synthetic click events on the focused card when the confirm button
 * is pressed; the cards are standard <button> elements so click() works.
 *
 * @example
 * const screen = new FactionSelectScreen((faction) => {
 *   startGame(faction);
 * });
 * screen.mount(document.body);
 *
 * // Teardown (called automatically on selection, or manually to cancel):
 * screen.dispose();
 */

import type { PlayerId } from '@/types';

// ---------------------------------------------------------------------------
// Localization stub
// ---------------------------------------------------------------------------

/**
 * Minimal localization shim.
 *
 * Returns the key as-is until a real L10n system is wired in. All user-facing
 * strings in this file are routed through this function so they can be swapped
 * in one place.
 *
 * @param key   - The localization key.
 * @param _vars - Optional interpolation variables (ignored by stub).
 */
function t(key: string, _vars?: Record<string, string | number>): string {
  // TODO: replace with project localization system (e.g. L10n.translate(key, vars))
  return key;
}

// ---------------------------------------------------------------------------
// Faction metadata
// ---------------------------------------------------------------------------

interface FactionCardDef {
  /** The PlayerId value passed to onSelect. */
  id: PlayerId;
  /** Display name shown in the card header. */
  displayName: string;
  /** Subtitle line under the display name. */
  tagline: string;
  /** Short description of the faction's playstyle. */
  description: string;
  /** CSS accent colour for borders, titles, and hover state. */
  accentColor: string;
  /** CSS semi-transparent variant for card hover fill. */
  accentFill: string;
}

const FACTION_CARDS: readonly FactionCardDef[] = [
  {
    id: 'human',
    displayName: t('faction.human.name'),
    tagline: t('faction.human.tagline'),
    description: t('faction.human.description'),
    accentColor: '#e8a840',
    accentFill: 'rgba(232,168,64,0.06)',
  },
  {
    id: 'orc',
    displayName: t('faction.orc.name'),
    tagline: t('faction.orc.tagline'),
    description: t('faction.orc.description'),
    accentColor: '#ff5533',
    accentFill: 'rgba(255,85,51,0.06)',
  },
] as const;

// Localization keys resolved once (module load time matches stub behaviour):
// Override these via the L10n system to support other locales.
// Keys map as follows when the L10n system is live:
//   'faction.human.name'        → "The Vanguard (Humans)"
//   'faction.human.tagline'     → "Defensive & Disciplined"
//   'faction.human.description' → "Elite units, Discipline Aura, healing magic."
//   'faction.orc.name'          → "The Blood-Bound (Orcs)"
//   'faction.orc.tagline'       → "Aggressive & Brutal"
//   'faction.orc.description'   → "Cheap units, Blood-Rush passive, destructive magic."
//
// Because the stub returns the key, the displayed text equals the key string
// during development — replace the stub to show real copy.

// ---------------------------------------------------------------------------
// FactionSelectScreen
// ---------------------------------------------------------------------------

/**
 * Full-screen faction selection overlay.
 *
 * Constructs its own fixed-position DOM root. Call {@link mount} to inject
 * into the page and {@link dispose} to remove it. The overlay also removes
 * itself automatically after a faction is selected.
 */
export class FactionSelectScreen {
  private readonly _onSelect: (faction: PlayerId) => void;

  private _root: HTMLElement | null = null;
  private _previouslyFocused: Element | null = null;

  /** Whether the user prefers reduced motion. */
  private readonly _reducedMotion: boolean;

  /** Bound keydown handler for focus trapping. */
  private readonly _trapFocus: (e: KeyboardEvent) => void;

  /**
   * @param onSelect - Called with the selected {@link PlayerId} when the
   *                   player confirms a faction. The overlay disposes itself
   *                   before the callback fires.
   */
  constructor(onSelect: (faction: PlayerId) => void) {
    this._onSelect = onSelect;
    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._trapFocus = this._handleFocusTrap.bind(this);
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Creates the overlay DOM and appends it to `parent`.
   *
   * Saves the currently focused element so focus can be restored on dispose.
   * Moves focus into the overlay after mount.
   *
   * @param parent - Element to append into, typically `document.body`.
   */
  mount(parent: HTMLElement): void {
    if (this._root !== null) return;

    this._previouslyFocused = document.activeElement;

    this._root = this._buildRoot();
    this._buildContent(this._root);
    parent.appendChild(this._root);

    // Inject global styles (focus rings, card transitions).
    this._injectStyles();

    // Trap focus within the overlay.
    document.addEventListener('keydown', this._trapFocus);

    // Move focus to the first card button after the browser has painted.
    requestAnimationFrame(() => {
      const firstBtn = this._root?.querySelector<HTMLButtonElement>('button');
      firstBtn?.focus();
    });

    // Entrance animation
    if (!this._reducedMotion) {
      this._root.style.opacity = '0';
      this._root.style.transform = 'scale(0.97)';
      requestAnimationFrame(() => {
        if (this._root !== null) {
          this._root.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          this._root.style.opacity = '1';
          this._root.style.transform = 'scale(1)';
        }
      });
    }
  }

  /**
   * Removes the overlay from the DOM and restores focus.
   *
   * Called automatically after faction selection. May also be called manually
   * to cancel the screen (e.g. for test teardown).
   */
  dispose(): void {
    if (this._root === null) return;

    document.removeEventListener('keydown', this._trapFocus);
    this._root.remove();
    this._root = null;

    // Restore focus to whatever was focused before the overlay opened.
    if (this._previouslyFocused instanceof HTMLElement) {
      this._previouslyFocused.focus();
    }
    this._previouslyFocused = null;
  }

  // -------------------------------------------------------------------------
  // DOM construction (private)
  // -------------------------------------------------------------------------

  private _buildRoot(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'faction-select-screen';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'fss-title');
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5,5,18,0.96)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Poppins', sans-serif",
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildContent(root: HTMLElement): void {
    // Animoca brand logo strip
    const brandStrip = this._buildBrandStrip();
    root.appendChild(brandStrip);

    // Main title
    const title = document.createElement('h1');
    title.id = 'fss-title';
    title.textContent = 'MINDS OF WAR';
    Object.assign(title.style, {
      fontFamily: "'Space Mono', monospace",
      fontWeight: '700',
      fontSize: 'clamp(2rem, 6vw, 4rem)',
      color: '#ffffff',
      letterSpacing: '0.06em',
      margin: '0 0 8px',
      textAlign: 'center',
      textShadow: '0 0 40px rgba(232,168,64,0.30)',
    } satisfies Partial<CSSStyleDeclaration>);
    root.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = t('ui.factionSelect.subtitle');
    subtitle.setAttribute('aria-hidden', 'true'); // Title already labels the dialog
    Object.assign(subtitle.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '500',
      fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
      color: 'rgba(255,255,255,0.50)',
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      margin: '0 0 48px',
      textAlign: 'center',
    } satisfies Partial<CSSStyleDeclaration>);
    root.appendChild(subtitle);

    // Card row
    const cardRow = document.createElement('div');
    Object.assign(cardRow.style, {
      display: 'flex',
      gap: 'clamp(16px, 3vw, 40px)',
      alignItems: 'stretch',
    } satisfies Partial<CSSStyleDeclaration>);

    for (const faction of FACTION_CARDS) {
      cardRow.appendChild(this._buildFactionCard(faction));
    }

    root.appendChild(cardRow);
  }

  private _buildBrandStrip(): HTMLElement {
    const strip = document.createElement('div');
    strip.setAttribute('aria-hidden', 'true');
    Object.assign(strip.style, {
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    } satisfies Partial<CSSStyleDeclaration>);

    // Decorative left rule
    const ruleL = this._rule();
    // Brand text
    const brand = document.createElement('span');
    brand.textContent = 'ANIMOCA BRANDS';
    Object.assign(brand.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.60rem',
      color: 'rgba(255,255,255,0.25)',
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
    } satisfies Partial<CSSStyleDeclaration>);
    // Decorative right rule
    const ruleR = this._rule();

    strip.appendChild(ruleL);
    strip.appendChild(brand);
    strip.appendChild(ruleR);
    return strip;
  }

  private _rule(): HTMLElement {
    const el = document.createElement('div');
    Object.assign(el.style, {
      width: '40px',
      height: '1px',
      background: 'rgba(255,255,255,0.15)',
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildFactionCard(def: FactionCardDef): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `fss-card-${def.id}`;
    btn.setAttribute('aria-label', `${def.displayName} — ${def.tagline}. ${def.description}`);
    btn.dataset['factionId'] = def.id;

    Object.assign(btn.style, {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: 'clamp(220px, 28vw, 320px)',
      padding: '28px 28px 32px',
      background: 'rgba(10,12,20,0.85)',
      border: `1px solid ${def.accentColor}40`,
      borderRadius: '8px',
      cursor: 'pointer',
      textAlign: 'left',
      backdropFilter: 'blur(6px)',
      outline: 'none',
      // Transition handled by CSS class in _injectStyles
    } satisfies Partial<CSSStyleDeclaration>);

    // Faction name
    const name = document.createElement('h2');
    name.textContent = def.displayName;
    name.setAttribute('aria-hidden', 'true');
    Object.assign(name.style, {
      fontFamily: "'Space Mono', monospace",
      fontWeight: '700',
      fontSize: 'clamp(0.95rem, 2.2vw, 1.25rem)',
      color: def.accentColor,
      margin: '0 0 6px',
      lineHeight: '1.25',
      letterSpacing: '0.03em',
    } satisfies Partial<CSSStyleDeclaration>);

    // Tagline
    const tagline = document.createElement('p');
    tagline.textContent = def.tagline;
    tagline.setAttribute('aria-hidden', 'true');
    Object.assign(tagline.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.60)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      margin: '0 0 16px',
    } satisfies Partial<CSSStyleDeclaration>);

    // Divider
    const divider = document.createElement('div');
    Object.assign(divider.style, {
      width: '100%',
      height: '1px',
      background: `${def.accentColor}30`,
      marginBottom: '16px',
    } satisfies Partial<CSSStyleDeclaration>);

    // Description
    const desc = document.createElement('p');
    desc.textContent = def.description;
    desc.setAttribute('aria-hidden', 'true');
    Object.assign(desc.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '400',
      fontSize: 'clamp(0.78rem, 1.4vw, 0.9rem)',
      color: 'rgba(255,255,255,0.70)',
      lineHeight: '1.55',
      margin: '0 0 24px',
    } satisfies Partial<CSSStyleDeclaration>);

    // CTA badge
    const cta = document.createElement('span');
    cta.textContent = t('ui.factionSelect.chooseLabel');
    cta.setAttribute('aria-hidden', 'true');
    Object.assign(cta.style, {
      fontFamily: "'Space Mono', monospace",
      fontWeight: '700',
      fontSize: '0.72rem',
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      color: def.accentColor,
      borderTop: `1px solid ${def.accentColor}40`,
      paddingTop: '10px',
      width: '100%',
      display: 'block',
    } satisfies Partial<CSSStyleDeclaration>);

    btn.appendChild(name);
    btn.appendChild(tagline);
    btn.appendChild(divider);
    btn.appendChild(desc);
    btn.appendChild(cta);

    // Hover / focus interactions
    const enter = (): void => {
      btn.style.background = def.accentFill;
      btn.style.borderColor = `${def.accentColor}90`;
      btn.style.transform = this._reducedMotion ? '' : 'translateY(-3px)';
    };
    const leave = (): void => {
      btn.style.background = 'rgba(10,12,20,0.85)';
      btn.style.borderColor = `${def.accentColor}40`;
      btn.style.transform = '';
    };

    btn.addEventListener('mouseenter', enter);
    btn.addEventListener('focus', enter);
    btn.addEventListener('mouseleave', leave);
    btn.addEventListener('blur', leave);

    btn.addEventListener('click', () => {
      this._handleSelect(def.id);
    });

    return btn;
  }

  // -------------------------------------------------------------------------
  // Interaction handlers (private)
  // -------------------------------------------------------------------------

  private _handleSelect(faction: PlayerId): void {
    // Dispose overlay before calling back so the game screen can mount cleanly.
    this.dispose();
    this._onSelect(faction);
  }

  /**
   * Tab-key focus trap — keeps keyboard focus cycling within the overlay's
   * focusable elements (the two faction card buttons).
   */
  private _handleFocusTrap(e: KeyboardEvent): void {
    if (e.code !== 'Tab' || this._root === null) return;

    const focusable = Array.from(
      this._root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));

    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Style injection (private)
  // -------------------------------------------------------------------------

  private _injectStyles(): void {
    const STYLE_ID = 'faction-select-styles';
    if (document.getElementById(STYLE_ID) !== null) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #faction-select-screen button {
        transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
      }
      #faction-select-screen button:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 3px;
      }
      @media (prefers-reduced-motion: reduce) {
        #faction-select-screen button {
          transition: none;
        }
        #faction-select-screen {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
