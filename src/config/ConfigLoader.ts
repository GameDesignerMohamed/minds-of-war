/**
 * ConfigLoader — loads and validates all game configuration from JSON data files.
 *
 * Aggregates every assets/data/ JSON file into a single typed {@link GameConfig}
 * object. Consumers receive one immutable snapshot at startup; there is no
 * hot-reload at runtime.
 *
 * Field names are derived verbatim from the JSON data files in assets/data/ to
 * keep the runtime and schema in sync. Any rename in a JSON file must be
 * reflected here.
 *
 * Loading strategy:
 * - Static ES `import()` calls bundle the JSON at build time (Vite / esbuild).
 * - `loadGameConfig` is an async wrapper that resolves all imports in parallel
 *   and assembles the final config object.
 *
 * Deviation note (approved):
 * - `EconomyConfig` is a nested object with `{ resources, startingLoadout }`.
 * - `GameConfig.startingLoadout` is ALSO present at the top level as a
 *   convenience alias, matching the design spec shorthand access pattern.
 */

// ---------------------------------------------------------------------------
// Shared sub-types
// ---------------------------------------------------------------------------

/** Gold / wood resource cost pair, used across units, buildings, and tech. */
export interface ResourceCost {
  gold: number;
  wood: number;
}

// ---------------------------------------------------------------------------
// Unit types
// ---------------------------------------------------------------------------

/** Full data row for a single trainable unit. */
export interface UnitData {
  id: string;
  name: string;
  tier: number;
  hp: number;
  baseDamage: number;
  /** Matches JSON literal: 'normal' | 'pierce' | 'siege' | 'magic' */
  attackType: string;
  /** Matches JSON literal: 'light' | 'medium' | 'heavy' | 'fortified' */
  armorType: string;
  armorValue: number;
  attackRange: number;
  attackCooldown: number;
  moveSpeed: number;
  sightRange: number;
  supplyCost: number;
  buildTime: number;
  cost: ResourceCost;
  trainedAt: string;
  isWorker: boolean;
  canAttack: boolean;
  abilities: string[];
  /** Present only on hero-tier units (captain / warlord). */
  aura?: boolean;
}

/** Top-level structure of units/humans.json and units/orcs.json. */
export interface FactionUnitsFile {
  /** Lowercase faction id: 'human' | 'orc' */
  faction: string;
  factionName: string;
  units: UnitData[];
}

// ---------------------------------------------------------------------------
// Building types
// ---------------------------------------------------------------------------

/** Optional attack data present on buildings that can attack (e.g. watch_tower). */
export interface BuildingAttack {
  damage: number;
  /** Matches JSON literal: 'normal' | 'pierce' | 'siege' | 'magic' */
  attackType: string;
  range: number;
  cooldown: number;
}

/** Full data row for a single constructable building. */
export interface BuildingData {
  id: string;
  name: string;
  hp: number;
  /** Matches JSON literal: 'light' | 'medium' | 'heavy' | 'fortified' */
  armorType: string;
  armorValue: number;
  cost: ResourceCost;
  buildTime: number;
  populationProvided: number;
  /** Grid footprint string, e.g. '4x4', '3x3', '2x2'. */
  gridSize: string;
  trains: string[];
  canAttack: boolean;
  attack?: BuildingAttack;
}

/** Top-level structure of buildings/humans.json and buildings/orcs.json. */
export interface FactionBuildingsFile {
  faction: string;
  factionName: string;
  buildings: BuildingData[];
}

// ---------------------------------------------------------------------------
// Economy types
// ---------------------------------------------------------------------------

/** Structure of economy/resources.json — resource node properties. */
export interface ResourcesData {
  goldMine: {
    capacity: number;
    workerCarry: number;
    mineTime: number;
    maxEffectiveWorkers: number;
  };
  tree: {
    capacity: number;
    workerCarry: number;
    chopTime: number;
  };
  dropOffTime: number;
}

/** Structure of economy/starting-loadout.json — initial player state. */
export interface StartingLoadoutData {
  gold: number;
  wood: number;
  workers: number;
  initialSupply: number;
  maxSupplyCap: number;
  supplyPerFarm: number;
}

/** Nested economy config combining both economy data files. */
export interface EconomyConfig {
  resources: ResourcesData;
  startingLoadout: StartingLoadoutData;
}

// ---------------------------------------------------------------------------
// Combat types
// ---------------------------------------------------------------------------

/**
 * Type-safe representation of the damage matrix.
 * Outer key: attackType ('normal' | 'pierce' | 'siege' | 'magic')
 * Inner key: armorType  ('light' | 'medium' | 'heavy' | 'fortified')
 */
export type DamageMatrix = Record<string, Record<string, number>>;

/** Structure of combat/damage-matrix.json. */
export interface CombatConfig {
  armorReductionFactor: number;
  minimumDamage: number;
  matrix: DamageMatrix;
}

// ---------------------------------------------------------------------------
// Tech tree types
// ---------------------------------------------------------------------------

/** Per-faction content unlocked by a tier upgrade. */
export interface TechUnlockFaction {
  units: string[];
  buildings: string[];
}

/** A single tier-upgrade entry from tech/tech-tree.json. */
export interface TechUpgrade {
  id: string;
  name: string;
  tier: number;
  cost: ResourceCost;
  researchTime: number;
  researchedAt: string;
  requires?: string[];
  unlocks: {
    human: TechUnlockFaction;
    orc: TechUnlockFaction;
  };
}

/** Per-level cost entry used by weapon and armor upgrade tracks. */
export interface TechUpgradeLevelCost {
  gold: number;
  wood: number;
}

/** Shared structure for weapon and armor upgrade tracks. */
export interface TechUpgradeTrack {
  levels: number;
  costPerLevel: TechUpgradeLevelCost[];
  researchTimePerLevel: number[];
  researchedAt: string;
  /** Track-specific bonus per level (damage or armor). */
  damagePerLevel?: number;
  armorPerLevel?: number;
}

/** Top-level structure of tech/tech-tree.json. */
export interface TechTreeConfig {
  upgrades: TechUpgrade[];
  weaponUpgrades: TechUpgradeTrack;
  armorUpgrades: TechUpgradeTrack;
}

// ---------------------------------------------------------------------------
// Faction ability types
// ---------------------------------------------------------------------------

/** Structure of factions/blood-rush.json — orc passive rage mechanic. */
export interface BloodRushConfig {
  maxBonus: number;
  hpThreshold: number;
  excludeTypes: string[];
  warlordAura: {
    radius: number;
    additionalMaxBonus: number;
  };
}

/** Structure of factions/discipline-aura.json — human captain aura. */
export interface DisciplineAuraConfig {
  radius: number;
  updateFrequency: number;
  maxAuraAllies: number;
  maxAttackSpeedBonus: number;
  maxArmorBonus: number;
  sources: string[];
  knightEligibleAfter: string;
}

// ---------------------------------------------------------------------------
// Spell types
// ---------------------------------------------------------------------------

/** Effect block inside a spell definition. */
export interface SpellEffect {
  type: string;
  amount?: number;
  duration?: number;
  damage?: number;
  bounces?: number;
  bounceRadius?: number;
  bonusIncrease?: number;
}

/** A single spell definition from factions/spells.json. */
export interface SpellData {
  id: string;
  name: string;
  faction: string;
  caster: string;
  /** Targeting category: 'friendly_unit' | 'enemy_unit' */
  targetType: string;
  range: number;
  cooldown: number;
  effect: SpellEffect;
}

/** Top-level structure of factions/spells.json. */
export interface SpellsConfig {
  spells: SpellData[];
}

/** Grouped faction-ability config consumed by spawning and ability systems. */
export interface FactionAbilityConfig {
  bloodRush: BloodRushConfig;
  disciplineAura: DisciplineAuraConfig;
  spells: SpellsConfig;
}

// ---------------------------------------------------------------------------
// AI types
// ---------------------------------------------------------------------------

/** Phase-specific AI tuning knobs. */
export interface AiEcoPhase {
  targetGoldWorkers: number;
  targetWoodWorkers: number;
  minWorkers: number;
}

export interface AiBuildPhase {
  firstBuilding: string;
  supplyBuilding: string;
  upgradeGoldThreshold: number;
}

export interface AiArmyPhase {
  meleeToRangedRatio: number;
  attackSupplyThreshold: number;
}

export interface AiAttackPhase {
  retreatSupplyThreshold: number;
}

export interface AiDefenseOverride {
  triggerOnBuildingAttacked: boolean;
}

/** A single AI difficulty profile. */
export interface AIBehaviorProfile {
  ecoPhase: AiEcoPhase;
  buildPhase: AiBuildPhase;
  armyPhase: AiArmyPhase;
  attackPhase: AiAttackPhase;
  defenseOverride: AiDefenseOverride;
}

/** Backward-compatible alias for older imports. */
export type AiProfile = AIBehaviorProfile;

/** Top-level structure of ai/behavior.json — keyed by difficulty label. */
export interface AiBehaviorConfig {
  normal: AIBehaviorProfile;
  [difficulty: string]: AIBehaviorProfile;
}

// ---------------------------------------------------------------------------
// Map types
// ---------------------------------------------------------------------------

/** 2D grid position used within map data files. */
export interface MapPosition {
  x: number;
  z: number;
}

/** A gold mine placement entry from the map file. */
export interface GoldMineEntry {
  x: number;
  z: number;
  capacity: number;
  owner: string;
}

/** A tree line (forest strip) placement entry from the map file. */
export interface TreeLineEntry {
  start: MapPosition;
  end: MapPosition;
  treesPerTile: number;
}

/** An axis-aligned cliff rectangle from the map terrain section. */
export interface CliffRect {
  rect: {
    x: number;
    z: number;
    w: number;
    h: number;
  };
}

/** Atlas frame coordinates inside a terrain tileset image. */
export interface TerrainAtlasFrame {
  col: number;
  row: number;
}

/** Variant set for a single terrain family within the atlas. */
export interface TerrainAtlasTileSet {
  variants: TerrainAtlasFrame[];
  randomRotation?: boolean;
}

/** Tileset atlas metadata used by textured terrain rendering. */
export interface TerrainAtlasConfig {
  image: string;
  columns: number;
  rows: number;
  tiles: Record<string, TerrainAtlasTileSet>;
}

/** Terrain section of a map file. */
export interface MapTerrain {
  /** Terrain type name for cells not covered by a specific override. */
  default: string;
  atlas?: TerrainAtlasConfig;
  cliffs: CliffRect[];
}

/** Top-level structure of a map JSON file (e.g. maps/skirmish-96x96.json). */
export interface MapConfig {
  name: string;
  gridSize: number;
  tileSize: number;
  startingPositions: Record<string, MapPosition & { corner: string }>;
  goldMines: GoldMineEntry[];
  treeLines: TreeLineEntry[];
  terrain: MapTerrain;
}

// ---------------------------------------------------------------------------
// Aggregated GameConfig
// ---------------------------------------------------------------------------

/**
 * The fully loaded, read-only game configuration object.
 *
 * Produced by {@link loadGameConfig} and passed to all systems at startup.
 * Never mutate this object at runtime; treat it as a frozen value.
 */
export interface GameConfig {
  /** Human units definition (from assets/data/units/humans.json). */
  humanUnits: FactionUnitsFile;
  /** Orc units definition (from assets/data/units/orcs.json). */
  orcUnits: FactionUnitsFile;
  /** Human buildings definition (from assets/data/buildings/humans.json). */
  humanBuildings: FactionBuildingsFile;
  /** Orc buildings definition (from assets/data/buildings/orcs.json). */
  orcBuildings: FactionBuildingsFile;
  /** Nested economy config: resources + starting loadout. */
  economy: EconomyConfig;
  /**
   * Convenience alias for `economy.startingLoadout`.
   *
   * Approved deviation from strict nesting: spec access patterns reference
   * `config.startingLoadout` directly, so this shorthand is provided alongside
   * the nested path.
   */
  startingLoadout: StartingLoadoutData;
  /** Damage matrix and armor reduction formula constants. */
  combat: CombatConfig;
  /** Tech tree tier upgrades and weapon/armor tracks. */
  techTree: TechTreeConfig;
  /** Orc blood-rush passive mechanic parameters. */
  bloodRush: BloodRushConfig;
  /** Human discipline aura mechanic parameters. */
  disciplineAura: DisciplineAuraConfig;
  /** All spell definitions for both factions. */
  spells: SpellsConfig;
  /** Convenience grouped access for all faction-ability configs. */
  factionAbilities: FactionAbilityConfig;
  /** AI behaviour profiles keyed by difficulty label. */
  aiBehavior: AiBehaviorConfig;
  /** The loaded map configuration (one map per game session). */
  map: MapConfig;
}

interface JsonModule<T> {
  default: T;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/**
 * Loads all game configuration JSON files in parallel and assembles them into
 * a single {@link GameConfig} object.
 *
 * Uses dynamic `import()` so bundlers (Vite / esbuild) can inline the JSON at
 * build time. The async signature is kept even when bundled to allow future
 * switch to network fetch without changing call sites.
 *
 * @param mapPath - Module path to the map JSON to load for this session.
 *   Defaults to the skirmish map. Pass a different path to load a custom map.
 *
 * @example
 * const config = await loadGameConfig();
 * console.log(config.startingLoadout.gold); // 500
 * console.log(config.economy.resources.goldMine.capacity); // 5000
 */
export async function loadGameConfig(
  mapPath = '../../assets/data/maps/skirmish-96x96.json',
): Promise<GameConfig> {
  const [
    humanUnitsModule,
    orcUnitsModule,
    humanBuildingsModule,
    orcBuildingsModule,
    resourcesModule,
    startingLoadoutModule,
    combatModule,
    techTreeModule,
    bloodRushModule,
    disciplineAuraModule,
    spellsModule,
    aiBehaviorModule,
    mapModule,
  ] = await Promise.all([
    import('../../assets/data/units/humans.json'),
    import('../../assets/data/units/orcs.json'),
    import('../../assets/data/buildings/humans.json'),
    import('../../assets/data/buildings/orcs.json'),
    import('../../assets/data/economy/resources.json'),
    import('../../assets/data/economy/starting-loadout.json'),
    import('../../assets/data/combat/damage-matrix.json'),
    import('../../assets/data/tech/tech-tree.json'),
    import('../../assets/data/factions/blood-rush.json'),
    import('../../assets/data/factions/discipline-aura.json'),
    import('../../assets/data/factions/spells.json'),
    import('../../assets/data/ai/behavior.json'),
    import(/* @vite-ignore */ mapPath) as Promise<JsonModule<MapConfig>>,
  ]);

  const economy: EconomyConfig = {
    resources: resourcesModule.default,
    startingLoadout: startingLoadoutModule.default,
  };
  const factionAbilities: FactionAbilityConfig = {
    bloodRush: bloodRushModule.default,
    disciplineAura: disciplineAuraModule.default,
    spells: spellsModule.default,
  };

  return {
    humanUnits: humanUnitsModule.default,
    orcUnits: orcUnitsModule.default,
    humanBuildings: humanBuildingsModule.default,
    orcBuildings: orcBuildingsModule.default,
    economy,
    startingLoadout: economy.startingLoadout,
    combat: combatModule.default,
    techTree: techTreeModule.default,
    bloodRush: factionAbilities.bloodRush,
    disciplineAura: factionAbilities.disciplineAura,
    spells: factionAbilities.spells,
    factionAbilities,
    aiBehavior: aiBehaviorModule.default,
    map: mapModule.default,
  };
}
