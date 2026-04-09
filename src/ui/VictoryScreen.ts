/**
 * VictoryScreen — full-screen overlay shown at match end.
 *
 * Handles both WIN and LOSE outcomes with appropriate visual treatment.
 * Animates in over ~400 ms (fade + scale), then presents result text and
 * two action buttons: "Play Again" and "Main Menu". Animation is suppressed
 * when prefers-reduced-motion is active.
 *
 * The screen mounts itself on top of everything (z-index 9000) and blocks
 * all game input via pointer-events: all.
 *
 * Visual spec:
 * - Win:  dark overlay with cyan text (#3df2c0), "VICTORY" heading.
 * - Lose: dark overlay with desaturated text, "DEFEAT" heading.
 * - Buttons: Poppins 600, outlined in cyan.
 * - Background: full-bleed dark with a subtle radial glow behind the heading.
 *
 * Accessibility:
 * - Root is role="dialog" aria-modal="true" with aria-label.
 * - Focus is trapped inside the modal on show; first button receives focus.
 * - Escape key closes (same as Main Menu) — handled internally.
 *
 * @example
 * const screen = new VictoryScreen({
 *   onPlayAgain: () => game.restart(),
 *   onMainMenu:  () => game.goToMenu(),
 * });
 * screen.mount(document.body);
 *
 * // Show on win:
 * screen.show('win', 'You conquered the Orc stronghold!');
 *
 * // Show on lose:
 * screen.show('lose', 'Your forces have been routed.');
 *
 * // Hide (if needed before natural flow):
 * screen.hide();
 *
 * // Teardown:
 * screen.destroy();
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Outcome discriminant for the victory screen. */
export type MatchOutcome = 'win' | 'lose';

/** Constructor options for {@link VictoryScreen}. */
export interface VictoryScreenOptions {
  /** Called when the player activates the "Play Again" button. */
  onPlayAgain: () => void;
  /** Called when the player activates the "Main Menu" button. */
  onMainMenu: () => void;
}

// ---------------------------------------------------------------------------
// VictoryScreen
// ---------------------------------------------------------------------------

/**
 * Full-screen match-end overlay.
 *
 * Call {@link mount} once to attach the DOM, {@link show} to present the
 * result, and {@link destroy} to clean up.
 */
export class VictoryScreen {
  private readonly _opts: VictoryScreenOptions;

  private _root: HTMLElement | null = null;
  private _heading: HTMLElement | null = null;
  private _subline: HTMLElement | null = null;
  private _playAgainBtn: HTMLButtonElement | null = null;
  private _mainMenuBtn: HTMLButtonElement | null = null;

  private _visible = false;
  private _reducedMotion = false;

  // Keyboard trap handler — retained for removeEventListener.
  private _onKeyDown: ((e: KeyboardEvent) => void) | null = null;

  /**
   * @param opts - Callbacks for the two action buttons.
   */
  constructor(opts: VictoryScreenOptions) {
    this._opts = opts;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Creates the overlay DOM (hidden) and appends it to `parent`.
   *
   * @param parent - Element to append into. Typically `document.body`.
   */
  mount(parent: HTMLElement): void {
    if (this._root !== null) return;

    this._reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._root = this._buildRoot();
    this._buildContent();
    parent.appendChild(this._root);

    // Start hidden.
    this._root.style.opacity = '0';
    this._root.style.pointerEvents = 'none';
    this._root.setAttribute('aria-hidden', 'true');
  }

  /** Removes the overlay from the DOM and cleans up event listeners. */
  destroy(): void {
    this.hide();
    this._root?.remove();
    this._root = null;
  }

  // -------------------------------------------------------------------------
  // Show / Hide
  // -------------------------------------------------------------------------

  /**
   * Shows the victory/defeat overlay with optional flavour text.
   *
   * Subsequent calls while already visible replace the content immediately.
   *
   * @param outcome   - Whether the player won or lost.
   * @param subline   - Optional flavour text shown below the main heading.
   */
  show(outcome: MatchOutcome, subline?: string): void {
    if (this._root === null) return;

    this._applyOutcome(outcome, subline);
    this._visible = true;

    // Make visible before animating so the transition fires.
    this._root.style.display = 'flex';
    this._root.style.pointerEvents = 'all';
    this._root.removeAttribute('aria-hidden');

    if (this._reducedMotion) {
      this._root.style.opacity = '1';
    } else {
      // Use a double-rAF to ensure the browser paints the initial state
      // before the transition begins.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this._root !== null) {
            this._root.style.opacity = '1';
          }
        });
      });
    }

    this._trapFocus();

    // Shift focus to first button after animation settles.
    const focusDelay = this._reducedMotion ? 0 : 420;
    setTimeout(() => {
      this._playAgainBtn?.focus();
    }, focusDelay);
  }

  /**
   * Hides the overlay.
   *
   * If the overlay is currently animating in, hides it immediately.
   */
  hide(): void {
    if (this._root === null || !this._visible) return;
    this._visible = false;

    this._releaseFocus();

    if (this._reducedMotion) {
      this._root.style.opacity = '0';
      this._root.style.display = 'none';
      this._root.style.pointerEvents = 'none';
      this._root.setAttribute('aria-hidden', 'true');
    } else {
      this._root.style.opacity = '0';
      this._root.style.pointerEvents = 'none';
      this._root.setAttribute('aria-hidden', 'true');
      // Remove from layout after transition.
      const handle = setTimeout(() => {
        if (this._root !== null && !this._visible) {
          this._root.style.display = 'none';
        }
      }, 400);
      // Allow GC if destroy() is called before timeout fires.
      void handle;
    }
  }

  // -------------------------------------------------------------------------
  // DOM construction (private)
  // -------------------------------------------------------------------------

  private _buildRoot(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'victory-screen';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Match result');
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      display: 'none',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(6,8,12,0.94)',
      backdropFilter: 'blur(12px)',
      zIndex: '9000',
      transition: this._reducedMotion ? 'none' : 'opacity 0.4s ease',
      gap: '0',
    } satisfies Partial<CSSStyleDeclaration>);
    return el;
  }

  private _buildContent(): void {
    const card = document.createElement('div');
    Object.assign(card.style, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '48px 64px',
      position: 'relative',
    } satisfies Partial<CSSStyleDeclaration>);

    // Radial glow behind heading (decorative)
    const glow = document.createElement('div');
    glow.setAttribute('aria-hidden', 'true');
    Object.assign(glow.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      height: '300px',
      background: 'radial-gradient(ellipse at center, rgba(61,242,192,0.08) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: '-1',
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(glow);

    // Main heading
    this._heading = document.createElement('h1');
    Object.assign(this._heading.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '700',
      fontSize: 'clamp(2.5rem, 7vw, 5rem)',
      letterSpacing: '0.08em',
      margin: '0',
      transition: this._reducedMotion ? 'none' : 'color 0.4s',
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(this._heading);

    // Subline / flavour text
    this._subline = document.createElement('p');
    Object.assign(this._subline.style, {
      fontFamily: "'Space Mono', monospace",
      fontSize: '0.95rem',
      color: 'rgba(255,255,255,0.60)',
      margin: '0 0 16px 0',
      textAlign: 'center',
      maxWidth: '420px',
      lineHeight: '1.5',
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(this._subline);

    // Separator line
    const sep = document.createElement('div');
    sep.setAttribute('aria-hidden', 'true');
    Object.assign(sep.style, {
      width: '160px',
      height: '1px',
      background: 'rgba(61,242,192,0.25)',
      marginBottom: '8px',
    } satisfies Partial<CSSStyleDeclaration>);
    card.appendChild(sep);

    // Button row
    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, {
      display: 'flex',
      gap: '16px',
      marginTop: '8px',
    } satisfies Partial<CSSStyleDeclaration>);

    this._playAgainBtn = this._buildButton('Play Again', true, () => {
      this.hide();
      this._opts.onPlayAgain();
    });
    this._mainMenuBtn = this._buildButton('Main Menu', false, () => {
      this.hide();
      this._opts.onMainMenu();
    });

    btnRow.appendChild(this._playAgainBtn);
    btnRow.appendChild(this._mainMenuBtn);
    card.appendChild(btnRow);

    this._root!.appendChild(card);
  }

  private _buildButton(label: string, primary: boolean, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;

    Object.assign(btn.style, {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600',
      fontSize: '0.95rem',
      padding: '10px 32px',
      borderRadius: '4px',
      cursor: 'pointer',
      border: '1px solid #3df2c0',
      background: primary ? '#3df2c0' : 'transparent',
      color: primary ? '#060810' : '#3df2c0',
      transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
      outline: 'none',
      letterSpacing: '0.04em',
    } satisfies Partial<CSSStyleDeclaration>);

    btn.addEventListener('mouseenter', () => {
      if (primary) {
        btn.style.background = '#6af7d5';
      } else {
        btn.style.background = 'rgba(61,242,192,0.10)';
        btn.style.boxShadow = '0 0 12px rgba(61,242,192,0.25)';
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = primary ? '#3df2c0' : 'transparent';
      btn.style.boxShadow = 'none';
    });
    btn.addEventListener('click', onClick);

    return btn;
  }

  // -------------------------------------------------------------------------
  // Outcome application (private)
  // -------------------------------------------------------------------------

  private _applyOutcome(outcome: MatchOutcome, subline?: string): void {
    if (this._heading === null || this._subline === null) return;

    if (outcome === 'win') {
      this._heading.textContent = 'VICTORY';
      this._heading.style.color = '#3df2c0';
      this._subline.textContent = subline ?? 'The battle is won.';
      this._root!.setAttribute('aria-label', 'Victory — match won');
    } else {
      this._heading.textContent = 'DEFEAT';
      this._heading.style.color = 'rgba(255,255,255,0.55)';
      this._subline.textContent = subline ?? 'Your forces have been defeated.';
      this._root!.setAttribute('aria-label', 'Defeat — match lost');
    }
  }

  // -------------------------------------------------------------------------
  // Focus trap (private)
  // -------------------------------------------------------------------------

  private _trapFocus(): void {
    this._onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        this._opts.onMainMenu();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = [this._playAgainBtn, this._mainMenuBtn].filter(
        (b): b is HTMLButtonElement => b !== null,
      );
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
    };
    window.addEventListener('keydown', this._onKeyDown);
  }

  private _releaseFocus(): void {
    if (this._onKeyDown !== null) {
      window.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
  }
}
