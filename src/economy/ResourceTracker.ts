/**
 * ResourceTracker — in-memory ledger for all player resource balances.
 *
 * Implements: design/gdd/economy.md — resource accounting
 *
 * Responsibilities:
 *  - Maintain gold, wood, supply-used, and supply-cap per player.
 *  - Expose `canAfford` / `spend` / `credit` for atomic cost checks and mutations.
 *  - Listen to RESOURCE_DEPOSITED (from HarvestSystem) to credit income.
 *  - Listen to BUILDING_COMPLETE (from ConstructionSystem) to update supply cap.
 *  - Listen to UNIT_DIED / BUILDING_DESTROYED (from AttackSystem) to refund supply.
 *  - Emit RESOURCES_CHANGED and SUPPLY_CHANGED on the bus after every mutation.
 *
 * Not a System — it does not tick. It is a stateful service with event-driven
 * mutations, registered once at game startup and held for the session lifetime.
 *
 * Thread-safety: single-threaded; all mutations happen synchronously in JS.
 *
 * @module economy/ResourceTracker
 */

import type { EventBus, Unsubscribe } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { StartingLoadoutData } from '../config/ConfigLoader';
import type { World } from '../ecs/World';
import { UnitType, BuildingType, OwnerType } from '../ecs/components/GameComponents';

// ---------------------------------------------------------------------------
// PlayerResources
// ---------------------------------------------------------------------------

/** All resource state for a single player. */
export interface PlayerResources {
  gold: number;
  wood: number;
  /** Units of supply currently consumed by living units. */
  supplyUsed: number;
  /** Maximum supply cap (buildings provide this). */
  supplyCap: number;
}

// ---------------------------------------------------------------------------
// ResourceTracker
// ---------------------------------------------------------------------------

/**
 * Stateful economy ledger. One instance per game session; shared via DI.
 *
 * @example
 * ```ts
 * const tracker = new ResourceTracker(bus, world, config.startingLoadout);
 * tracker.initPlayer('human');
 * tracker.initPlayer('orc');
 *
 * // Check before spending:
 * if (tracker.canAfford('human', { gold: 120, wood: 0 })) {
 *   tracker.spend('human', { gold: 120, wood: 0 });
 * }
 * ```
 */
export class ResourceTracker {
  private readonly _bus: EventBus<GameEvents>;
  private readonly _world: World;
  private readonly _config: StartingLoadoutData;
  private readonly _players: Map<string, PlayerResources> = new Map();

  /** Held so they can be removed on destroy(). */
  private readonly _unsubs: Unsubscribe[] = [];

  /**
   * @param bus    - Game-wide event bus.
   * @param world  - ECS world, used to look up unit/building components for
   *                 supply refund on death.
   * @param config - Starting loadout from assets/data/economy/starting-loadout.json.
   */
  constructor(bus: EventBus<GameEvents>, world: World, config: StartingLoadoutData) {
    this._bus = bus;
    this._world = world;
    this._config = config;
    this._subscribeToEvents();
  }

  // -------------------------------------------------------------------------
  // Player Initialisation
  // -------------------------------------------------------------------------

  /**
   * Creates the resource record for a player using starting loadout values.
   *
   * Call once per player during game setup, before any system ticks.
   *
   * @param playerId - Matches the PlayerId in OwnerComponent ('human' | 'orc').
   */
  initPlayer(playerId: string): void {
    this._players.set(playerId, {
      gold: this._config.gold,
      wood: this._config.wood,
      supplyUsed: 0,
      supplyCap: this._config.initialSupply,
    });
  }

  // -------------------------------------------------------------------------
  // Query API
  // -------------------------------------------------------------------------

  /**
   * Returns the current resource state for a player.
   *
   * @param playerId - The player to query.
   * @returns A read-only snapshot of the player's resources, or undefined if
   *   the player has not been initialised.
   */
  getResources(playerId: string): Readonly<PlayerResources> | undefined {
    return this._players.get(playerId);
  }

  /**
   * Returns `true` if the player has enough gold and wood to afford the cost.
   *
   * @param playerId - The player to check.
   * @param cost     - Required gold and wood amounts.
   */
  canAfford(playerId: string, cost: { gold: number; wood: number }): boolean {
    const p = this._players.get(playerId);
    if (p === undefined) return false;
    return p.gold >= cost.gold && p.wood >= cost.wood;
  }

  /**
   * Returns `true` if the player has enough free supply to field a unit of
   * the given cost.
   *
   * @param playerId   - The player to check.
   * @param supplyCost - Supply units the new unit would consume.
   */
  hasSupply(playerId: string, supplyCost: number): boolean {
    const p = this._players.get(playerId);
    if (p === undefined) return false;
    return p.supplyUsed + supplyCost <= Math.min(p.supplyCap, this._config.maxSupplyCap);
  }

  // -------------------------------------------------------------------------
  // Mutation API
  // -------------------------------------------------------------------------

  /**
   * Deducts a resource cost from the player's balance.
   *
   * Caller must check {@link canAfford} first; this method does NOT guard
   * against going negative.
   *
   * @param playerId - The player to charge.
   * @param cost     - Gold and wood to deduct.
   */
  spend(playerId: string, cost: { gold: number; wood: number }): void {
    const p = this._players.get(playerId);
    if (p === undefined) return;

    const prev = { gold: p.gold, wood: p.wood };
    p.gold -= cost.gold;
    p.wood -= cost.wood;

    this._bus.emit('RESOURCES_CHANGED', {
      playerId,
      gold: p.gold,
      wood: p.wood,
      goldDelta: p.gold - prev.gold,
      woodDelta: p.wood - prev.wood,
    });
  }

  /**
   * Credits resources to the player's balance (income from harvest deposits).
   *
   * @param playerId  - The player to credit.
   * @param kind      - 'gold' or 'wood'.
   * @param amount    - Amount to add.
   */
  credit(playerId: string, kind: 'gold' | 'wood', amount: number): void {
    const p = this._players.get(playerId);
    if (p === undefined) return;

    const prev = { gold: p.gold, wood: p.wood };
    if (kind === 'gold') {
      p.gold += amount;
    } else {
      p.wood += amount;
    }

    this._bus.emit('RESOURCES_CHANGED', {
      playerId,
      gold: p.gold,
      wood: p.wood,
      goldDelta: p.gold - prev.gold,
      woodDelta: p.wood - prev.wood,
    });
  }

  /**
   * Adds supply capacity when a building finishes construction.
   *
   * Clamped to the global max supply cap from config.
   *
   * @param playerId          - The owning player.
   * @param populationProvided - Supply cap increase from the building data.
   */
  addSupplyCap(playerId: string, populationProvided: number): void {
    const p = this._players.get(playerId);
    if (p === undefined || populationProvided <= 0) return;

    p.supplyCap = Math.min(p.supplyCap + populationProvided, this._config.maxSupplyCap);

    this._bus.emit('SUPPLY_CHANGED', {
      playerId,
      current: p.supplyUsed,
      cap: p.supplyCap,
    });
  }

  /**
   * Charges supply usage when a unit is trained.
   *
   * @param playerId   - The owning player.
   * @param supplyCost - Supply units consumed by the new unit.
   */
  chargeSupply(playerId: string, supplyCost: number): void {
    const p = this._players.get(playerId);
    if (p === undefined) return;

    p.supplyUsed += supplyCost;

    this._bus.emit('SUPPLY_CHANGED', {
      playerId,
      current: p.supplyUsed,
      cap: p.supplyCap,
    });
  }

  /**
   * Refunds supply usage when a unit dies.
   *
   * @param playerId   - The owning player.
   * @param supplyCost - Supply units to return.
   */
  refundSupply(playerId: string, supplyCost: number): void {
    const p = this._players.get(playerId);
    if (p === undefined) return;

    p.supplyUsed = Math.max(0, p.supplyUsed - supplyCost);

    this._bus.emit('SUPPLY_CHANGED', {
      playerId,
      current: p.supplyUsed,
      cap: p.supplyCap,
    });
  }

  // -------------------------------------------------------------------------
  // Teardown
  // -------------------------------------------------------------------------

  /**
   * Removes all event subscriptions. Call when the game session ends.
   */
  destroy(): void {
    for (const unsub of this._unsubs) unsub();
    this._unsubs.length = 0;
  }

  // -------------------------------------------------------------------------
  // Private — event wiring
  // -------------------------------------------------------------------------

  private _subscribeToEvents(): void {
    this._unsubs.push(
      this._bus.on('RESOURCE_DEPOSITED', (e) => {
        this.credit(e.playerId, e.kind, e.amount);
      }),

      this._bus.on('BUILDING_COMPLETE', (e) => {
        const building = this._world.getComponent(e.entityId, BuildingType);
        if (building !== undefined && building.populationProvided > 0) {
          this.addSupplyCap(e.playerId, building.populationProvided);
        }
      }),

      this._bus.on('UNIT_TRAINED', (e) => {
        const unit = this._world.getComponent(e.spawnedEntity, UnitType);
        if (unit !== undefined) {
          this.chargeSupply(e.playerId, unit.supplyCost);
        }
      }),

      this._bus.on('UNIT_DIED', (e) => {
        const unit = this._world.getComponent(e.entityId, UnitType);
        if (unit !== undefined) {
          const owner = this._world.getComponent(e.entityId, OwnerType);
          const pid = owner?.playerId ?? e.faction.toLowerCase();
          this.refundSupply(pid, unit.supplyCost);
        }
      }),
    );
  }
}
