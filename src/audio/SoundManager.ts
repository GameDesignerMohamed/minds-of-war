/**
 * SoundManager — procedural audio for game events using Web Audio API.
 *
 * Generates placeholder sounds using oscillators and noise — no asset files needed.
 * Each sound is a short synthesized effect: clicks, thuds, chimes, etc.
 *
 * @module audio/SoundManager
 */

import type { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';

export class SoundManager {
  private _ctx: AudioContext | null = null;
  private _masterGain: GainNode | null = null;

  constructor(gameEventBus: EventBus<GameEvents>) {
    // Lazy-init AudioContext on first user interaction (browser requirement)
    const init = () => {
      if (this._ctx) return;
      this._ctx = new AudioContext();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = 0.3;
      this._masterGain.connect(this._ctx.destination);
      window.removeEventListener('click', init);
      window.removeEventListener('keydown', init);
    };
    window.addEventListener('click', init);
    window.addEventListener('keydown', init);

    // Wire game events to sounds
    gameEventBus.on('UNIT_ATTACKED', () => this._playHit());
    gameEventBus.on('UNIT_DIED', () => this._playDeath());
    gameEventBus.on('BUILDING_COMPLETE', () => this._playBuildComplete());
    gameEventBus.on('UNIT_TRAINED', () => this._playTrainComplete());
    gameEventBus.on('BUILDING_DESTROYED', () => this._playExplosion());
  }

  /** Short metallic click for attack hits. */
  private _playHit(): void {
    if (!this._ctx || !this._masterGain) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this._ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this._ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.1);
    osc.connect(gain).connect(this._masterGain);
    osc.start();
    osc.stop(this._ctx.currentTime + 0.1);
  }

  /** Low thud for unit death. */
  private _playDeath(): void {
    if (!this._ctx || !this._masterGain) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this._ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this._ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.3);
    osc.connect(gain).connect(this._masterGain);
    osc.start();
    osc.stop(this._ctx.currentTime + 0.35);
  }

  /** Ascending chime for building completion. */
  private _playBuildComplete(): void {
    if (!this._ctx || !this._masterGain) return;
    const notes = [523, 659, 784]; // C5, E5, G5
    for (let i = 0; i < notes.length; i++) {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[i];
      const t = this._ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(this._masterGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  /** Single high ping for unit trained. */
  private _playTrainComplete(): void {
    if (!this._ctx || !this._masterGain) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.15);
    osc.connect(gain).connect(this._masterGain);
    osc.start();
    osc.stop(this._ctx.currentTime + 0.2);
  }

  /** Rumble for building destroyed. */
  private _playExplosion(): void {
    if (!this._ctx || !this._masterGain) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this._ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this._ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + 0.5);
    osc.connect(gain).connect(this._masterGain);
    osc.start();
    osc.stop(this._ctx.currentTime + 0.55);
  }
}
