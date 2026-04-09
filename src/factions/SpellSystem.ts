/**
 * SpellSystem — processes spell casts for human clerics and orc shamans.
 *
 * This system ticks spell cooldowns each frame and exposes a public
 * `castSpell` method that command-processing code calls when the player
 * (or AI) issues a cast order. All spell definitions are read from
 * `assets/data/factions/spells.json` via `GameConfig.spells`.
 *
 * Supported effect types (per spells.json schema):
 *
 *  - `restore_hp`       — Immediately restores health.current by effect.amount,
 *                         clamped to health.max. Human cleric Heal.
 *
 *  - `buff_armor`       — Applies a timed armor buff (upsert by buffId) to the
 *                         target. Sets armorBonus on the BuffEntry so BuffSystem
 *                         can reverse it on expiry. Human cleric Protective Chant.
 *
 *  - `buff_blood_rush`  — Applies a timed Blood Rush bonus-increase to a
 *                         friendly orc unit. Writes bloodRushBonus on the
 *                         BuffEntry and immediately increments
 *                         BloodRushComponent.bonusIncrease. Orc shaman Blood Surge.
 *
 *  - `chain_damage`     — Deals damage to a primary target and bounces up to
 *                         effect.bounces additional times to the nearest enemy
 *                         within effect.bounceRadius. Orc shaman Chain Flame.
 *
 * Modifier cap rule: buff spells use upsert-by-buffId (newest overwrites).
 * This matches the approved decision for both aura and spell buff stacking.
 *
 * Implements: design/gdd/faction-abilities.md — Spells section
 *
 * @module factions/SpellSystem
 */

import { System } from '../ecs/System';
import type { SpellsConfig, SpellData } from '../config/ConfigLoader';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { EntityId } from '../types';
import {
  SpellCasterType,
  HealthType,
  BuffsType,
  BloodRushType,
  ArmorType_,
  AliveType,
  OwnerType,
  PositionType,
} from '../ecs/components/GameComponents';
import type { BuffEntry } from '../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// SpellSystem
// ---------------------------------------------------------------------------

/**
 * Ticks cooldowns and resolves spell effects.
 *
 * Inject via constructor; register with world after all component-owning systems.
 *
 * @example
 * const spellSystem = new SpellSystem(config.spells, eventBus);
 * world.registerSystem(spellSystem);
 *
 * // Later, from a command handler:
 * spellSystem.castSpell(casterEntity, 'heal', targetEntity);
 */
export class SpellSystem extends System {
  readonly name = 'SpellSystem';

  /** Spell definitions keyed by spell id for O(1) lookup. */
  private readonly _spellLookup: Map<string, SpellData> = new Map();

  constructor(
    private readonly config: SpellsConfig,
    private readonly bus: EventBus<GameEvents>,
  ) {
    super();
    for (const spell of config.spells) {
      this._spellLookup.set(spell.id, spell);
    }
  }

  // ---------------------------------------------------------------------------
  // System.update — cooldown tick
  // ---------------------------------------------------------------------------

  /**
   * Decrements all active spell cooldowns by deltaTime.
   *
   * A cooldown reaching or crossing zero is removed from the Map rather than set
   * to zero, preserving the "absent key = spell ready" contract documented on
   * {@link SpellCasterComponent}.
   *
   * @param deltaTime - Elapsed seconds since the last tick.
   */
  update(deltaTime: number): void {
    for (const [, caster] of this.world.query(SpellCasterType, AliveType)) {
      for (const [spellId, remaining] of caster.cooldowns) {
        const next = remaining - deltaTime;
        if (next <= 0) {
          caster.cooldowns.delete(spellId);
        } else {
          caster.cooldowns.set(spellId, next);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public API — called by command dispatcher or AI
  // ---------------------------------------------------------------------------

  /**
   * Attempts to cast a spell from `casterEntity` against `targetEntity`.
   *
   * Pre-conditions checked:
   *  1. Caster has a {@link SpellCasterComponent}.
   *  2. Spell id is registered in spells.json.
   *  3. Spell is not on cooldown (absent key = ready).
   *  4. Caster is alive.
   *  5. Target is within range.
   *  6. Target satisfies the spell's targetType (friendly / enemy).
   *
   * If all conditions pass, the effect is resolved immediately and the cooldown
   * is set. Emits {@link GameEvents.SPELL_CAST} on success.
   *
   * @param casterEntity - The entity casting the spell.
   * @param spellId      - Spell identifier matching spells.json.
   * @param targetEntity - The entity being targeted.
   * @returns `true` if the cast succeeded, `false` otherwise.
   */
  castSpell(casterEntity: EntityId, spellId: string, targetEntity: EntityId): boolean {
    // --- Guard: caster component ---
    const caster = this.world.getComponent(casterEntity, SpellCasterType);
    if (caster === undefined) {
      return false;
    }

    // --- Guard: spell definition ---
    const spell = this._spellLookup.get(spellId);
    if (spell === undefined) {
      return false;
    }

    // --- Guard: cooldown ---
    const cd = caster.cooldowns.get(spellId) ?? 0;
    if (cd > 0) {
      return false;
    }

    // --- Guard: caster alive ---
    if (!this.world.hasComponent(casterEntity, AliveType)) {
      return false;
    }

    // --- Guard: range ---
    if (!this._isInRange(casterEntity, targetEntity, spell.range)) {
      return false;
    }

    // --- Guard: targetType ---
    if (!this._isValidTarget(casterEntity, targetEntity, spell.targetType)) {
      return false;
    }

    // --- Resolve effect ---
    this._resolveEffect(spell, casterEntity, targetEntity);

    // --- Apply cooldown ---
    caster.cooldowns.set(spellId, spell.cooldown);

    // --- Emit event ---
    this.bus.emit('SPELL_CAST', {
      casterEntity,
      spellId,
      targetEntity,
    });

    return true;
  }

  // ---------------------------------------------------------------------------
  // Private helpers — effect resolution
  // ---------------------------------------------------------------------------

  /**
   * Dispatches to the appropriate effect handler based on `spell.effect.type`.
   */
  private _resolveEffect(spell: SpellData, casterEntity: EntityId, targetEntity: EntityId): void {
    const { effect } = spell;

    switch (effect.type) {
      case 'restore_hp':
        this._resolveRestoreHp(targetEntity, effect.amount ?? 0);
        break;

      case 'buff_armor':
        this._resolveBuffArmor(
          casterEntity,
          targetEntity,
          spell.id,
          effect.amount ?? 0,
          effect.duration ?? 0,
        );
        break;

      case 'buff_blood_rush':
        this._resolveBuffBloodRush(
          casterEntity,
          targetEntity,
          spell.id,
          effect.bonusIncrease ?? 0,
          effect.duration ?? 0,
        );
        break;

      case 'chain_damage':
        this._resolveChainDamage(
          casterEntity,
          targetEntity,
          effect.damage ?? 0,
          effect.bounces ?? 0,
          effect.bounceRadius ?? 0,
        );
        break;

      default:
        // Unknown effect type — no-op. Log in development builds only.
        console.warn(`[SpellSystem] Unknown effect type: "${effect.type}" on spell "${spell.id}"`);
    }
  }

  /**
   * Restores `amount` HP to the target, clamped to health.max.
   */
  private _resolveRestoreHp(targetEntity: EntityId, amount: number): void {
    const health = this.world.getComponent(targetEntity, HealthType);
    if (health === undefined) {
      return;
    }
    health.current = Math.min(health.current + amount, health.max);
  }

  /**
   * Applies a timed armor buff to the target (upsert by buffId).
   *
   * The `armorBonus` field on the BuffEntry allows BuffSystem to reverse the
   * flat ArmorComponent.bonusArmor delta precisely on expiry without needing
   * to know the magnitude from config again.
   */
  private _resolveBuffArmor(
    casterEntity: EntityId,
    targetEntity: EntityId,
    spellId: string,
    armorBonus: number,
    duration: number,
  ): void {
    const buffs = this.world.getComponent(targetEntity, BuffsType);
    if (buffs === undefined) {
      return;
    }

    const buffId = `spell_${spellId}`;
    const existingIndex = buffs.buffList.findIndex((b) => b.buffId === buffId);

    if (existingIndex !== -1) {
      // Upsert — refresh duration, do NOT re-apply the armor delta.
      const existing = buffs.buffList[existingIndex];
      if (existing === undefined) {
        return;
      }

      existing.remainingDuration = duration;
      return;
    }

    // New buff — apply armor delta immediately.
    const entry: BuffEntry = {
      buffId,
      sourceEntity: casterEntity,
      remainingDuration: duration,
      magnitude: armorBonus,
      armorBonus,
    };
    buffs.buffList.push(entry);

    const armor = this.world.getComponent(targetEntity, ArmorType_);
    if (armor !== undefined) {
      armor.bonusArmor += armorBonus;
    }

    this.bus.emit('BUFF_APPLIED', {
      targetEntity,
      sourceEntity: casterEntity,
      buffId,
      duration,
      magnitude: armorBonus,
    });
  }

  /**
   * Applies the Blood Surge buff to a friendly orc unit (upsert by buffId).
   *
   * Immediately increments BloodRushComponent.bonusIncrease. BuffSystem will
   * decrement it when the buff expires via the `bloodRushBonus` field.
   */
  private _resolveBuffBloodRush(
    casterEntity: EntityId,
    targetEntity: EntityId,
    spellId: string,
    bonusIncrease: number,
    duration: number,
  ): void {
    const buffs = this.world.getComponent(targetEntity, BuffsType);
    if (buffs === undefined) {
      return;
    }

    const buffId = `spell_${spellId}`;
    const existingIndex = buffs.buffList.findIndex((b) => b.buffId === buffId);

    if (existingIndex !== -1) {
      // Upsert — refresh duration. Do NOT double-increment bonusIncrease.
      const existing = buffs.buffList[existingIndex];
      if (existing === undefined) {
        return;
      }

      existing.remainingDuration = duration;
      return;
    }

    // New buff — increment BloodRushComponent.bonusIncrease.
    const entry: BuffEntry = {
      buffId,
      sourceEntity: casterEntity,
      remainingDuration: duration,
      magnitude: bonusIncrease,
      bloodRushBonus: bonusIncrease,
    };
    buffs.buffList.push(entry);

    const bloodRush = this.world.getComponent(targetEntity, BloodRushType);
    if (bloodRush !== undefined) {
      bloodRush.bonusIncrease += bonusIncrease;
    }

    this.bus.emit('BUFF_APPLIED', {
      targetEntity,
      sourceEntity: casterEntity,
      buffId,
      duration,
      magnitude: bonusIncrease,
    });
  }

  /**
   * Deals instant damage to the primary target, then bounces to the nearest
   * unhit enemy within `bounceRadius` up to `maxBounces` additional times.
   *
   * Damage is applied directly to HealthComponent.current. AttackSystem's
   * armor-matrix formula is intentionally bypassed for chain_damage — the
   * design doc specifies a flat damage number. If armor interaction is required
   * in a future sprint, escalate to game-designer.
   *
   * @remarks
   * The hit-set is a local Set allocated once per cast. Chain Flame is not a
   * per-frame hot path so this single allocation is acceptable (TD-003).
   */
  private _resolveChainDamage(
    casterEntity: EntityId,
    primaryTarget: EntityId,
    damage: number,
    maxBounces: number,
    bounceRadius: number,
  ): void {
    const casterOwner = this.world.getComponent(casterEntity, OwnerType);
    if (casterOwner === undefined) {
      return;
    }

    const bounceRadiusSq = bounceRadius * bounceRadius;
    const hitEntities = new Set<EntityId>();

    let currentTarget = primaryTarget;

    for (let i = 0; i <= maxBounces; i++) {
      if (hitEntities.has(currentTarget)) {
        break;
      }
      hitEntities.add(currentTarget);

      // Apply damage.
      const health = this.world.getComponent(currentTarget, HealthType);
      if (health !== undefined) {
        health.current = Math.max(0, health.current - damage);
      }

      // Find next bounce target — nearest unhit enemy within bounceRadius.
      if (i < maxBounces) {
        const nextTarget = this._findNearestUnhitEnemy(
          currentTarget,
          casterOwner.playerId,
          bounceRadiusSq,
          hitEntities,
        );
        if (nextTarget === undefined) {
          break;
        }
        currentTarget = nextTarget;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers — targeting
  // ---------------------------------------------------------------------------

  /** Returns true when caster and target are within the spell's range. */
  private _isInRange(casterEntity: EntityId, targetEntity: EntityId, range: number): boolean {
    const casterPos = this.world.getComponent(casterEntity, PositionType);
    const targetPos = this.world.getComponent(targetEntity, PositionType);
    if (casterPos === undefined || targetPos === undefined) {
      return false;
    }
    const dx = targetPos.x - casterPos.x;
    const dz = targetPos.z - casterPos.z;
    return dx * dx + dz * dz <= range * range;
  }

  /**
   * Returns true when the target satisfies the spell's targetType constraint.
   *
   * `friendly_unit` — target must share the caster's playerId.
   * `enemy_unit`    — target must differ.
   */
  private _isValidTarget(
    casterEntity: EntityId,
    targetEntity: EntityId,
    targetType: string,
  ): boolean {
    const casterOwner = this.world.getComponent(casterEntity, OwnerType);
    const targetOwner = this.world.getComponent(targetEntity, OwnerType);
    if (casterOwner === undefined || targetOwner === undefined) {
      return false;
    }
    if (!this.world.hasComponent(targetEntity, AliveType)) {
      return false;
    }
    const isFriendly = casterOwner.playerId === targetOwner.playerId;
    if (targetType === 'friendly_unit') {
      return isFriendly;
    }
    if (targetType === 'enemy_unit') {
      return !isFriendly;
    }
    return false;
  }

  /**
   * Finds the nearest alive enemy entity within `radiusSq` of `originEntity`
   * that has not already been hit by the current chain.
   *
   * @param originEntity - The entity to measure from.
   * @param casterPlayerId - PlayerId of the spell caster (used to find enemies).
   * @param radiusSq     - Squared search radius.
   * @param hitEntities  - Set of already-hit entity IDs to exclude.
   * @returns The nearest eligible entity, or undefined if none found.
   */
  private _findNearestUnhitEnemy(
    originEntity: EntityId,
    casterPlayerId: string,
    radiusSq: number,
    hitEntities: Set<EntityId>,
  ): EntityId | undefined {
    const originPos = this.world.getComponent(originEntity, PositionType);
    if (originPos === undefined) {
      return undefined;
    }

    let bestEntity: EntityId | undefined;
    let bestDistSq = Infinity;

    for (const [candidateEntity] of this.world.query(
      HealthType,
      PositionType,
      OwnerType,
      AliveType,
    )) {
      if (hitEntities.has(candidateEntity)) {
        continue;
      }
      const candidateOwner = this.world.getComponent(candidateEntity, OwnerType);
      if (candidateOwner === undefined || candidateOwner.playerId === casterPlayerId) {
        continue; // Skip allies.
      }
      const candidatePos = this.world.getComponent(candidateEntity, PositionType);
      if (candidatePos === undefined) {
        continue;
      }
      const dx = candidatePos.x - originPos.x;
      const dz = candidatePos.z - originPos.z;
      const distSq = dx * dx + dz * dz;
      if (distSq <= radiusSq && distSq < bestDistSq) {
        bestDistSq = distSq;
        bestEntity = candidateEntity;
      }
    }

    return bestEntity;
  }
}
