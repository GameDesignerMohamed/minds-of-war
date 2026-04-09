/**
 * GameComponents — all ECS component interfaces for Minds of War.
 *
 * Every component is a pure-data bag with no methods. Systems are the sole
 * mutators. All type tokens are exported so systems can import them directly.
 *
 * Component type strings must be unique across the entire project. The convention
 * is PascalCase matching the interface name minus the "Component" suffix.
 *
 * Implements: design/gdd/ (all core gameplay mechanics)
 *
 * @module ecs/components/GameComponents
 */

import { Component, ComponentType, componentType } from '../Component';
import { AttackType, ArmorType, Faction } from '../../types';
import type { EntityId, Position } from '../../types';

// ---------------------------------------------------------------------------
// Identity & Ownership
// ---------------------------------------------------------------------------

/**
 * Identifies which player (faction) owns this entity.
 *
 * Present on every unit and building. Used by targeting, damage, and UI systems
 * to determine friend/foe relationships.
 */
export interface OwnerComponent extends Component {
  readonly type: 'Owner';
  /** The faction this entity belongs to. */
  faction: Faction;
  /** String player identifier matching {@link PlayerId}. */
  playerId: string;
}
export const OwnerType: ComponentType<OwnerComponent> = componentType<OwnerComponent>('Owner');

// ---------------------------------------------------------------------------
// Spatial
// ---------------------------------------------------------------------------

/**
 * World-space position of an entity on the simulation grid.
 *
 * X = column, Z = row. Y is implicit (ground plane). Updated every frame by
 * {@link MovementSystem} when a move order is active.
 */
export interface PositionComponent extends Component {
  readonly type: 'Position';
  x: number;
  z: number;
}
export const PositionType: ComponentType<PositionComponent> =
  componentType<PositionComponent>('Position');

/**
 * Active movement order. Present while a unit is moving toward a destination.
 *
 * {@link MovementSystem} advances the entity toward (targetX, targetZ) each tick.
 * On arrival it clears this component (removes targetX/Z by setting them to
 * undefined), which signals downstream systems (e.g. HarvestSystem) that the
 * unit has reached its destination.
 *
 * Waypoint fields (added for pathfinding support):
 * When {@link PathfindingSystem} resolves a path, it writes the waypoint array
 * here. {@link MovementSystem} then follows waypoints[waypointIndex] in order,
 * incrementing waypointIndex on each waypoint arrival. When all waypoints are
 * consumed, targetX/Z are cleared as the final arrival signal (preserving the
 * contract that HarvestSystem and other downstream systems poll for undefined).
 *
 * If waypoints is empty/undefined and targetX/Z are set, MovementSystem falls
 * back to straight-line movement for backwards compatibility.
 */
export interface MovementComponent extends Component {
  readonly type: 'Movement';
  /** Destination X, or undefined when no order is active. */
  targetX: number | undefined;
  /** Destination Z, or undefined when no order is active. */
  targetZ: number | undefined;
  /** World-units per second from unit data. */
  speed: number;
  /**
   * Ordered waypoints from PathfindingSystem. Empty array or undefined means
   * no path has been computed — MovementSystem will move straight to target.
   * Set by PathfindingSystem; consumed and cleared by MovementSystem.
   */
  waypoints: Position[];
  /**
   * Index into {@link waypoints} of the next waypoint to move toward.
   * Incremented by MovementSystem on each waypoint arrival. Reset to 0
   * whenever new waypoints are assigned by PathfindingSystem.
   */
  waypointIndex: number;
}
export const MovementType: ComponentType<MovementComponent> =
  componentType<MovementComponent>('Movement');

// ---------------------------------------------------------------------------
// Health & Combat Stats
// ---------------------------------------------------------------------------

/**
 * Current and maximum hit points for a unit or building.
 *
 * The HpBarSystem reads this component to render the health bar overlay.
 * AttackSystem writes `current` when damage is applied.
 */
export interface HealthComponent extends Component {
  readonly type: 'Health';
  current: number;
  max: number;
}
export const HealthType: ComponentType<HealthComponent> = componentType<HealthComponent>('Health');

/**
 * Combat offensive statistics for units and buildings that can attack.
 *
 * All values are loaded from config; upgrades modify `bonusDamage` and
 * `weaponLevel` at runtime without touching the base stat.
 */
export interface CombatStatsComponent extends Component {
  readonly type: 'CombatStats';
  /** Base damage from unit/building data. */
  baseDamage: number;
  /** Flat bonus damage from weapon upgrades (starts at 0). */
  bonusDamage: number;
  /** Current weapon upgrade level for bookkeeping. */
  weaponLevel: number;
  attackType: AttackType;
  /** Maximum attack range in world units. */
  attackRange: number;
  /** Minimum seconds between attacks. */
  attackCooldown: number;
  /** Seconds remaining until next attack is available (counts down each frame). */
  attackCooldownRemaining: number;
}
export const CombatStatsType: ComponentType<CombatStatsComponent> =
  componentType<CombatStatsComponent>('CombatStats');

/**
 * Armor rating for units and buildings.
 *
 * ArmorSystem / DamageFormula uses armorType + armorValue + bonusArmor to
 * calculate the final damage modifier for each incoming hit.
 */
export interface ArmorComponent extends Component {
  readonly type: 'Armor';
  armorType: ArmorType;
  /** Base armor value from data. */
  armorValue: number;
  /** Flat bonus armor from upgrades or auras (starts at 0). */
  bonusArmor: number;
  /** Current armor upgrade level for bookkeeping. */
  armorLevel: number;
}
export const ArmorType_: ComponentType<ArmorComponent> = componentType<ArmorComponent>('Armor');
// NOTE: exported as ArmorType_ to avoid name collision with the ArmorType enum imported above.

/**
 * Tag component indicating a unit or building is currently alive and can be
 * targeted. Removed (not just zeroed) when the entity dies so queries
 * automatically exclude dead entities.
 */
export interface AliveComponent extends Component {
  readonly type: 'Alive';
}
export const AliveType: ComponentType<AliveComponent> = componentType<AliveComponent>('Alive');

// ---------------------------------------------------------------------------
// Attack Targeting
// ---------------------------------------------------------------------------

/**
 * Tracks the entity currently being attacked by this unit.
 *
 * Set by AI or player command; cleared by AttackSystem when the target dies or
 * moves out of range. Absence of this component means the unit is not attacking.
 */
export interface AttackTargetComponent extends Component {
  readonly type: 'AttackTarget';
  targetEntity: EntityId;
}
export const AttackTargetType: ComponentType<AttackTargetComponent> =
  componentType<AttackTargetComponent>('AttackTarget');

// ---------------------------------------------------------------------------
// Economy — Workers & Resources
// ---------------------------------------------------------------------------

/**
 * Present on worker units. Tracks the current harvest state and cargo.
 *
 * State machine: idle → movingToResource → harvesting → movingToDropOff → idle
 *
 * {@link HarvestSystem} drives all transitions. The `assignedResource` and
 * `assignedDropOff` fields are entity IDs (NULL_ENTITY = unassigned).
 */
export interface HarvesterComponent extends Component {
  readonly type: 'Harvester';
  /** Current phase of the harvest cycle. */
  state: HarvestState;
  /** EntityId of the resource node the worker is assigned to. */
  assignedResource: EntityId;
  /** EntityId of the drop-off building the worker will return to. */
  assignedDropOff: EntityId;
  /** Resource type currently being carried ('gold' | 'wood'). */
  carryType: ResourceKind;
  /** Amount carried right now (0 = empty). */
  carryAmount: number;
  /** Seconds elapsed in the current mine/chop action (resets each cycle). */
  gatherTimer: number;
}
export const HarvesterType: ComponentType<HarvesterComponent> =
  componentType<HarvesterComponent>('Harvester');

/** All valid states in the worker harvest state machine. */
export type HarvestState =
  | 'idle'
  | 'movingToResource'
  | 'harvesting'
  | 'movingToDropOff'
  | 'droppingOff';

/** Resource categories tracked by the economy. */
export type ResourceKind = 'gold' | 'wood';

/**
 * Present on gold mine and tree entities. Tracks remaining capacity.
 *
 * When `remaining` reaches 0 the resource is depleted and the entity should be
 * destroyed (or marked exhausted).
 */
export interface ResourceNodeComponent extends Component {
  readonly type: 'ResourceNode';
  kind: ResourceKind;
  /** Total resource units remaining at this node. */
  remaining: number;
  /** Maximum capacity (from config). */
  capacity: number;
  /** Number of workers currently assigned to this node. */
  assignedWorkers: number;
  /** Maximum workers that contribute efficiency (from config). */
  maxEffectiveWorkers: number;
}
export const ResourceNodeType: ComponentType<ResourceNodeComponent> =
  componentType<ResourceNodeComponent>('ResourceNode');

// ---------------------------------------------------------------------------
// Buildings
// ---------------------------------------------------------------------------

/**
 * Construction progress for a building that is being built by a worker.
 *
 * {@link ConstructionSystem} advances `elapsed` each frame. When
 * `elapsed >= buildTime` the building is complete and this component is removed.
 */
export interface ConstructionComponent extends Component {
  readonly type: 'Construction';
  /** Total seconds required to complete (from BuildingData). */
  buildTime: number;
  /** Seconds elapsed so far. */
  elapsed: number;
  /** EntityId of the worker performing construction, or 0 when paused/unassigned. */
  builderEntity: EntityId;
}
export const ConstructionType: ComponentType<ConstructionComponent> =
  componentType<ConstructionComponent>('Construction');

/**
 * Training queue for a building that can produce units.
 *
 * {@link TrainingQueueSystem} processes the front of the queue each tick.
 * Maximum queue depth is enforced by the command system before enqueueing.
 */
export interface TrainingQueueComponent extends Component {
  readonly type: 'TrainingQueue';
  /** Ordered list of unit IDs waiting to be trained. */
  queue: string[];
  /** Seconds elapsed training the current front-of-queue unit (0 = none in progress). */
  progress: number;
  /** buildTime of the currently-training unit (0 = none). */
  currentBuildTime: number;
}
export const TrainingQueueType: ComponentType<TrainingQueueComponent> =
  componentType<TrainingQueueComponent>('TrainingQueue');

/**
 * Metadata about a building, populated from {@link BuildingData} at spawn time.
 *
 * Provides the building's static identity so systems can look up additional
 * config data without holding a reference to the full GameConfig.
 */
export interface BuildingComponent extends Component {
  readonly type: 'Building';
  /** Matches the `id` field in buildings/humans.json or buildings/orcs.json. */
  buildingId: string;
  /** Human-readable name for UI display. */
  displayName: string;
  /** Supply (population) this building adds to the player's cap. */
  populationProvided: number;
  /** Grid footprint string, e.g. '4x4'. */
  gridSize: string;
  /** Whether construction is fully complete. */
  isComplete: boolean;
}
export const BuildingType: ComponentType<BuildingComponent> =
  componentType<BuildingComponent>('Building');

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

/**
 * Metadata about a unit, populated from {@link UnitData} at spawn time.
 *
 * Provides static identity for UI and system lookups.
 */
export interface UnitComponent extends Component {
  readonly type: 'Unit';
  /** Matches the `id` field in units/humans.json or units/orcs.json. */
  unitId: string;
  /** Human-readable name for UI display. */
  displayName: string;
  /** Tier (1–3) of this unit. */
  tier: number;
  /** Supply cost this unit contributes to the player's usage. */
  supplyCost: number;
  /** Whether this unit can construct buildings. */
  isWorker: boolean;
}
export const UnitType: ComponentType<UnitComponent> = componentType<UnitComponent>('Unit');

// ---------------------------------------------------------------------------
// Selection State
// ---------------------------------------------------------------------------

/**
 * Marks an entity as selectable by the player. Required for SelectionManager
 * to include this entity in click and marquee selections.
 *
 * Add to every unit and building at spawn time.
 */
export interface SelectableComponent extends Component {
  readonly type: 'Selectable';
  /** True while the entity is part of the active player selection. */
  selected: boolean;
}
export const SelectableType: ComponentType<SelectableComponent> =
  componentType<SelectableComponent>('Selectable');

/**
 * Holds the Three.js selection ring mesh attached to a selectable entity.
 *
 * The ring mesh visibility is toggled directly by {@link SelectionManager}
 * for immediate per-frame feedback, separate from the main render pass.
 */
export interface SelectionRingComponent extends Component {
  readonly type: 'SelectionRing';
  /** The Three.js Mesh used as the visual selection indicator. */
  mesh: import('three').Mesh;
}
export const SelectionRingType: ComponentType<SelectionRingComponent> =
  componentType<SelectionRingComponent>('SelectionRing');

// ---------------------------------------------------------------------------
// UI Convenience Components
// ---------------------------------------------------------------------------

/**
 * Faction tag component for UI queries. Duplicates the faction field from
 * {@link OwnerComponent} as a separate component so UI systems can query
 * faction membership without pulling in ownership data.
 */
export interface FactionComponent extends Component {
  readonly type: 'FactionTag';
  faction: string;
}
export const FactionType: ComponentType<FactionComponent> =
  componentType<FactionComponent>('FactionTag');

/**
 * Worker role tag. Present on units that can construct buildings and harvest
 * resources. Used by UI to display the WORKER badge in the selection panel.
 */
export interface WorkerComponent extends Component {
  readonly type: 'Worker';
}
export const WorkerType: ComponentType<WorkerComponent> = componentType<WorkerComponent>('Worker');

/**
 * UI-facing combat and movement values shown in the selection panel.
 *
 * These values are copied from config-derived gameplay data at spawn time so
 * HUD rendering can avoid repeated config lookups.
 */
export interface DisplayStatsComponent extends Component {
  readonly type: 'DisplayStats';
  armor: number;
  damage: number;
  range: number;
  sight: number;
  speed: number;
}
export const DisplayStatsType: ComponentType<DisplayStatsComponent> =
  componentType<DisplayStatsComponent>('DisplayStats');

// ---------------------------------------------------------------------------
// Technology Research
// ---------------------------------------------------------------------------

/**
 * Tracks HQ technology tier research state for a faction's headquarters entity.
 *
 * Present on Keep / HQ building entities only. {@link TechTreeSystem} drives all
 * state transitions: idle → researching → tier-complete.
 *
 * Tier semantics:
 * - 1 = base (starting state, no research needed)
 * - 2 = after HQ Upgrade I completes (45-second research)
 * - 3 = after HQ Upgrade II completes (60-second research)
 *
 * Implements: design/gdd/tech-tree.md — TechComponent section
 */
export interface TechComponent extends Component {
  readonly type: 'Tech';
  /** Current technology tier. 1 = base, 2 = after Upgrade I, 3 = after Upgrade II. */
  currentTier: number;
  /** True while a research job is actively in progress. */
  researching: boolean;
  /** Seconds elapsed toward the current research target (reset to 0 on tier completion). */
  researchProgress: number;
  /** Seconds required to complete the current research (45 for T2, 60 for T3). */
  researchTarget: number;
  /** Cost of the queued research, stored so it can be refunded on cancellation. */
  researchCost: { gold: number; wood: number };
}
export const TechType: ComponentType<TechComponent> = componentType<TechComponent>('Tech');

// ---------------------------------------------------------------------------
// Rendering Bridge
// ---------------------------------------------------------------------------

/**
 * Links an entity to its Three.js scene object key in {@link SceneManager}.
 *
 * SceneManager keys follow the pattern `"unit-<entityId>"` or
 * `"building-<entityId>"`. This component lets rendering systems translate
 * entity IDs to scene keys without string manipulation each frame.
 */
export interface RenderableComponent extends Component {
  readonly type: 'Renderable';
  /** The key passed to SceneManager.addObject / getObject. */
  sceneKey: string;
  /** Whether the mesh is currently visible in the scene. */
  visible: boolean;
}
export const RenderableType: ComponentType<RenderableComponent> =
  componentType<RenderableComponent>('Renderable');

// ---------------------------------------------------------------------------
// Faction Ability Components — SpellCaster, AuraSource, BloodRush, Buffs
// ---------------------------------------------------------------------------

/**
 * A single active buff applied to a unit.
 *
 * Stored inside {@link BuffsComponent}.buffList. Systems should iterate this
 * array each tick and decrement `remainingDuration` by delta time.
 *
 * @remarks
 * TECH-DEBT: BuffEntry objects are allocated per-application. A pool should be
 * introduced when profiling shows buff churn is significant (TD-002).
 */
export interface BuffEntry {
  /** Unique buff identifier matching a spell or aura effect id. */
  readonly buffId: string;
  /** Entity that applied this buff (spell caster or aura source). */
  readonly sourceEntity: EntityId;
  /** Seconds remaining until the buff expires. Decremented by BuffSystem. */
  remainingDuration: number;
  /** Numeric magnitude; interpretation is buff-type-specific (e.g. armor bonus, damage %). */
  readonly magnitude: number;
  /**
   * Optional flat armor bonus granted by this buff (e.g. protective_chant, discipline_aura).
   * When present, ArmorComponent.bonusArmor is incremented on application and decremented
   * on expiry. Absent on buffs that do not affect armor.
   */
  readonly armorBonus?: number;
  /**
   * Optional attack-speed bonus as a fraction granted by this buff (e.g. discipline_aura).
   * Interpretation: attacker's effective attack-speed is multiplied by (1 + attackSpeedBonus).
   * Absent on buffs that do not affect attack speed.
   */
  readonly attackSpeedBonus?: number;
  /**
   * Optional Blood Rush bonus-increase stacked by this buff (e.g. blood_surge).
   * Applied to BloodRushComponent.bonusIncrease on buff application; reversed on expiry.
   * Absent on buffs that do not interact with the Blood Rush mechanic.
   */
  readonly bloodRushBonus?: number;
}

/**
 * Tracks all active timed buffs on a unit.
 *
 * Populated by SpellSystem and AuraSystem. {@link BuffSystem} iterates
 * `buffList` every tick, decrements durations, and removes expired entries.
 * Emits {@link GameEvents.BUFF_EXPIRED} on expiry.
 *
 * The component is added by {@link UnitFactory} to every unit that belongs to
 * a faction with spell or aura mechanics so that BuffSystem never needs a
 * null-check during its hot loop.
 */
export interface BuffsComponent extends Component {
  readonly type: 'Buffs';
  /** Mutable list of currently active buffs. May be empty; never null. */
  buffList: BuffEntry[];
}
export const BuffsType: ComponentType<BuffsComponent> = componentType<BuffsComponent>('Buffs');

/**
 * Marks a unit as a spell caster and tracks per-spell cooldown state.
 *
 * Present on human clerics and orc shamans. The `spellIds` list is populated
 * from `assets/data/factions/spells.json` at spawn time (keyed by faction +
 * caster type).
 *
 * Cooldown lookup:
 *   const remaining = component.cooldowns.get(spellId) ?? 0;
 * Absent keys mean the spell is ready; callers MUST use `?? 0` for absent keys.
 *
 * @example
 * // Check if 'heal' is off cooldown
 * const cd = caster.cooldowns.get('heal') ?? 0;
 * if (cd <= 0) { ... castHeal(); ... }
 */
export interface SpellCasterComponent extends Component {
  readonly type: 'SpellCaster';
  /** Ordered list of spell IDs this unit can cast. Sourced from spells.json. */
  spellIds: string[];
  /**
   * Per-spell remaining cooldown in seconds (counts down each frame).
   * Absent key = spell is ready. Callers should use `?? 0` for absent keys
   * to avoid undefined comparisons.
   */
  cooldowns: Map<string, number>;
}
export const SpellCasterType: ComponentType<SpellCasterComponent> =
  componentType<SpellCasterComponent>('SpellCaster');

/**
 * Marks a unit as an aura emitter (e.g. human captain, orc warlord).
 *
 * {@link AuraSystem} queries all entities with this component each tick and
 * applies the appropriate stat bonus to allies within `radius`. The tick
 * frequency is driven by `updateFrequency` from `discipline-aura.json`.
 *
 * `auraId` is inferred from the unit's faction string (e.g. "human" →
 * "discipline_aura", "orc" → "warlord_aura"). Full schema promotion deferred
 * to a future sprint when aura data is richer.
 */
export interface AuraSourceComponent extends Component {
  readonly type: 'AuraSource';
  /**
   * Logical aura identifier used by AuraSystem to look up the aura config.
   * Inferred from faction at spawn time (e.g. "discipline_aura").
   */
  auraId: string;
  /** Aura effect radius in world units. Sourced from discipline-aura.json. */
  radius: number;
  /**
   * Seconds since the last aura pulse. AuraSystem resets this to 0 each pulse.
   * Pulse interval is controlled by config (discipline-aura.json updateFrequency),
   * not a literal constant.
   */
  updateTimer: number;
}
export const AuraSourceType: ComponentType<AuraSourceComponent> =
  componentType<AuraSourceComponent>('AuraSource');

/**
 * Enables the Blood Rush mechanic on orc combat units.
 *
 * Blood Rush grants bonus attack speed when the unit's HP falls below
 * `hpThreshold` (fraction of max HP, sourced from blood-rush.json). A bonus
 * increase may also be applied temporarily by the shaman's Blood Surge spell.
 *
 * Units whose `UnitComponent.unitId` is present in `blood-rush.json`
 * `excludeTypes` do NOT receive this component at spawn time. The exclusion
 * list is the single source of truth — no duplicate checks in factory code.
 */
export interface BloodRushComponent extends Component {
  readonly type: 'BloodRush';
  /**
   * HP fraction threshold below which Blood Rush activates (e.g. 0.20 = 20%).
   * Sourced from blood-rush.json hpThreshold.
   */
  hpThreshold: number;
  /**
   * Maximum attack speed bonus as a fraction (e.g. 0.30 = +30%).
   * Sourced from blood-rush.json maxBonus.
   */
  maxBonus: number;
  /**
   * Temporary bonus increase stacked on top of maxBonus (e.g. from Blood Surge).
   * Added by SpellSystem; reset to 0 when the buff expires.
   */
  bonusIncrease: number;
  /**
   * Frame-computed effective attack-speed bonus for this unit.
   *
   * Written every frame by {@link BloodRushSystem} based on current HP fraction,
   * maxBonus, and bonusIncrease. CombatStatsSystem (or AttackSystem) reads this
   * value when computing the effective attack interval; it never reads maxBonus
   * directly. Zero when Blood Rush is inactive (HP >= hpThreshold).
   */
  currentBonus: number;
}
export const BloodRushType: ComponentType<BloodRushComponent> =
  componentType<BloodRushComponent>('BloodRush');
