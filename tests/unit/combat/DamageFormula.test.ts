import { describe, it, expect } from 'vitest';
import { calculateDamage } from '@/combat/DamageFormula';
import type { DamageInput } from '@/combat/DamageFormula';
import damageMatrixData from '../../../assets/data/combat/damage-matrix.json';

const combatConfig = damageMatrixData as any;

function makeDamageInput(overrides: Partial<DamageInput> = {}): DamageInput {
  return {
    baseDamage: 18,
    bonusDamage: 0,
    attackType: 'normal',
    armorType: 'medium',
    armorValue: 0,
    ...overrides,
  } as DamageInput;
}

describe('DamageFormula', () => {
  describe('type matrix multipliers', () => {
    it('Normal vs Light = 1.00x', () => {
      const result = calculateDamage(
        makeDamageInput({ attackType: 'normal' as any, armorType: 'light' as any, armorValue: 0 }),
        combatConfig,
      );
      expect(result.finalDamage).toBe(18);
    });

    it('Pierce vs Light = 1.50x', () => {
      const result = calculateDamage(
        makeDamageInput({
          baseDamage: 10,
          attackType: 'pierce' as any,
          armorType: 'light' as any,
          armorValue: 0,
        }),
        combatConfig,
      );
      expect(result.finalDamage).toBe(15);
    });

    it('Siege vs Fortified = 1.75x', () => {
      const result = calculateDamage(
        makeDamageInput({
          baseDamage: 60,
          attackType: 'siege' as any,
          armorType: 'fortified' as any,
          armorValue: 0,
        }),
        combatConfig,
      );
      expect(result.finalDamage).toBe(105);
    });

    it('Magic vs Medium = 1.25x', () => {
      const result = calculateDamage(
        makeDamageInput({
          baseDamage: 12,
          attackType: 'magic' as any,
          armorType: 'medium' as any,
          armorValue: 0,
        }),
        combatConfig,
      );
      expect(result.finalDamage).toBe(15);
    });

    it('Normal vs Heavy = 0.75x', () => {
      const result = calculateDamage(
        makeDamageInput({
          baseDamage: 20,
          attackType: 'normal' as any,
          armorType: 'heavy' as any,
          armorValue: 0,
        }),
        combatConfig,
      );
      expect(result.finalDamage).toBe(15);
    });
  });

  describe('armor reduction', () => {
    it('armor 0 = 0% reduction', () => {
      const result = calculateDamage(makeDamageInput({ armorValue: 0 }), combatConfig);
      expect(result.finalDamage).toBe(18);
    });

    it('armor 2 = ~10.7% reduction', () => {
      const result = calculateDamage(makeDamageInput({ armorValue: 2 }), combatConfig);
      // 18 * (1 - 0.06*2/(1+0.06*2)) = 18 * 0.893 = 16.07 → 16
      expect(result.finalDamage).toBeGreaterThanOrEqual(15);
      expect(result.finalDamage).toBeLessThanOrEqual(17);
    });

    it('armor 5 = ~23.1% reduction', () => {
      const result = calculateDamage(makeDamageInput({ armorValue: 5 }), combatConfig);
      // 18 * (1 - 0.06*5/(1+0.06*5)) = 18 * 0.769 ≈ 12-14 (implementation-dependent rounding)
      expect(result.finalDamage).toBeGreaterThanOrEqual(12);
      expect(result.finalDamage).toBeLessThanOrEqual(15);
    });
  });

  describe('minimum damage', () => {
    it('always deals at least 1 damage', () => {
      const result = calculateDamage(
        makeDamageInput({ baseDamage: 1, armorValue: 100 }),
        combatConfig,
      );
      expect(result.finalDamage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('weapon upgrades', () => {
    it('+2 bonus damage increases final damage', () => {
      const base = calculateDamage(makeDamageInput({ bonusDamage: 0 }), combatConfig);
      const upgraded = calculateDamage(makeDamageInput({ bonusDamage: 2 }), combatConfig);
      expect(upgraded.finalDamage).toBeGreaterThan(base.finalDamage);
    });
  });
});
