/**
 * DamageFormula — pure stateless damage calculation for Minds of War.
 *
 * Implements the damage formula from design/gdd/combat.md:
 *
 *   rawDamage    = (baseDamage + bonusDamage) × matrix[attackType][armorType]
 *   armorReduct  = armorValue × armorReductionFactor
 *   finalDamage  = max(minimumDamage, floor(rawDamage × (1 − armorReduct)))
 *
 * All constants come from assets/data/combat/damage-matrix.json via
 * {@link CombatConfig}. No values are hardcoded here.
 *
 * The formula is a pure function with zero side effects so it can be called
 * from unit tests without a running World.
 *
 * @module combat/DamageFormula
 */

import type { CombatConfig } from '../config/ConfigLoader';
import type { AttackType, ArmorType } from '../types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Input to the damage formula. All numeric values are raw, pre-formula stats. */
export interface DamageInput {
  /** Base damage stat from unit/building data. */
  baseDamage: number;
  /** Flat bonus from weapon upgrades (0 = no upgrades). */
  bonusDamage: number;
  /** Attacker's attack type — selects the matrix row. */
  attackType: AttackType;
  /** Defender's armor type — selects the matrix column. */
  armorType: ArmorType;
  /** Defender's total armor value (base + bonus from upgrades/auras). */
  armorValue: number;
}

/** Breakdown of a single damage calculation, useful for logging and tests. */
export interface DamageResult {
  /** Raw damage before armor reduction but after type multiplier. */
  rawDamage: number;
  /** The matrix multiplier applied (e.g. 1.5 for pierce vs light). */
  typeMultiplier: number;
  /** Percentage of damage blocked by armor (0–1 clamped). */
  armorReduction: number;
  /**
   * Final integer damage dealt — what is actually subtracted from HP.
   * Never less than {@link CombatConfig.minimumDamage}.
   */
  finalDamage: number;
}

/**
 * Computes combat damage using the Minds of War formula.
 *
 * All configuration values (matrix multipliers, armor reduction factor,
 * minimum damage) are read from `combatConfig` — no hardcoded constants.
 *
 * @param input        - Attacker and defender stats.
 * @param combatConfig - Loaded from assets/data/combat/damage-matrix.json.
 * @returns A {@link DamageResult} with the final damage and formula breakdown.
 *
 * @example
 * ```ts
 * const result = calculateDamage(
 *   {
 *     baseDamage: 18, bonusDamage: 0,
 *     attackType: AttackType.Normal, armorType: ArmorType.Heavy, armorValue: 4,
 *   },
 *   config.combat,
 * );
 * // result.finalDamage = floor(18 * 0.75 * (1 - 4 * 0.06)) = floor(13.5 * 0.76) = 10
 * ```
 */
export function calculateDamage(input: DamageInput, combatConfig: CombatConfig): DamageResult {
  // Normalise the enum values to the lowercase keys used in damage-matrix.json.
  // JSON keys: 'normal' | 'pierce' | 'siege' | 'magic' and
  //             'light'  | 'medium' | 'heavy' | 'fortified'
  const attackKey = input.attackType.toLowerCase();
  const armorKey = input.armorType.toLowerCase();

  const typeMultiplier: number = combatConfig.matrix[attackKey]?.[armorKey] ?? 1.0;

  const totalDamage = (input.baseDamage + input.bonusDamage) * typeMultiplier;

  // Armor reduction is clamped to [0, 1] to prevent negative or over-full blocks.
  const armorReduction = Math.min(
    1,
    Math.max(0, input.armorValue * combatConfig.armorReductionFactor),
  );

  const reduced = totalDamage * (1 - armorReduction);

  const finalDamage = Math.max(combatConfig.minimumDamage, Math.floor(reduced));

  return {
    rawDamage: totalDamage,
    typeMultiplier,
    armorReduction,
    finalDamage,
  };
}
