/**
 * BloodRushSystem — Orc passive rage mechanic.
 *
 * Each frame this system reads the HP fraction of every orc unit that carries a
 * {@link BloodRushComponent} and writes the frame-computed `currentBonus` field.
 * AttackSystem (or a future CombatStatsSystem) reads `currentBonus` to shorten
 * the attack interval; it never reads `maxBonus` directly.
 *
 * Blood Rush formula (per design/gdd/faction-abilities.md):
 *
 *   hpFraction   = health.current / health.max
 *   If hpFraction >= hpThreshold → currentBonus = 0   (mechanic inactive)
 *   If hpFraction <  hpThreshold:
 *     effectiveCap = maxBonus + bonusIncrease
 *     t            = 1 - (hpFraction / hpThreshold)      // 0 at threshold, 1 at 0 HP
 *     currentBonus = effectiveCap * t
 *
 * The linear interpolation means the bonus scales smoothly from 0% at the
 * threshold boundary to effectiveCap at 0 HP.
 *
 * Warlord aura (handled in DisciplineAuraSystem / BloodRushSystem integration):
 * The orc Warlord's aura increases the effective cap for nearby units by
 * writing an additional amount into `bonusIncrease`. This system consumes
 * `bonusIncrease` as-is — it does not know or care where the value comes from.
 *
 * Implements: design/gdd/faction-abilities.md — Blood Rush section
 *
 * @module factions/BloodRushSystem
 */

import { System } from '../ecs/System';
import { BloodRushType, HealthType, AliveType } from '../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// BloodRushSystem
// ---------------------------------------------------------------------------

/**
 * Recomputes the `currentBonus` field of every live orc unit each frame.
 *
 * This is a pure write-through system: it holds no frame-to-frame state of its
 * own. All persistent state lives in {@link BloodRushComponent}.
 *
 * @example
 * const bloodRushSystem = new BloodRushSystem();
 * world.registerSystem(bloodRushSystem);
 */
export class BloodRushSystem extends System {
  readonly name = 'BloodRushSystem';

  // ---------------------------------------------------------------------------
  // System.update — called every simulation tick
  // ---------------------------------------------------------------------------

  /**
   * Iterates all live units with a BloodRushComponent and updates currentBonus.
   *
   * @param _deltaTime - Not used; currentBonus is fully frame-computed from
   *   current HP and requires no time-integration.
   */
  update(_deltaTime: number): void {
    for (const [entity, bloodRush] of this.world.query(BloodRushType, AliveType)) {
      const health = this.world.getComponent(entity, HealthType);
      if (health === undefined || health.max <= 0) {
        bloodRush.currentBonus = 0;
        continue;
      }

      const hpFraction = health.current / health.max;

      if (hpFraction >= bloodRush.hpThreshold) {
        // Above threshold — mechanic is inactive.
        bloodRush.currentBonus = 0;
        continue;
      }

      // Linear interpolation:
      //   t = 0 at hpThreshold boundary → bonus = 0
      //   t = 1 at 0 HP                → bonus = effectiveCap
      const effectiveCap = bloodRush.maxBonus + bloodRush.bonusIncrease;
      const t = 1 - hpFraction / bloodRush.hpThreshold;
      bloodRush.currentBonus = effectiveCap * t;
    }
  }
}
