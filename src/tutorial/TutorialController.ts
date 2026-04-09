/**
 * TutorialController — state machine for the onboarding tutorial.
 *
 * Manages step progression, subscribes to game events for completion triggers,
 * polls UI state each frame, and drives the TutorialOverlay display.
 *
 * @module tutorial/TutorialController
 */

import type { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import type { TutorialStep } from './TutorialStep';
import type { TutorialOverlay } from './TutorialOverlay';

const STORAGE_KEY = 'mow_tutorial_done';

export class TutorialController {
  private readonly _steps: TutorialStep[];
  private readonly _overlay: TutorialOverlay;
  private readonly _gameEventBus: EventBus<GameEvents>;

  private _currentIndex = 0;
  private _active = false;
  private _unsubs: Array<() => void> = [];
  private _timer: ReturnType<typeof setTimeout> | null = null;

  constructor(steps: TutorialStep[], overlay: TutorialOverlay, gameEventBus: EventBus<GameEvents>) {
    this._steps = steps;
    this._overlay = overlay;
    this._gameEventBus = gameEventBus;

    this._overlay.onSkip = () => this.finish();
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Returns true if tutorial has been completed before (localStorage). */
  static isDone(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  /** Whether the tutorial is currently active. */
  get active(): boolean {
    return this._active;
  }

  /** Start the tutorial from step 0. */
  start(): void {
    if (this._active || this._steps.length === 0) return;
    this._active = true;
    this._currentIndex = 0;
    this._showCurrentStep();
  }

  /**
   * Poll check — call this once per frame from the render loop.
   * Checks if the current step's poll condition is met.
   */
  poll(): void {
    if (!this._active) return;
    const step = this._steps[this._currentIndex];
    if (!step) return;

    if (step.completion.type === 'poll' && step.completion.pollCheck) {
      if (step.completion.pollCheck()) {
        this._advance();
      }
    }
  }

  /** End the tutorial immediately (skip or natural completion). */
  finish(): void {
    if (!this._active) return;
    this._active = false;
    this._cleanupCurrentStep();
    this._overlay.hide();
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  // -----------------------------------------------------------------------
  // Private — step management
  // -----------------------------------------------------------------------

  private _showCurrentStep(): void {
    const step = this._steps[this._currentIndex];
    if (!step) {
      this.finish();
      return;
    }

    // Cleanup previous subscriptions/timers
    this._cleanupCurrentStep();

    // Show the overlay
    this._overlay.showStep(step, step.completionHint);

    // Set up completion trigger
    if (step.completion.type === 'event' && step.completion.eventName) {
      const eventName = step.completion.eventName as keyof GameEvents;
      const filter = step.completion.eventFilter;
      const unsub = this._gameEventBus.on(eventName, (payload: unknown) => {
        if (!filter || filter(payload)) {
          this._advance();
        }
      });
      this._unsubs.push(unsub);
    }

    if (step.completion.type === 'timer' && step.completion.timerMs) {
      this._timer = setTimeout(() => this._advance(), step.completion.timerMs);
    }

    // Poll type is handled in poll() method called from render loop
  }

  private _advance(): void {
    this._cleanupCurrentStep();
    this._currentIndex++;

    if (this._currentIndex >= this._steps.length) {
      this.finish();
    } else {
      this._showCurrentStep();
    }
  }

  private _cleanupCurrentStep(): void {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
