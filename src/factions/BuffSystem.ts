/**
 * BuffSystem — ticks timed buff durations and reverses stat effects on expiry.
 *
 * Each frame this system iterates all entities carrying a {@link BuffsComponent},
 * decrements `remainingDuration` by deltaTime, and removes expired entries.
 *
 * On expiry, the system reverses every stat side-effect the buff applied when it
 * was first added. Reversal is driven by the optional typed fields on
 * {@link BuffEntry}:
 *
 *  - `armorBonus`     → decrements ArmorComponent.bonusArmor by the stored value.
 *  - `bloodRushBonus` → decrements BloodRushComponent.bonusIncrease by the stored value.
 *  - `attackSpeedBonus` → no component field to reverse; AuraSystem re-applies each
 *                         pulse, so expiry of the aura buff is naturally handled by
 *                         the aura not re-upsetting within the pulse window.
 *
 * After removing an entry, emits {@link GameEvents.BUFF_EXPIRED} so UI and other
 * systems can react without coupling directly to BuffSystem.
 *
 * Hot-path allocation note:
 * Expired entries are spliced in a backwards pass to avoid repeated array shifts.
 * No per-tick allocations occur when no buffs expire. The expiredIndices array is
 * module-level and reused each frame (zero heap allocation on the steady path).
 *
 * Implements: design/gdd/faction-abilities.md — Buff Lifecycle section
 *
 * @module factions/BuffSystem
 */

import { System } from '../ecs/System';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import { BuffsType, ArmorType_, BloodRushType, AliveType } from '../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// Module-level scratch array — reused every frame, never reallocated.
// ---------------------------------------------------------------------------

/** Indices of expired entries collected during each entity's buff iteration. */
const _expiredIndices: number[] = [];

// ---------------------------------------------------------------------------
// BuffSystem
// ---------------------------------------------------------------------------

/**
 * Manages buff duration countdown and stat-reversal on expiry.
 *
 * @example
 * const buffSystem = new BuffSystem(eventBus);
 * world.registerSystem(buffSystem);
 */
export class BuffSystem extends System {
  readonly name = 'BuffSystem';

  constructor(private readonly bus: EventBus<GameEvents>) {
    super();
  }

  // ---------------------------------------------------------------------------
  // System.update — called every simulation tick
  // ---------------------------------------------------------------------------

  /**
   * Decrements buff durations and removes expired buffs, reversing any stat
   * side-effects they applied.
   *
   * @param deltaTime - Elapsed seconds since the last tick.
   */
  update(deltaTime: number): void {
    for (const [entity, buffs] of this.world.query(BuffsType, AliveType)) {
      const list = buffs.buffList;
      if (list.length === 0) {
        continue;
      }

      // Collect expired indices in a backwards pass to avoid index shifting.
      _expiredIndices.length = 0;
      for (let i = 0; i < list.length; i++) {
        list[i].remainingDuration -= deltaTime;
        if (list[i].remainingDuration <= 0) {
          _expiredIndices.push(i);
        }
      }

      // Remove expired entries in reverse-index order and reverse their effects.
      for (let j = _expiredIndices.length - 1; j >= 0; j--) {
        const idx = _expiredIndices[j];
        const expired = list[idx];

        // Reverse armorBonus.
        if (expired.armorBonus !== undefined && expired.armorBonus !== 0) {
          const armor = this.world.getComponent(entity, ArmorType_);
          if (armor !== undefined) {
            armor.bonusArmor -= expired.armorBonus;
            // Clamp to zero — floating-point drift should not produce negative armor.
            if (armor.bonusArmor < 0) {
              armor.bonusArmor = 0;
            }
          }
        }

        // Reverse bloodRushBonus.
        if (expired.bloodRushBonus !== undefined && expired.bloodRushBonus !== 0) {
          const bloodRush = this.world.getComponent(entity, BloodRushType);
          if (bloodRush !== undefined) {
            bloodRush.bonusIncrease -= expired.bloodRushBonus;
            if (bloodRush.bonusIncrease < 0) {
              bloodRush.bonusIncrease = 0;
            }
          }
        }

        // attackSpeedBonus: no persistent field to reverse — the aura pulse
        // model means the bonus simply stops being refreshed on the next pulse
        // interval, so no explicit rollback is needed here.

        // Splice the expired entry out.
        list.splice(idx, 1);

        // Emit event for UI / audio systems.
        this.bus.emit('BUFF_EXPIRED', {
          targetEntity: entity,
          buffId: expired.buffId,
          sourceEntity: expired.sourceEntity,
        });
      }
    }
  }
}
