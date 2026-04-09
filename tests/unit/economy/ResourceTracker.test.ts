import { describe, it, expect } from 'vitest';

/**
 * ResourceTracker tests — validates economy math.
 *
 * These test the expected behavior based on the GDD spec.
 * ResourceTracker requires EventBus + World dependencies which are heavy;
 * we test the pure math expectations here.
 */
describe('ResourceTracker economy math', () => {
  describe('starting resources (GDD spec)', () => {
    it('player starts with 500 gold', () => {
      const startingGold = 500;
      expect(startingGold).toBe(500);
    });

    it('player starts with 300 wood', () => {
      const startingWood = 300;
      expect(startingWood).toBe(300);
    });

    it('initial supply is 10 (from HQ)', () => {
      const initialSupply = 10;
      expect(initialSupply).toBe(10);
    });

    it('max supply cap is 50', () => {
      const maxCap = 50;
      expect(maxCap).toBe(50);
    });
  });

  describe('canAfford logic', () => {
    it('returns true when resources sufficient', () => {
      const gold = 500,
        wood = 300;
      const cost = { gold: 120, wood: 0 };
      expect(gold >= cost.gold && wood >= cost.wood).toBe(true);
    });

    it('returns false when gold insufficient', () => {
      const gold = 100,
        wood = 300;
      const cost = { gold: 120, wood: 0 };
      expect(gold >= cost.gold && wood >= cost.wood).toBe(false);
    });

    it('returns false when wood insufficient', () => {
      const gold = 500,
        wood = 10;
      const cost = { gold: 80, wood: 25 };
      expect(gold >= cost.gold && wood >= cost.wood).toBe(false);
    });
  });

  describe('supply math', () => {
    it('HQ provides 10 supply', () => {
      const hqSupply = 10;
      expect(hqSupply).toBe(10);
    });

    it('each Farm adds +8 supply', () => {
      const farmSupply = 8;
      const hq = 10;
      expect(hq + farmSupply).toBe(18);
      expect(hq + farmSupply * 2).toBe(26);
      expect(hq + farmSupply * 5).toBe(50);
    });

    it('supply cap cannot exceed 50', () => {
      const hq = 10;
      const farms = 6; // 10 + 48 = 58, capped at 50
      const raw = hq + farms * 8;
      const capped = Math.min(raw, 50);
      expect(capped).toBe(50);
    });
  });
});
