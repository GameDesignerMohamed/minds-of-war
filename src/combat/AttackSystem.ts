/**
 * AttackSystem — resolves melee and ranged attacks each simulation tick.
 *
 * Implements: design/gdd/combat.md — attack resolution loop
 *
 * Responsibilities:
 *  1. Iterate every entity that has AttackTarget + CombatStats + Position + Alive.
 *  2. Check range: if target is out of range, skip (MovementSystem handles
 *     closing distance — AttackSystem does not issue move orders).
 *  3. Advance cooldown timer; skip if cooldown has not elapsed.
 *  4. Call DamageFormula.calculateDamage with attacker stats + target armor.
 *  5. Apply finalDamage to target's HealthComponent.
 *  6. Emit UNIT_ATTACKED on the bus.
 *  7. If target HP ≤ 0, emit UNIT_DIED and remove the Alive tag from the target.
 *     The entity is NOT destroyed here — death cleanup (scene removal, supply
 *     refund) is handled by listeners on UNIT_DIED.
 *
 * Dependencies injected via constructor:
 *  - EventBus<GameEvents>  — for UNIT_ATTACKED / UNIT_DIED
 *  - CombatConfig          — damage matrix and armor reduction factor
 *
 * @module combat/AttackSystem
 */

import { System } from '../ecs/System';
import {
  PositionType,
  HealthType,
  CombatStatsType,
  ArmorType_,
  AliveType,
  AttackTargetType,
  BuildingType,
  OwnerType,
} from '../ecs/components/GameComponents';
import { calculateDamage } from './DamageFormula';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { CombatConfig } from '../config/ConfigLoader';
import type { EntityId } from '../types';
import { Faction } from '../types';
import { NULL_ENTITY } from '../ecs/Entity';

// ---------------------------------------------------------------------------
// AttackSystem
// ---------------------------------------------------------------------------

/**
 * Processes attack orders for all entities that have an AttackTarget component.
 *
 * Frame-rate independent: all cooldown timers are advanced by `deltaTime`.
 * Zero allocations in the hot path — only pre-existing component objects are
 * read and mutated; no new objects are created per tick.
 *
 * @example
 * ```ts
 * const attackSystem = new AttackSystem(eventBus, config.combat);
 * world.registerSystem(attackSystem);
 * ```
 */
export class AttackSystem extends System {
  readonly name = 'AttackSystem';

  private readonly _bus: EventBus<GameEvents>;
  private readonly _combatConfig: CombatConfig;

  /**
   * @param bus          - Game-wide event bus. Receives UNIT_ATTACKED and UNIT_DIED.
   * @param combatConfig - Loaded from assets/data/combat/damage-matrix.json.
   */
  constructor(bus: EventBus<GameEvents>, combatConfig: CombatConfig) {
    super();
    this._bus = bus;
    this._combatConfig = combatConfig;
  }

  // -------------------------------------------------------------------------
  // System lifecycle
  // -------------------------------------------------------------------------

  /**
   * Called every simulation tick.
   *
   * Iterates all entities with an active AttackTarget, advances their cooldown,
   * and fires attacks when the cooldown has elapsed and the target is in range.
   *
   * @param deltaTime - Elapsed seconds since the last tick.
   */
  update(deltaTime: number): void {
    for (const [attackerEntity, attackTarget] of this.world.query(AttackTargetType)) {
      // Attacker must be alive.
      if (!this.world.hasComponent(attackerEntity, AliveType)) {
        this.world.removeComponent(attackerEntity, AttackTargetType);
        continue;
      }

      const targetEntity = attackTarget.targetEntity;

      // If the target no longer exists or is dead, clear the order.
      if (targetEntity === NULL_ENTITY || !this.world.hasComponent(targetEntity, AliveType)) {
        this.world.removeComponent(attackerEntity, AttackTargetType);
        continue;
      }

      const combatStats = this.world.getComponent(attackerEntity, CombatStatsType);
      const attackerPos = this.world.getComponent(attackerEntity, PositionType);
      const targetPos = this.world.getComponent(targetEntity, PositionType);

      if (combatStats === undefined || attackerPos === undefined || targetPos === undefined) {
        continue;
      }

      // Advance cooldown timer.
      if (combatStats.attackCooldownRemaining > 0) {
        combatStats.attackCooldownRemaining = Math.max(
          0,
          combatStats.attackCooldownRemaining - deltaTime,
        );
        continue;
      }

      // Range check (Euclidean distance, XZ plane only).
      const dx = targetPos.x - attackerPos.x;
      const dz = targetPos.z - attackerPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > combatStats.attackRange) {
        // Out of range — wait for movement system to close distance.
        continue;
      }

      // Resolve damage.
      const targetArmor = this.world.getComponent(targetEntity, ArmorType_);
      const armorValue =
        targetArmor !== undefined ? targetArmor.armorValue + targetArmor.bonusArmor : 0;
      const targetArmorType = targetArmor?.armorType;

      if (targetArmorType === undefined) {
        continue;
      }

      const result = calculateDamage(
        {
          baseDamage: combatStats.baseDamage,
          bonusDamage: combatStats.bonusDamage,
          attackType: combatStats.attackType,
          armorType: targetArmorType,
          armorValue,
        },
        this._combatConfig,
      );

      // Apply damage.
      const targetHealth = this.world.getComponent(targetEntity, HealthType);
      if (targetHealth === undefined) {
        continue;
      }

      targetHealth.current = Math.max(0, targetHealth.current - result.finalDamage);

      // Reset cooldown.
      combatStats.attackCooldownRemaining = combatStats.attackCooldown;

      this._bus.emit('UNIT_ATTACKED', {
        attackerEntity,
        targetEntity,
        finalDamage: result.finalDamage,
      });

      // Death check.
      if (targetHealth.current <= 0) {
        this._handleDeath(targetEntity, attackerEntity);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Removes the Alive tag from a dying entity and emits the appropriate death
   * event (UNIT_DIED or BUILDING_DESTROYED).
   *
   * The entity is NOT destroyed here. Consumers of the death event are
   * responsible for calling world.destroyEntity when all cleanup is done.
   */
  private _handleDeath(entity: EntityId, killedBy: EntityId): void {
    // Remove alive tag so subsequent queries exclude this entity.
    this.world.removeComponent(entity, AliveType);
    // Clear any attack order targeting this entity on the attacker.
    this.world.removeComponent(entity, AttackTargetType);

    const owner = this.world.getComponent(entity, OwnerType);
    const faction: Faction = owner?.faction ?? Faction.Human;
    const playerId: string = owner?.playerId ?? 'unknown';

    // Determine whether the dead entity is a building or a unit and emit
    // the appropriate event.
    const building = this.world.getComponent(entity, BuildingType);

    if (building !== undefined) {
      this._bus.emit('BUILDING_DESTROYED', {
        entityId: entity,
        buildingId: building.buildingId,
        faction,
        playerId,
        destroyedByEntity: killedBy,
      });
    } else {
      this._bus.emit('UNIT_DIED', {
        entityId: entity,
        killedByEntity: killedBy,
        faction,
      });
    }
  }
}
