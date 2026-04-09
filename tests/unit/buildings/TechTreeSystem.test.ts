import { describe, expect, it } from 'vitest';
import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import { World } from '@/ecs/World';
import { Faction } from '@/types';
import { BuildingType, OwnerType, TechType } from '@/ecs/components/GameComponents';
import { TechTreeSystem, isFactionContentUnlocked } from '@/buildings/TechTreeSystem';
import type { TechTreeConfig } from '@/config/ConfigLoader';

const techConfig: TechTreeConfig = {
  upgrades: [
    {
      id: 'hq_upgrade_1',
      name: 'HQ Upgrade I',
      tier: 2,
      cost: { gold: 200, wood: 100 },
      researchTime: 45,
      researchedAt: 'keep',
      unlocks: {
        human: { units: ['knight', 'cleric'], buildings: ['sanctum', 'blacksmith'] },
        orc: { units: ['berserker', 'shaman'], buildings: ['spirit_lodge', 'war_forge'] },
      },
    },
    {
      id: 'hq_upgrade_2',
      name: 'HQ Upgrade II',
      tier: 3,
      cost: { gold: 400, wood: 200 },
      researchTime: 60,
      researchedAt: 'keep',
      unlocks: {
        human: { units: ['captain', 'catapult'], buildings: ['workshop'] },
        orc: { units: ['warlord', 'war_catapult'], buildings: ['siege_pit'] },
      },
    },
  ],
  weaponUpgrades: {
    levels: 3,
    damagePerLevel: 2,
    costPerLevel: [],
    researchTimePerLevel: [],
    researchedAt: 'blacksmith',
  },
  armorUpgrades: {
    levels: 3,
    armorPerLevel: 1,
    costPerLevel: [],
    researchTimePerLevel: [],
    researchedAt: 'blacksmith',
  },
};

function createHq(world: World, playerId: string, faction: Faction, currentTier: number): number {
  const entity = world.createEntity();
  world.addComponent(entity, BuildingType, {
    buildingId: faction === Faction.Human ? 'keep' : 'stronghold',
    displayName: 'HQ',
    populationProvided: 10,
    gridSize: '4x4',
    isComplete: true,
  });
  world.addComponent(entity, OwnerType, { playerId, faction });
  world.addComponent(entity, TechType, {
    currentTier,
    researching: false,
    researchProgress: 0,
    researchTarget: 0,
    researchCost: { gold: 0, wood: 0 },
  });
  return entity;
}

describe('TechTreeSystem', () => {
  it('treats content missing from unlock lists as base-tier available', () => {
    expect(isFactionContentUnlocked(techConfig, 'orc', 'units', 'grunt', 1)).toBe(true);
    expect(isFactionContentUnlocked(techConfig, 'human', 'buildings', 'barracks', 1)).toBe(true);
  });

  it('gates faction unlocks by the owning player tier', () => {
    const world = new World();
    const hqEntity = createHq(world, 'orc', Faction.Orc, 1);

    const system = new TechTreeSystem(new EventBus<GameEvents>(), techConfig);
    system.init(world);

    expect(system.canTrainUnit('orc', 'orc', 'berserker', 2)).toBe(false);
    expect(system.canConstructBuilding('orc', 'orc', 'spirit_lodge')).toBe(false);

    const tech = world.getComponent(hqEntity, TechType);
    if (tech === undefined) {
      throw new Error('Expected HQ tech component');
    }
    tech.currentTier = 2;

    expect(system.canTrainUnit('orc', 'orc', 'berserker', 2)).toBe(true);
    expect(system.canConstructBuilding('orc', 'orc', 'spirit_lodge')).toBe(true);
    expect(system.canConstructBuilding('orc', 'orc', 'siege_pit')).toBe(false);
  });
});
