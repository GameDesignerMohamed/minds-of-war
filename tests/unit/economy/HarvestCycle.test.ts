import { describe, it, expect } from 'vitest';

/**
 * Harvest cycle math tests — validates GDD economy pacing.
 *
 * These are pure math tests that verify the gather rate formulas from the GDD
 * without requiring the full HarvestSystem ECS machinery.
 */
describe('Harvest cycle economy math', () => {
  const WORKER_SPEED = 2.0; // tiles/s (approximate average)
  const GOLD_MINE_TIME = 2.0; // seconds at mine
  const WOOD_CHOP_TIME = 2.5; // seconds at tree
  const CARRY_AMOUNT = 10; // resources per trip
  const DROP_OFF_TIME = 0.25; // seconds at HQ
  const MINE_CAPACITY = 5000; // gold per mine

  describe('gold gather rate', () => {
    it('trip time for 6-tile round trip = 5.25s', () => {
      const travelTime = 3 / WORKER_SPEED; // 3 tiles each way
      const tripTime = travelTime + GOLD_MINE_TIME + travelTime + DROP_OFF_TIME;
      expect(tripTime).toBeCloseTo(5.25, 2);
    });

    it('gather rate per worker = ~1.90 G/s', () => {
      const tripTime = 5.25;
      const rate = CARRY_AMOUNT / tripTime;
      expect(rate).toBeCloseTo(1.9, 1);
    });

    it('5 workers at one mine = ~9.5 G/s', () => {
      const rate = CARRY_AMOUNT / 5.25;
      const fiveWorkers = rate * 5;
      expect(fiveWorkers).toBeCloseTo(9.5, 0);
    });

    it('mine depletes in ~500s with 5 optimal workers', () => {
      const ratePerWorker = CARRY_AMOUNT / 5.25;
      const totalRate = ratePerWorker * 5;
      const depletionTime = MINE_CAPACITY / totalRate;
      expect(depletionTime).toBeCloseTo(526, -1); // ~500-530s range
    });
  });

  describe('wood gather rate', () => {
    it('trip time for 5-tile round trip = 5.25s', () => {
      const travelTime = 2.5 / WORKER_SPEED;
      const tripTime = travelTime + WOOD_CHOP_TIME + travelTime + DROP_OFF_TIME;
      expect(tripTime).toBeCloseTo(5.25, 2);
    });

    it('gather rate per worker = ~1.90 W/s', () => {
      const tripTime = 5.25;
      const rate = CARRY_AMOUNT / tripTime;
      expect(rate).toBeCloseTo(1.9, 1);
    });
  });

  describe('GDD economy benchmarks', () => {
    it('10 workers at 5 min should produce ~18 G/s', () => {
      // 10 workers × 1.90 G/s = 19 G/s (benchmark says ~18)
      const workers = 10;
      const ratePerWorker = CARRY_AMOUNT / 5.25;
      const totalRate = workers * ratePerWorker;
      expect(totalRate).toBeGreaterThan(17);
      expect(totalRate).toBeLessThan(20);
    });

    it('mine capacity 5000 / carry 10 = 500 trips', () => {
      expect(MINE_CAPACITY / CARRY_AMOUNT).toBe(500);
    });
  });
});
