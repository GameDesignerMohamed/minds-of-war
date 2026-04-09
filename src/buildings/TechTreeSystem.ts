/**
 * TechTreeSystem — ECS System tracking researched technology tiers per faction HQ.
 *
 * Queries all entities that carry both {@link TechComponent} and
 * {@link BuildingComponent} (the combination exclusively marks HQ / Keep
 * buildings — TechComponent is only added to HQ entities at spawn time).
 *
 * Per-tick logic:
 * 1. Skip entities that are not currently researching.
 * 2. Advance researchProgress by deltaTime (frame-rate independent).
 * 3. When researchProgress >= researchTarget: increment currentTier, clear
 *    the researching flag, reset progress, and emit TECH_RESEARCHED.
 *
 * Maximum tier is capped at MAX_TIER (3). Any attempt to start research beyond
 * the cap is a no-op (guarded by the command layer, not this system).
 *
 * The module also exports {@link canTrainUnit} — a pure helper for
 * {@link TrainingQueueSystem} to gate training by player tier without importing
 * the full system class.
 *
 * Implements: design/gdd/tech-tree.md — TechTreeSystem section
 *
 * @module buildings/TechTreeSystem
 */

import { System } from '../ecs/System';
import { TechType, BuildingType, OwnerType } from '../ecs/components/GameComponents';
import type { TechComponent } from '../ecs/components/GameComponents';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { TechTreeConfig } from '../config/ConfigLoader';
import type { EntityId } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum researchable technology tier. */
const MAX_TIER = 3;

// ---------------------------------------------------------------------------
// Pure helper — exported for TrainingQueueSystem integration
// ---------------------------------------------------------------------------

/**
 * Returns `true` if a player at `playerTier` is allowed to train a unit
 * that requires `unitTier`.
 *
 * This is a pure function with no ECS or EventBus dependency so that
 * {@link TrainingQueueSystem} can import it without taking a dependency on
 * the full {@link TechTreeSystem} class.
 *
 * Tier 1 units are always trainable. Tier 2+ units require the player's
 * HQ to have researched the corresponding upgrade.
 *
 * @param unitTier   - The minimum tier required to train this unit (from UnitData).
 * @param playerTier - The player's current HQ tech tier (from TechComponent).
 * @returns `true` if playerTier >= unitTier.
 *
 * @example
 * if (!canTrainUnit(unit.tier, techComp.currentTier)) {
 *   return; // not yet unlocked — refuse to enqueue
 * }
 */
export function canTrainUnit(unitTier: number, playerTier: number): boolean {
  return playerTier >= unitTier;
}

type UnlockableContentType = 'units' | 'buildings';

/**
 * Returns true when the given content is unlocked for a faction at the provided
 * tech tier. Content absent from the tech config is treated as base-tier.
 */
export function isFactionContentUnlocked(
  config: TechTreeConfig,
  factionId: string,
  contentType: UnlockableContentType,
  contentId: string,
  playerTier: number,
): boolean {
  for (const upgrade of config.upgrades) {
    const unlocks = upgrade.unlocks[factionId as keyof typeof upgrade.unlocks];
    if (unlocks === undefined || !unlocks[contentType].includes(contentId)) {
      continue;
    }

    return playerTier >= upgrade.tier;
  }

  return true;
}

// ---------------------------------------------------------------------------
// TechTreeSystem
// ---------------------------------------------------------------------------

/**
 * ECS System that advances HQ technology research each tick.
 *
 * Register this system with the World after all building systems and before
 * TrainingQueueSystem so that tier state is current when training commands
 * are evaluated in the same frame.
 *
 * @example
 * const techSystem = new TechTreeSystem(eventBus, config.techTree);
 * world.registerSystem(techSystem);
 */
export class TechTreeSystem extends System {
  readonly name = 'TechTreeSystem';

  private readonly _eventBus: EventBus<GameEvents>;
  private readonly _config: TechTreeConfig;

  /**
   * @param eventBus - Game-wide event bus. TECH_RESEARCHED is emitted here.
   * @param config   - Loaded tech tree configuration from assets/data/tech/tech-tree.json.
   */
  constructor(eventBus: EventBus<GameEvents>, config: TechTreeConfig) {
    super();
    this._eventBus = eventBus;
    this._config = config;
  }

  // -------------------------------------------------------------------------
  // System.update
  // -------------------------------------------------------------------------

  /**
   * Advances research progress on all HQ entities and fires completion events.
   *
   * Frame-rate independent: all time increments use `deltaTime` (seconds).
   *
   * @param deltaTime - Seconds elapsed since the previous tick.
   */
  update(deltaTime: number): void {
    for (const [entity, tech] of this.world.query(TechType, BuildingType)) {
      if (!tech.researching) {
        continue;
      }

      tech.researchProgress += deltaTime;

      if (tech.researchProgress >= tech.researchTarget) {
        this._completeTierResearch(entity, tech);
      }
    }
  }

  /**
   * Returns the player's current HQ tier, defaulting to tier 1 when no HQ tech
   * component is present yet.
   */
  getPlayerTier(playerId: string): number {
    let highestTier = 1;

    for (const [entity, tech] of this.world.query(TechType, OwnerType)) {
      const owner = this.world.getComponent(entity, OwnerType);
      if (owner?.playerId !== playerId) {
        continue;
      }

      highestTier = Math.max(highestTier, tech.currentTier);
    }

    return highestTier;
  }

  /** Returns true when a unit is unlocked for the player's current tech tier. */
  canTrainUnit(playerId: string, factionId: string, unitId: string, unitTier: number): boolean {
    const playerTier = this.getPlayerTier(playerId);
    return (
      canTrainUnit(unitTier, playerTier) &&
      isFactionContentUnlocked(this._config, factionId, 'units', unitId, playerTier)
    );
  }

  /** Returns true when a building is unlocked for the player's current tech tier. */
  canConstructBuilding(playerId: string, factionId: string, buildingId: string): boolean {
    const playerTier = this.getPlayerTier(playerId);
    return isFactionContentUnlocked(this._config, factionId, 'buildings', buildingId, playerTier);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Finalizes a tier upgrade: advances the tier, resets research state, and
   * emits {@link GameEvents.TECH_RESEARCHED}.
   */
  private _completeTierResearch(entity: EntityId, tech: TechComponent): void {
    const newTier = Math.min(tech.currentTier + 1, MAX_TIER);

    tech.currentTier = newTier;
    tech.researching = false;
    tech.researchProgress = 0;
    tech.researchTarget = 0;
    tech.researchCost = { gold: 0, wood: 0 };

    // Retrieve owner data to populate the event payload.
    const owner = this.world.getComponent(entity, OwnerType);

    this._eventBus.emit('TECH_RESEARCHED', {
      entityId: entity,
      newTier,
      faction: owner?.faction ?? ('' as never),
      playerId: owner?.playerId ?? '',
    });
  }

  // -------------------------------------------------------------------------
  // Convenience: start research (called by command layer, not by the system itself)
  // -------------------------------------------------------------------------

  /**
   * Starts a tier-upgrade research job on the given HQ entity.
   *
   * Looks up the correct {@link TechUpgrade} entry from config by matching the
   * target tier. No-op if:
   * - The entity does not have a TechComponent.
   * - The entity is already researching.
   * - The entity has already reached MAX_TIER.
   * - No config entry exists for the target tier.
   *
   * Resource deduction is the responsibility of the calling command layer —
   * this method only sets the research state.
   *
   * @param entity     - The HQ entity to start research on.
   * @param targetTier - The tier to research toward (2 or 3).
   * @returns `true` if research was successfully started, `false` otherwise.
   *
   * @example
   * const started = techSystem.startResearch(hqEntity, 2);
   * if (started) { resourceTracker.spend(playerId, cost); }
   */
  startResearch(entity: EntityId, targetTier: number): boolean {
    const tech = this.world.getComponent(entity, TechType);
    if (tech === undefined) {
      return false;
    }
    if (tech.researching || tech.currentTier >= MAX_TIER) {
      return false;
    }
    if (targetTier !== tech.currentTier + 1) {
      // Tiers must be researched in order.
      return false;
    }

    const upgradeEntry = this._config.upgrades.find((u) => u.tier === targetTier);
    if (upgradeEntry === undefined) {
      return false;
    }

    tech.researching = true;
    tech.researchProgress = 0;
    tech.researchTarget = upgradeEntry.researchTime;
    tech.researchCost = { ...upgradeEntry.cost };

    return true;
  }
}
