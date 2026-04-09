/**
 * UnitFactory — creates fully-composed unit entities from config data.
 *
 * Reads unit definitions from GameConfig, creates an entity in the World,
 * attaches all required components, creates the visual mesh, and registers
 * the HP bar.
 *
 * @module units/UnitFactory
 */

import * as THREE from 'three';
import type { World } from '../ecs/World';
import type { FactionAbilityConfig, GameConfig, UnitData } from '../config/ConfigLoader';
import type { SceneManager } from '../rendering/SceneManager';
import type { MeshFactory } from '../rendering/MeshFactory';
import type { HpBarSystem } from '../rendering/HpBarSystem';
import type { PlayerId, EntityId } from '../types';
import { Faction } from '../types';
import {
  createFactionIndex,
  createPlayerConfigIndex,
  requirePlayerConfig,
  type PlayerConfig,
} from '../players/PlayerConfig';
import { toAttackType, toArmorType } from '../utils/TypeMappers';
import {
  PositionType,
  HealthType,
  MovementType,
  CombatStatsType,
  ArmorType_,
  AliveType,
  OwnerType,
  RenderableType,
  UnitType,
  HarvesterType,
  WorkerType,
  SelectableType,
  SelectionRingType,
  SpellCasterType,
  AuraSourceType,
  BloodRushType,
  BuffsType,
  DisplayStatsType,
} from '../ecs/components/GameComponents';

/** Maps config faction ids to the runtime Faction enum used by rendering. */
function toFaction(factionId: string): Faction {
  switch (factionId) {
    case 'human':
      return Faction.Human;
    case 'orc':
      return Faction.Orc;
    default:
      throw new Error(`Unsupported faction: ${factionId}`);
  }
}

export class UnitFactory {
  private unitLookup: Map<string, UnitData> = new Map();
  private readonly playerConfigs: Map<string, PlayerConfig>;
  private readonly factionUnits: Map<string, GameConfig['humanUnits'] | GameConfig['orcUnits']>;

  constructor(
    private world: World,
    private config: GameConfig,
    private sceneManager: SceneManager,
    private meshFactory: MeshFactory,
    private hpBarSystem: HpBarSystem,
  ) {
    this.playerConfigs = createPlayerConfigIndex(config);
    this.factionUnits = createFactionIndex([config.humanUnits, config.orcUnits]);

    for (const player of this.playerConfigs.values()) {
      const factionUnits = this.factionUnits.get(player.faction);
      if (factionUnits === undefined) {
        throw new Error(`Missing unit config for faction: ${player.faction}`);
      }

      for (const unit of factionUnits.units) {
        this.unitLookup.set(`${player.id}:${unit.id}`, unit);
      }
    }
  }

  /** Look up a unit definition by player slot and unit id. */
  getUnitDef(unitId: string, playerId: PlayerId): UnitData | undefined {
    return this.unitLookup.get(`${playerId}:${unitId}`);
  }

  /**
   * Create a fully-composed unit entity at the given world position.
   *
   * @returns The entity ID of the newly created unit.
   */
  createUnit(unitId: string, playerId: PlayerId, x: number, z: number): EntityId {
    const player = requirePlayerConfig(this.playerConfigs, playerId);
    const def = this.unitLookup.get(`${player.id}:${unitId}`);
    if (!def) {
      throw new Error(`Unknown unit: ${player.id}:${unitId}`);
    }

    const id = this.world.createEntity();

    // Position
    this.world.addComponent(id, PositionType, { x, z });

    // Health
    this.world.addComponent(id, HealthType, { current: def.hp, max: def.hp });

    // Movement
    this.world.addComponent(id, MovementType, {
      targetX: undefined,
      targetZ: undefined,
      speed: def.moveSpeed,
      waypoints: [],
      waypointIndex: 0,
    });

    // Combat stats (if unit can attack)
    if (def.canAttack) {
      this.world.addComponent(id, CombatStatsType, {
        baseDamage: def.baseDamage,
        bonusDamage: 0,
        weaponLevel: 0,
        attackType: toAttackType(def.attackType),
        attackRange: def.attackRange,
        attackCooldown: def.attackCooldown,
        attackCooldownRemaining: 0,
      });
    }

    // Armor
    this.world.addComponent(id, ArmorType_, {
      armorType: toArmorType(def.armorType),
      armorValue: def.armorValue,
      bonusArmor: 0,
      armorLevel: 0,
    });

    this.world.addComponent(id, DisplayStatsType, {
      armor: def.armorValue,
      damage: def.canAttack ? def.baseDamage : 0,
      range: def.canAttack ? def.attackRange : 0,
      sight: def.sightRange,
      speed: def.moveSpeed,
    });

    // Alive tag
    this.world.addComponent(id, AliveType, {});

    // Owner
    this.world.addComponent(id, OwnerType, {
      faction: toFaction(player.faction),
      playerId: player.id,
    });

    // Unit metadata
    this.world.addComponent(id, UnitType, {
      unitId: def.id,
      displayName: def.name,
      tier: def.tier,
      supplyCost: def.supplyCost,
      isWorker: def.isWorker,
    });

    // Worker components
    if (def.isWorker) {
      this.world.addComponent(id, WorkerType, {});
      this.world.addComponent(id, HarvesterType, {
        state: 'idle',
        assignedResource: 0,
        assignedDropOff: 0,
        carryType: 'gold',
        carryAmount: 0,
        gatherTimer: 0,
      });
    }

    // Rendering — create mesh and add to scene
    const mesh = this.meshFactory.createUnitMesh(toFaction(player.faction), def.id);
    mesh.position.set(x, 0, z);
    const sceneKey = `unit-${id}`;
    // Stamp entityId so the raycaster can reverse-lookup entities from hit meshes.
    mesh.userData['entityId'] = id;
    this.sceneManager.addObject(sceneKey, mesh);

    this.world.addComponent(id, RenderableType, {
      sceneKey,
      visible: true,
    });

    // Selection state — required by SelectionManager
    this.world.addComponent(id, SelectableType, { selected: false });

    // Selection ring — a flat torus positioned at ground level, hidden by default
    const ringGeo = new THREE.TorusGeometry(0.55, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3df2c0 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(x, 0.05, z);
    ringMesh.visible = false;
    this.sceneManager.addObject(`unit-ring-${id}`, ringMesh);

    this.world.addComponent(id, SelectionRingType, { mesh: ringMesh });

    // Faction-specific ability components
    this.addFactionComponents(id, def, player);

    // HP bar
    this.hpBarSystem.registerBar(id);

    return id;
  }

  /**
   * Attach faction-specific ability components to a newly created unit entity.
   *
   * Encapsulates SpellCaster, AuraSource, BloodRush, and Buffs component
   * attachment so that {@link createUnit} stays within the 40-line limit.
   *
   * BloodRush exclusion is driven entirely by `config.bloodRush.excludeTypes`;
   * no secondary isWorker check is performed here.
   *
   * AuraId is inferred from the faction string for now. Promoting auraId into
   * UnitData is deferred to the sprint when aura data diversity warrants a
   * schema change.
   *
   * @param id - The entity to attach components to.
   * @param def - The unit definition from config.
   * @param player - The resolved player slot and faction mapping.
   */
  private addFactionComponents(
    id: EntityId,
    def: import('../config/ConfigLoader').UnitData,
    player: PlayerConfig,
  ): void {
    const factionAbilities: FactionAbilityConfig = this.config.factionAbilities;
    const { bloodRush: bloodRushCfg, disciplineAura: disciplineAuraCfg, spells: spellsCfg } =
      factionAbilities;

    // Every unit gets a Buffs component so BuffSystem never needs a null check.
    this.world.addComponent(id, BuffsType, { buffList: [] });

    // SpellCaster — human clerics and orc shamans only.
    const casterSpells = spellsCfg.spells.filter(
      (s) => s.faction === player.faction && s.caster === def.id,
    );
    if (casterSpells.length > 0) {
      this.world.addComponent(id, SpellCasterType, {
        spellIds: casterSpells.map((s) => s.id),
        cooldowns: new Map(),
      });
    }

    // AuraSource — units listed as sources in discipline-aura.json.
    if (disciplineAuraCfg.sources.includes(def.id)) {
      const auraId =
        player.faction === 'human'
          ? 'discipline_aura'
          : player.faction === 'orc'
            ? 'warlord_aura'
            : undefined;

      if (auraId !== undefined) {
        this.world.addComponent(id, AuraSourceType, {
          auraId,
          radius: disciplineAuraCfg.radius,
          updateTimer: 0,
        });
      }
    }

    // BloodRush — orc faction only, excluding types listed in blood-rush.json.
    if (player.faction === 'orc' && !bloodRushCfg.excludeTypes.includes(def.id)) {
      this.world.addComponent(id, BloodRushType, {
        hpThreshold: bloodRushCfg.hpThreshold,
        maxBonus: bloodRushCfg.maxBonus,
        bonusIncrease: 0,
        currentBonus: 0,
      });
    }
  }
}
