/**
 * BuildingFactory — creates fully-composed building entities from config data.
 *
 * @module buildings/BuildingFactory
 */

import * as THREE from 'three';
import type { World } from '../ecs/World';
import type { GameConfig, BuildingData } from '../config/ConfigLoader';
import type { SceneManager } from '../rendering/SceneManager';
import type { MeshFactory } from '../rendering/MeshFactory';
import type { HpBarSystem } from '../rendering/HpBarSystem';
import type { PlayerId, EntityId } from '../types';
import { AttackType, ArmorType, Faction } from '../types';
import {
  createFactionIndex,
  createPlayerConfigIndex,
  requirePlayerConfig,
  type PlayerConfig,
} from '../players/PlayerConfig';
import {
  PositionType,
  HealthType,
  ArmorType_,
  AliveType,
  OwnerType,
  RenderableType,
  BuildingType,
  ConstructionType,
  TrainingQueueType,
  CombatStatsType,
  SelectableType,
  SelectionRingType,
  DisplayStatsType,
} from '../ecs/components/GameComponents';

const DEFAULT_STRUCTURE_SIGHT = 8;

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

function toAttackType(s: string): AttackType {
  const map: Record<string, AttackType> = {
    normal: AttackType.Normal, pierce: AttackType.Pierce,
    siege: AttackType.Siege, magic: AttackType.Magic,
  };
  return map[s] ?? AttackType.Normal;
}

function toArmorType(s: string): ArmorType {
  const map: Record<string, ArmorType> = {
    light: ArmorType.Light, medium: ArmorType.Medium,
    heavy: ArmorType.Heavy, fortified: ArmorType.Fortified,
  };
  return map[s] ?? ArmorType.Fortified;
}

/** Parse grid size string like "4x4" into a number. */
function parseGridSize(s: string): number {
  const parts = s.split('x');
  return parseInt(parts[0], 10) || 3;
}

export class BuildingFactory {
  private buildingLookup: Map<string, BuildingData> = new Map();
  private readonly playerConfigs: Map<string, PlayerConfig>;
  private readonly factionBuildings: Map<
    string,
    GameConfig['humanBuildings'] | GameConfig['orcBuildings']
  >;

  constructor(
    private world: World,
    private config: GameConfig,
    private sceneManager: SceneManager,
    private meshFactory: MeshFactory,
    private hpBarSystem: HpBarSystem,
  ) {
    this.playerConfigs = createPlayerConfigIndex(config);
    this.factionBuildings = createFactionIndex([config.humanBuildings, config.orcBuildings]);

    for (const player of this.playerConfigs.values()) {
      const factionBuildings = this.factionBuildings.get(player.faction);
      if (factionBuildings === undefined) {
        throw new Error(`Missing building config for faction: ${player.faction}`);
      }

      for (const building of factionBuildings.buildings) {
        this.buildingLookup.set(`${player.id}:${building.id}`, building);
      }
    }
  }

  /** Look up a building definition by player slot and building id. */
  getBuildingDef(buildingId: string, playerId: PlayerId): BuildingData | undefined {
    return this.buildingLookup.get(`${playerId}:${buildingId}`);
  }

  /**
   * Create a building entity at the given world position.
   *
   * @param constructed If true, building starts fully built. If false, requires construction.
   * @param builderId Entity ID of the worker constructing (0 if pre-built).
   */
  createBuilding(
    buildingId: string,
    playerId: PlayerId,
    x: number,
    z: number,
    constructed = false,
    builderId: EntityId = 0,
  ): EntityId {
    const player = requirePlayerConfig(this.playerConfigs, playerId);
    const def = this.buildingLookup.get(`${player.id}:${buildingId}`);
    if (!def) {
      throw new Error(`Unknown building: ${player.id}:${buildingId}`);
    }

    const id = this.world.createEntity();
    const size = parseGridSize(def.gridSize);

    // Position (center of footprint)
    this.world.addComponent(id, PositionType, { x, z });

    // Health — 1 HP if under construction, full if pre-built
    this.world.addComponent(id, HealthType, {
      current: constructed ? def.hp : 1,
      max: def.hp,
    });

    // Armor
    this.world.addComponent(id, ArmorType_, {
      armorType: toArmorType(def.armorType),
      armorValue: def.armorValue,
      bonusArmor: 0,
      armorLevel: 0,
    });

    this.world.addComponent(id, DisplayStatsType, {
      armor: def.armorValue,
      damage: def.attack?.damage ?? 0,
      range: def.attack?.range ?? 0,
      sight: DEFAULT_STRUCTURE_SIGHT,
      speed: 0,
    });

    // Alive
    this.world.addComponent(id, AliveType, {});

    // Owner
    this.world.addComponent(id, OwnerType, {
      faction: toFaction(player.faction),
      playerId: player.id,
    });

    // Building metadata
    this.world.addComponent(id, BuildingType, {
      buildingId: def.id,
      displayName: def.name,
      populationProvided: def.populationProvided,
      gridSize: def.gridSize,
      isComplete: constructed,
    });

    // Construction progress (if not pre-built)
    if (!constructed) {
      this.world.addComponent(id, ConstructionType, {
        buildTime: def.buildTime,
        elapsed: 0,
        builderEntity: builderId,
      });
    }

    // Training queue (if building can train units)
    if (def.trains.length > 0) {
      this.world.addComponent(id, TrainingQueueType, {
        queue: [],
        progress: 0,
        currentBuildTime: 0,
      });
    }

    // Combat stats for towers
    if (def.canAttack && def.attack) {
      this.world.addComponent(id, CombatStatsType, {
        baseDamage: def.attack.damage,
        bonusDamage: 0,
        weaponLevel: 0,
        attackType: toAttackType(def.attack.attackType),
        attackRange: def.attack.range,
        attackCooldown: def.attack.cooldown,
        attackCooldownRemaining: 0,
      });
    }

    // Rendering
    const mesh = this.meshFactory.createBuildingMesh(toFaction(player.faction), def.id);
    mesh.position.set(x, 0, z);
    const sceneKey = `building-${id}`;
    // Stamp entityId so the raycaster can reverse-lookup entities from hit meshes.
    mesh.userData['entityId'] = id;
    this.sceneManager.addObject(sceneKey, mesh);

    this.world.addComponent(id, RenderableType, {
      sceneKey,
      visible: true,
    });

    // Selection state — required by SelectionManager
    this.world.addComponent(id, SelectableType, { selected: false });

    // Selection ring — a flat torus at ground level, hidden by default
    const ringRadius = size * 0.65;
    const ringGeo = new THREE.TorusGeometry(ringRadius, 0.07, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x3df2c0 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(x, 0.05, z);
    ringMesh.visible = false;
    this.sceneManager.addObject(`building-ring-${id}`, ringMesh);

    this.world.addComponent(id, SelectionRingType, { mesh: ringMesh });

    // HP bar
    this.hpBarSystem.registerBar(id);

    return id;
  }
}
