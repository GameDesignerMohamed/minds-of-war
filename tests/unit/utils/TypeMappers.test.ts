import { describe, expect, it } from 'vitest';
import { ArmorType, AttackType } from '@/types';
import { toArmorType, toAttackType } from '@/utils/TypeMappers';

describe('TypeMappers', () => {
  it('maps known attack types', () => {
    expect(toAttackType('normal')).toBe(AttackType.Normal);
    expect(toAttackType('Pierce')).toBe(AttackType.Pierce);
    expect(toAttackType('SIEGE')).toBe(AttackType.Siege);
    expect(toAttackType('magic')).toBe(AttackType.Magic);
  });

  it('maps known armor types', () => {
    expect(toArmorType('light')).toBe(ArmorType.Light);
    expect(toArmorType('Medium')).toBe(ArmorType.Medium);
    expect(toArmorType('HEAVY')).toBe(ArmorType.Heavy);
    expect(toArmorType('fortified')).toBe(ArmorType.Fortified);
  });

  it('uses consistent defaults for unknown values', () => {
    expect(toAttackType('unknown')).toBe(AttackType.Normal);
    expect(toArmorType('unknown')).toBe(ArmorType.Light);
  });
});
