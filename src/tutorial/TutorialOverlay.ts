/**
 * TutorialOverlay — DOM tooltip and highlight renderer for onboarding.
 *
 * Uses innerHTML for reliable rendering instead of individual DOM element
 * creation. Follows the existing UI theme (cyan accents, dark panels).
 *
 * @module tutorial/TutorialOverlay
 */

import type { TutorialStep } from './TutorialStep';

// ---------------------------------------------------------------------------
// CSS (injected once)
// ---------------------------------------------------------------------------

const STYLE_ID = 'tutorial-overlay-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes tut-pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(232,168,64,0.35); }
      50%      { box-shadow: 0 0 0 10px rgba(232,168,64,0.08); }
    }
    @keyframes tut-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tut-highlight-ring {
      animation: tut-pulse 1.5s ease-in-out infinite;
      border-radius: 6px;
      pointer-events: none;
    }
    #tut-tooltip {
      position: fixed;
      width: 360px;
      background: #0a0c10;
      border: 2px solid rgba(232,168,64,0.45);
      border-radius: 8px;
      padding: 16px 20px;
      pointer-events: auto;
      z-index: 8002;
      box-sizing: border-box;
    }
    #tut-tooltip.tut-fade {
      animation: tut-fade-in 0.3s ease forwards;
    }
    #tut-step-counter {
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      color: rgba(232,168,64,0.5);
      margin-bottom: 6px;
      letter-spacing: 0.08em;
    }
    #tut-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 1.05rem;
      color: #ffffff;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    #tut-body {
      font-family: 'Space Mono', monospace;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.75);
      margin: 0 0 8px 0;
      line-height: 1.5;
    }
    #tut-hint {
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      font-style: italic;
      color: rgba(232,168,64,0.6);
      margin: 0 0 10px 0;
    }
    #tut-skip-btn {
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.30);
      background: none;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    #tut-skip-btn:hover {
      color: rgba(255,255,255,0.60);
      border-color: rgba(255,255,255,0.25);
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// TutorialOverlay
// ---------------------------------------------------------------------------

export class TutorialOverlay {
  private _root: HTMLElement | null = null;
  private _highlightRing: HTMLElement | null = null;

  /** Callback invoked when user clicks "Skip Tutorial". */
  onSkip: (() => void) | null = null;

  private readonly _reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  mount(parent: HTMLElement): void {
    if (this._root) return;
    injectStyles();

    // Root container — covers viewport, above HUD
    this._root = document.createElement('div');
    this._root.style.cssText = 'position:fixed;inset:0;z-index:8000;pointer-events:none;';

    // Dim mask
    const dimMask = document.createElement('div');
    dimMask.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.15);pointer-events:none;';
    this._root.appendChild(dimMask);

    // Highlight ring
    this._highlightRing = document.createElement('div');
    this._highlightRing.className = 'tut-highlight-ring';
    this._highlightRing.style.cssText =
      'position:fixed;display:none;pointer-events:none;z-index:8001;';
    this._root.appendChild(this._highlightRing);

    // Tooltip — built with innerHTML for reliability
    const tooltip = document.createElement('div');
    tooltip.id = 'tut-tooltip';
    tooltip.setAttribute('role', 'dialog');
    tooltip.setAttribute('aria-label', 'Tutorial');
    tooltip.style.display = 'none';
    tooltip.innerHTML = `
      <div id="tut-step-counter"></div>
      <h3 id="tut-title"></h3>
      <p id="tut-body"></p>
      <div id="tut-hint"></div>
      <button type="button" id="tut-skip-btn">Skip Tutorial</button>
    `;
    this._root.appendChild(tooltip);

    parent.appendChild(this._root);

    // Wire skip button
    const skipBtn = document.getElementById('tut-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        if (this.onSkip) this.onSkip();
      });
    }
  }

  destroy(): void {
    this._root?.remove();
    this._root = null;
    this._highlightRing = null;
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  showStep(step: TutorialStep, completionHint?: string): void {
    const tooltip = document.getElementById('tut-tooltip');
    if (!this._root || !tooltip) return;

    // Update text via getElementById — simple and reliable
    const stepEl = document.getElementById('tut-step-counter');
    const titleEl = document.getElementById('tut-title');
    const bodyEl = document.getElementById('tut-body');
    const hintEl = document.getElementById('tut-hint');

    if (stepEl) stepEl.textContent = `Step ${step.stepNumber} of ${step.totalSteps}`;
    if (titleEl) titleEl.textContent = step.title;
    if (bodyEl) bodyEl.textContent = step.body;
    if (hintEl) {
      hintEl.textContent = completionHint ?? '';
      hintEl.style.display = completionHint ? 'block' : 'none';
    }

    // Clear previous highlight
    this.clearHighlight();

    // Apply highlight
    if (step.highlight.type === 'ui' && step.highlight.uiSelector) {
      this.highlightElement(step.highlight.uiSelector);
    }

    // Position tooltip
    this._positionTooltip(tooltip, step);

    // Show
    this._root.style.display = 'block';
    tooltip.style.display = 'block';

    // Entrance animation
    if (!this._reducedMotion) {
      tooltip.classList.remove('tut-fade');
      void tooltip.offsetWidth;
      tooltip.classList.add('tut-fade');
    }
  }

  highlightElement(selector: string): void {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el || !this._highlightRing) return;

    const rect = el.getBoundingClientRect();
    const pad = 6;
    this._highlightRing.style.display = 'block';
    this._highlightRing.style.left = `${rect.left - pad}px`;
    this._highlightRing.style.top = `${rect.top - pad}px`;
    this._highlightRing.style.width = `${rect.width + pad * 2}px`;
    this._highlightRing.style.height = `${rect.height + pad * 2}px`;
  }

  clearHighlight(): void {
    if (this._highlightRing) this._highlightRing.style.display = 'none';
  }

  hide(): void {
    if (!this._root) return;
    this._root.style.display = 'none';
    this.clearHighlight();
  }

  // -----------------------------------------------------------------------
  // Private — tooltip positioning
  // -----------------------------------------------------------------------

  private _positionTooltip(tooltip: HTMLElement, step: TutorialStep): void {
    // Reset position
    tooltip.style.top = '';
    tooltip.style.bottom = '';
    tooltip.style.left = '';
    tooltip.style.right = '';
    tooltip.style.transform = '';

    if (step.highlight.type === 'ui' && step.highlight.uiSelector) {
      const el = document.querySelector(step.highlight.uiSelector) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        if (rect.top > vh / 2) {
          tooltip.style.bottom = `${vh - rect.top + 16}px`;
          tooltip.style.left = `${Math.min(vw - 400, Math.max(20, rect.left))}px`;
        } else {
          tooltip.style.top = `${rect.bottom + 16}px`;
          tooltip.style.left = `${Math.min(vw - 400, Math.max(20, rect.left))}px`;
        }
        return;
      }
    }

    // Default: top-right corner
    tooltip.style.top = '50px';
    tooltip.style.right = '20px';
  }
}
