/**
 * Deterministic RNG — seedable pseudo-random number generator (xoshiro128**).
 *
 * Uses the xoshiro128** algorithm (Blackman & Vigna, 2018) for its excellent
 * statistical quality and compact 128-bit state. The full state can be
 * serialised and restored, making it suitable for:
 * - Replays (record seed, replay identical sequence)
 * - Netcode lockstep (both clients run identical RNG with identical seeds)
 * - Procedural generation (deterministic map/content seeding)
 *
 * Design notes:
 * - No global state — create and inject instances.
 * - All output methods derive from a single `_next()` primitive.
 * - Seeding uses `splitmix64` (adapted to 32-bit) for good seed avalanche.
 *
 * References:
 *   https://prng.di.unimi.it/xoshiro128starstar.c
 *   https://prng.di.unimi.it/splitmix64.c
 */

// ---------------------------------------------------------------------------
// RNG State
// ---------------------------------------------------------------------------

/** Serialisable snapshot of RNG internal state for save/replay. */
export interface RngState {
  readonly s0: number;
  readonly s1: number;
  readonly s2: number;
  readonly s3: number;
}

// ---------------------------------------------------------------------------
// DeterministicRNG
// ---------------------------------------------------------------------------

/**
 * Seedable pseudo-random number generator based on xoshiro128**.
 *
 * @example
 * const rng = new DeterministicRNG(42);
 * const roll = rng.nextFloat(); // [0, 1)
 * const die  = rng.nextInt(1, 6); // integer in [1, 6]
 */
export class DeterministicRNG {
  private _s0: number;
  private _s1: number;
  private _s2: number;
  private _s3: number;

  /**
   * @param seed - 32-bit integer seed. The same seed always produces the same
   *   sequence. Defaults to 1 if 0 is passed (all-zero state is invalid for
   *   xoshiro).
   */
  constructor(seed: number) {
    // Expand the scalar seed into four 32-bit state words using splitmix32.
    const init = seed === 0 ? 1 : seed >>> 0;
    this._s0 = this._splitmix32(init);
    this._s1 = this._splitmix32(this._s0);
    this._s2 = this._splitmix32(this._s1);
    this._s3 = this._splitmix32(this._s2);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Returns a uniformly distributed float in the half-open range [0, 1).
   */
  nextFloat(): number {
    // Mask to 23 bits and convert to [0, 1) float.
    return (this._next() >>> 9) / (1 << 23);
  }

  /**
   * Returns a uniformly distributed integer in the closed range [min, max].
   *
   * @param min - Inclusive lower bound.
   * @param max - Inclusive upper bound. Must be >= min.
   */
  nextInt(min: number, max: number): number {
    const range = (max | 0) - (min | 0) + 1;
    return (min | 0) + ((this._next() % range) >>> 0);
  }

  /**
   * Returns `true` with the given probability.
   *
   * @param probability - A value in [0, 1]. 0 always returns false; 1 always
   *   returns true.
   */
  chance(probability: number): boolean {
    return this.nextFloat() < probability;
  }

  /**
   * Selects and returns a uniformly random element from an array.
   *
   * @param array - A non-empty array to pick from.
   * @returns A random element, or `undefined` if the array is empty.
   */
  pick<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) {
      return undefined;
    }
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Returns a float in the range [min, max).
   *
   * @param min - Inclusive lower bound.
   * @param max - Exclusive upper bound.
   */
  nextFloatRange(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  // -------------------------------------------------------------------------
  // State Serialisation
  // -------------------------------------------------------------------------

  /**
   * Returns a snapshot of the current RNG state.
   *
   * Pair with {@link restoreState} to checkpoint and replay sequences.
   */
  saveState(): RngState {
    return { s0: this._s0, s1: this._s1, s2: this._s2, s3: this._s3 };
  }

  /**
   * Restores the RNG to a previously saved state.
   *
   * After this call the generator will produce the exact same sequence it
   * produced from that checkpoint onwards.
   *
   * @param state - A snapshot obtained from {@link saveState}.
   */
  restoreState(state: RngState): void {
    this._s0 = state.s0;
    this._s1 = state.s1;
    this._s2 = state.s2;
    this._s3 = state.s3;
  }

  // -------------------------------------------------------------------------
  // Internal — xoshiro128**
  // -------------------------------------------------------------------------

  /**
   * Advances the xoshiro128** state by one step and returns a 32-bit result.
   *
   * All arithmetic is performed in 32-bit unsigned integers via `>>> 0` and
   * `Math.imul` to match the C reference implementation.
   */
  private _next(): number {
    const result = Math.imul(this._rotl(Math.imul(this._s1, 5) >>> 0, 7), 9) >>> 0;
    const t = (this._s1 << 9) >>> 0;

    this._s2 ^= this._s0;
    this._s3 ^= this._s1;
    this._s1 ^= this._s2;
    this._s0 ^= this._s3;

    this._s2 ^= t;
    this._s3 = this._rotl(this._s3, 11);

    return result;
  }

  /** Left-rotates a 32-bit unsigned integer by `k` bits. */
  private _rotl(x: number, k: number): number {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
  }

  /**
   * SplitMix32 step — used to expand a scalar seed into xoshiro state words.
   *
   * @param x - Input state word.
   * @returns Next state word.
   */
  private _splitmix32(x: number): number {
    x = (x + 0x9e3779b9) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
    return (x ^ (x >>> 16)) >>> 0;
  }
}
