/**
 * DisciplineAuraSystem — Human Captain area-of-effect stat aura.
 *
 * Each tick this system advances the per-source update timer. When the timer
 * crosses the configured pulse interval (discipline-aura.json updateFrequency)
 * the system broadcasts a stat bonus to all allied units within `radius` world
 * units, capped at `maxAuraAllies` recipients per pulse per source.
 *
 * Buffs applied:
 *  - Attack-speed bonus  (magnitude = maxAttackSpeedBonus, buffId = 'discipline_aura_attackspeed')
 *  - Armor bonus         (magnitude = maxArmorBonus,       buffId = 'discipline_aura_armor')
 *
 * Modifier cap rule: unique by buffId, newest overwrites (upsert). This means
 * overlapping aura pulses from different captains do NOT stack — the fresher
 * pulse simply refreshes the duration at the same magnitude.
 *
 * Implements: design/gdd/faction-abilities.md — Human Discipline Aura section
 *
 * @module factions/DisciplineAuraSystem
 */

import { System } from '../ecs/System';
import type { DisciplineAuraConfig } from '../config/ConfigLoader';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { EntityId } from '../types';
import {
  AuraSourceType,
  PositionType,
  OwnerType,
  AliveType,
  BuffsType,
  ArmorType_,
} from '../ecs/components/GameComponents';
import type { BuffEntry } from '../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// Buff ID constants — kept in one place so SpellSystem / BuffSystem can import
// ---------------------------------------------------------------------------

/** Buff ID for the attack-speed component of the Discipline Aura. */
export const BUFF_ID_DISCIPLINE_ATTACKSPEED = 'discipline_aura_attackspeed';
/** Buff ID for the armor component of the Discipline Aura. */
export const BUFF_ID_DISCIPLINE_ARMOR = 'discipline_aura_armor';

// ---------------------------------------------------------------------------
// DisciplineAuraSystem
// ---------------------------------------------------------------------------

/**
 * Pulses aura buffs from human Captain entities to nearby allied units.
 *
 * @example
 * const auraSystem = new DisciplineAuraSystem(config.disciplineAura, eventBus);
 * world.registerSystem(auraSystem);
 */
export class DisciplineAuraSystem extends System {
  readonly name = 'DisciplineAuraSystem';

  // Resolved at init from config — never hardcoded.
  private readonly _radius: number;
  private readonly _updateFrequency: number;
  private readonly _maxAuraAllies: number;
  private readonly _maxAttackSpeedBonus: number;
  private readonly _maxArmorBonus: number;

  // Re-used scratch arrays to avoid per-pulse allocations in the update loop.
  private readonly _candidateCache: Array<{ entity: EntityId; distSq: number }> = [];

  constructor(
    private readonly config: DisciplineAuraConfig,
    private readonly bus: EventBus<GameEvents>,
  ) {
    super();
    const cfg = config;
    this._radius = cfg.radius;
    this._updateFrequency = cfg.updateFrequency;
    this._maxAuraAllies = cfg.maxAuraAllies;
    this._maxAttackSpeedBonus = cfg.maxAttackSpeedBonus;
    this._maxArmorBonus = cfg.maxArmorBonus;
  }

  // ---------------------------------------------------------------------------
  // System.update — called every simulation tick
  // ---------------------------------------------------------------------------

  /**
   * Advances aura timers and pulses stat bonuses to nearby allies.
   *
   * @param deltaTime - Elapsed seconds since the last tick.
   */
  update(deltaTime: number): void {
    const radiusSq = this._radius * this._radius;

    for (const [sourceEntity, aura] of this.world.query(AuraSourceType, AliveType)) {
      // Only process discipline aura sources (human captains).
      if (aura.auraId !== 'discipline_aura') {
        continue;
      }

      // Advance pulse timer.
      aura.updateTimer += deltaTime;
      if (aura.updateTimer < this._updateFrequency) {
        continue;
      }
      aura.updateTimer -= this._updateFrequency;

      // Determine the source's owner and position.
      const sourceOwner = this.world.getComponent(sourceEntity, OwnerType);
      const sourcePos = this.world.getComponent(sourceEntity, PositionType);
      if (sourceOwner === undefined || sourcePos === undefined) {
        continue;
      }

      // Gather eligible allies sorted by proximity (nearest first).
      this._candidateCache.length = 0;
      for (const [candidateEntity] of this.world.query(
        BuffsType,
        PositionType,
        OwnerType,
        AliveType,
      )) {
        if (candidateEntity === sourceEntity) {
          continue; // Source does not buff itself.
        }
        const candidateOwner = this.world.getComponent(candidateEntity, OwnerType);
        if (candidateOwner === undefined || candidateOwner.playerId !== sourceOwner.playerId) {
          continue; // Different player — not an ally.
        }
        const candidatePos = this.world.getComponent(candidateEntity, PositionType);
        if (candidatePos === undefined) {
          continue;
        }
        const dx = candidatePos.x - sourcePos.x;
        const dz = candidatePos.z - sourcePos.z;
        const distSq = dx * dx + dz * dz;
        if (distSq <= radiusSq) {
          this._candidateCache.push({ entity: candidateEntity, distSq });
        }
      }

      // Sort nearest-first, then truncate to the ally cap.
      this._candidateCache.sort((a, b) => a.distSq - b.distSq);
      const recipientCount = Math.min(this._candidateCache.length, this._maxAuraAllies);

      // Apply upserted aura buffs to each recipient.
      const buffDuration = this._updateFrequency * 2; // Kept alive across two pulse intervals.

      for (let i = 0; i < recipientCount; i++) {
        const targetEntity = this._candidateCache[i].entity;
        this._applyOrRefreshBuff(
          targetEntity,
          sourceEntity,
          BUFF_ID_DISCIPLINE_ATTACKSPEED,
          this._maxAttackSpeedBonus,
          buffDuration,
          { attackSpeedBonus: this._maxAttackSpeedBonus },
        );
        this._applyOrRefreshBuff(
          targetEntity,
          sourceEntity,
          BUFF_ID_DISCIPLINE_ARMOR,
          this._maxArmorBonus,
          buffDuration,
          { armorBonus: this._maxArmorBonus },
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Upserts a buff entry on the target: if a buff with the same buffId already
   * exists it is overwritten (newest-wins); otherwise a new entry is pushed.
   *
   * When a NEW armor buff is applied, the flat bonus is immediately credited to
   * {@link ArmorComponent.bonusArmor} so AttackSystem sees it within the same
   * frame. Refreshed entries do not double-credit the armor value.
   *
   * @param targetEntity  - Entity receiving the buff.
   * @param sourceEntity  - Entity that is the aura source.
   * @param buffId        - Logical buff identifier.
   * @param magnitude     - Numeric strength of the effect.
   * @param duration      - How long the buff lasts in seconds.
   * @param extras        - Optional typed bonus fields to attach to the BuffEntry.
   */
  private _applyOrRefreshBuff(
    targetEntity: EntityId,
    sourceEntity: EntityId,
    buffId: string,
    magnitude: number,
    duration: number,
    extras: Pick<BuffEntry, 'armorBonus' | 'attackSpeedBonus' | 'bloodRushBonus'> = {},
  ): void {
    const buffs = this.world.getComponent(targetEntity, BuffsType);
    if (buffs === undefined) {
      return;
    }

    const existingIndex = buffs.buffList.findIndex((b) => b.buffId === buffId);

    if (existingIndex !== -1) {
      // Upsert: refresh duration and keep the existing source + magnitude.
      const existing = buffs.buffList[existingIndex];
      if (existing === undefined) {
        return;
      }

      existing.remainingDuration = duration;
      return;
    }

    // New entry — construct and push.
    const entry: BuffEntry = {
      buffId,
      sourceEntity,
      remainingDuration: duration,
      magnitude,
      ...extras,
    };
    buffs.buffList.push(entry);

    // Immediately credit armor bonus to the armor component.
    if (extras.armorBonus !== undefined && extras.armorBonus !== 0) {
      const armor = this.world.getComponent(targetEntity, ArmorType_);
      if (armor !== undefined) {
        armor.bonusArmor += extras.armorBonus;
      }
    }

    // Emit BUFF_APPLIED so UI / audio can react.
    this.bus.emit('BUFF_APPLIED', {
      targetEntity,
      sourceEntity,
      buffId,
      duration,
      magnitude,
    });
  }
}
