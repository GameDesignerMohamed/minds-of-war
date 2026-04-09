import { describe, it, expect } from 'vitest';

/**
 * Blood-Rush formula tests — validates the GDD damage bonus curve.
 *
 * The Blood-Rush formula from the GDD:
 *   - 100% HP → 0% bonus
 *   - HPRatio > threshold (0.20): linear ramp, bonus = (1 - HPRatio)/(1 - threshold) * maxBonus * 0.5
 *   - HPRatio <= threshold: bonus = maxBonus*0.5 + (threshold - HPRatio)/threshold * maxBonus * 0.5
 *   - 0% HP → maxBonus (30%)
 */

const MAX_BONUS = 0.3;
const THRESHOLD = 0.2;

function calculateBloodRushBonus(
  hpRatio: number,
  maxBonus = MAX_BONUS,
  threshold = THRESHOLD,
): number {
  if (hpRatio >= 1.0) return 0;
  if (hpRatio > threshold) {
    const t = (1.0 - hpRatio) / (1.0 - threshold);
    return t * maxBonus * 0.5;
  }
  const t = (threshold - hpRatio) / threshold;
  return maxBonus * 0.5 + t * maxBonus * 0.5;
}

describe('Blood-Rush formula', () => {
  it('100% HP = 0% bonus', () => {
    expect(calculateBloodRushBonus(1.0)).toBe(0);
  });

  it('50% HP = ~9.4% bonus (first ramp midpoint)', () => {
    const bonus = calculateBloodRushBonus(0.5);
    // t = (1.0 - 0.5) / (1.0 - 0.2) = 0.5/0.8 = 0.625
    // bonus = 0.625 * 0.30 * 0.5 = 0.09375
    expect(bonus).toBeCloseTo(0.09375, 3);
  });

  it('20% HP (threshold) = 15% bonus', () => {
    const bonus = calculateBloodRushBonus(0.2);
    // At threshold: t = 1.0, bonus = 1.0 * 0.30 * 0.5 = 0.15
    expect(bonus).toBeCloseTo(0.15, 3);
  });

  it('10% HP = 22.5% bonus', () => {
    const bonus = calculateBloodRushBonus(0.1);
    // Below threshold: t = (0.20 - 0.10) / 0.20 = 0.5
    // bonus = 0.15 + 0.5 * 0.15 = 0.225
    expect(bonus).toBeCloseTo(0.225, 3);
  });

  it('0% HP = 30% bonus (full max)', () => {
    const bonus = calculateBloodRushBonus(0.0);
    expect(bonus).toBeCloseTo(0.3, 3);
  });

  it('with Warlord nearby, max bonus = 40%', () => {
    const bonus = calculateBloodRushBonus(0.0, 0.4);
    expect(bonus).toBeCloseTo(0.4, 3);
  });

  it('bonus never exceeds maxBonus', () => {
    // Test across a range of HP values
    for (let hp = 0; hp <= 100; hp += 5) {
      const ratio = hp / 100;
      const bonus = calculateBloodRushBonus(ratio);
      expect(bonus).toBeLessThanOrEqual(MAX_BONUS + 0.001);
      expect(bonus).toBeGreaterThanOrEqual(0);
    }
  });
});
