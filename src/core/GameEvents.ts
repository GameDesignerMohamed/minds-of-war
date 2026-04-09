/**
 * GameEvents — typed event map for the game-wide EventBus.
 *
 * Every event topic emitted or consumed by gameplay systems is declared here.
 * Import this map when constructing or injecting the bus:
 *
 *   const bus = new EventBus<GameEvents>();
 *
 * Design principle: systems must never call each other directly. All
 * cross-system communication must flow through this bus so that systems remain
 * independently testable and the coupling graph stays acyclic.
 *
 * Implements: design/gdd/ (all cross-system contracts)
 *
 * @module core/GameEvents
 */

import type { EntityId, Faction } from '../types';
import type { ResourceKind } from '../ecs/components/GameComponents';

/**
 * Typed event map for the Minds of War EventBus.
 *
 * Each key is a topic string; the value type is the payload shape emitted and
 * received by listeners. All payload fields are read-only to prevent handlers
 * from mutating the event object.
 */
export interface GameEvents {
  // -------------------------------------------------------------------------
  // Combat
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link AttackSystem} after damage has been applied to a target.
   *
   * @remarks
   * The `finalDamage` value is the post-formula, post-armor result — what was
   * actually subtracted from the target's HP. Useful for floating damage numbers,
   * kill attribution, and kill-streak tracking.
   */
  UNIT_ATTACKED: {
    readonly attackerEntity: EntityId;
    readonly targetEntity: EntityId;
    /** Damage actually applied after armor and matrix reduction. */
    readonly finalDamage: number;
  };

  /**
   * Emitted by {@link AttackSystem} immediately after a unit's HP reaches 0.
   *
   * Listeners: AI system (retreat logic), UI system (death effects), ResourceTracker
   * (supply refund), producers (victory condition checking).
   */
  UNIT_DIED: {
    readonly entityId: EntityId;
    readonly killedByEntity: EntityId;
    readonly faction: Faction;
  };

  // -------------------------------------------------------------------------
  // Economy — resources
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link HarvestSystem} each time a worker deposits a cargo load
   * at a drop-off building.
   *
   * {@link ResourceTracker} listens to this event to credit the player's
   * resource totals. This is the single point of resource income in the economy.
   */
  RESOURCE_DEPOSITED: {
    readonly playerId: string;
    readonly kind: ResourceKind;
    readonly amount: number;
    /** The worker entity that made the deposit. */
    readonly workerEntity: EntityId;
    /** The drop-off building entity. */
    readonly dropOffEntity: EntityId;
  };

  /**
   * Emitted by {@link ResourceTracker} whenever a player's gold or wood balance
   * changes (income or expenditure).
   *
   * UI systems listen to update the resource counter display.
   */
  RESOURCES_CHANGED: {
    readonly playerId: string;
    readonly gold: number;
    readonly wood: number;
    /** Delta from previous value (negative for spend, positive for income). */
    readonly goldDelta: number;
    readonly woodDelta: number;
  };

  /**
   * Emitted by {@link HarvestSystem} when a resource node is fully depleted.
   *
   * AI and worker systems listen to reassign idle workers to other nodes.
   */
  RESOURCE_DEPLETED: {
    readonly nodeEntity: EntityId;
    readonly kind: ResourceKind;
  };

  // -------------------------------------------------------------------------
  // Economy — supply
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link ResourceTracker} when a player's current supply usage
   * or supply cap changes.
   *
   * UI listens to update the food/supply counter.
   */
  SUPPLY_CHANGED: {
    readonly playerId: string;
    readonly current: number;
    readonly cap: number;
  };

  // -------------------------------------------------------------------------
  // Buildings
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link ConstructionSystem} when a building finishes construction.
   *
   * Listeners: ResourceTracker (population cap update), AI, player camera.
   */
  BUILDING_COMPLETE: {
    readonly entityId: EntityId;
    readonly buildingId: string;
    readonly faction: Faction;
    readonly playerId: string;
  };

  /**
   * Emitted by {@link AttackSystem} when a building's HP reaches 0.
   *
   * Triggers the building destruction sequence (removal from scene, supply cap
   * update, victory/defeat check).
   */
  BUILDING_DESTROYED: {
    readonly entityId: EntityId;
    readonly buildingId: string;
    readonly faction: Faction;
    readonly playerId: string;
    readonly destroyedByEntity: EntityId;
  };

  // -------------------------------------------------------------------------
  // Training Queue
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link TrainingQueueSystem} when a unit finishes training and
   * spawns at the rally point.
   *
   * Listeners: ResourceTracker (supply update), AI (army size tracking), UI
   * (minimap icon, notification toast).
   */
  UNIT_TRAINED: {
    readonly spawnedEntity: EntityId;
    readonly unitId: string;
    readonly faction: Faction;
    readonly playerId: string;
    /** The building entity that produced this unit. */
    readonly buildingEntity: EntityId;
  };

  /**
   * Emitted by {@link TrainingQueueSystem} when a unit is added to a building's
   * training queue (after the resource cost has been deducted).
   */
  UNIT_QUEUED: {
    readonly unitId: string;
    readonly buildingEntity: EntityId;
    readonly playerId: string;
    /** Number of units now in the queue after this addition. */
    readonly queueLength: number;
  };

  /**
   * Emitted when a training queue item is cancelled and the resource cost is
   * refunded to the player.
   */
  UNIT_QUEUE_CANCELLED: {
    readonly unitId: string;
    readonly buildingEntity: EntityId;
    readonly playerId: string;
    readonly refundGold: number;
    readonly refundWood: number;
  };

  // -------------------------------------------------------------------------
  // Technology Research
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link TechTreeSystem} when a faction's HQ finishes researching
   * a tier upgrade.
   *
   * Listeners: UI system (tier badge, unlock notification toast), TrainingQueueSystem
   * (unlock tier-gated units), AI system (army composition adjustment after unlock).
   *
   * Implements: design/gdd/tech-tree.md — TECH_RESEARCHED event
   */
  TECH_RESEARCHED: {
    /** The HQ building entity that completed the research. */
    readonly entityId: EntityId;
    /** The tier that was just unlocked (2 after Upgrade I, 3 after Upgrade II). */
    readonly newTier: number;
    /** Faction that owns the HQ — determines which unlock table applies. */
    readonly faction: Faction;
    /** Player identifier for the owning player. */
    readonly playerId: string;
  };

  // -------------------------------------------------------------------------
  // Spells & Buffs
  // -------------------------------------------------------------------------

  /**
   * Emitted by {@link SpellSystem} immediately after a unit successfully casts
   * a spell (cost and cooldown have been applied).
   *
   * Listeners: UI system (cooldown overlay), AI system (react to enemy cast),
   * audio system (cast sound trigger).
   */
  SPELL_CAST: {
    /** The unit entity that cast the spell. */
    readonly casterEntity: EntityId;
    /** Spell id matching an entry in assets/data/factions/spells.json. */
    readonly spellId: string;
    /** The primary target entity (may equal casterEntity for self-targeted spells). */
    readonly targetEntity: EntityId;
  };

  /**
   * Emitted by {@link SpellSystem} or {@link AuraSystem} when a buff is
   * successfully applied to a unit.
   *
   * Listeners: UI system (buff icon display), audio system (buff sound).
   */
  BUFF_APPLIED: {
    /** The unit entity receiving the buff. */
    readonly targetEntity: EntityId;
    /** The entity that is the source of the buff (caster or aura emitter). */
    readonly sourceEntity: EntityId;
    /** Buff id matching a spell effect or aura id. */
    readonly buffId: string;
    /** Duration in seconds the buff will last. */
    readonly duration: number;
    /** Numeric magnitude of the buff (interpretation is buff-type-specific). */
    readonly magnitude: number;
  };

  /**
   * Emitted by {@link BuffSystem} when a timed buff reaches zero remaining
   * duration and is removed from the unit.
   *
   * Listeners: UI system (remove buff icon), SpellSystem (clean up bonusIncrease
   * on BloodRushComponent when Blood Surge expires).
   */
  BUFF_EXPIRED: {
    /** The unit entity from which the buff was removed. */
    readonly targetEntity: EntityId;
    /** Buff id that expired. */
    readonly buffId: string;
    /** The original source entity that applied the buff. */
    readonly sourceEntity: EntityId;
  };
}
