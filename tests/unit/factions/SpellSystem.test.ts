import { describe, expect, it, vi } from 'vitest';
import { SpellSystem } from '@/factions/SpellSystem';
import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import { World } from '@/ecs/World';
import {
  AliveType,
  ArmorType_,
  BuffsType,
  HealthType,
  OwnerType,
  PositionType,
  SpellCasterType,
} from '@/ecs/components/GameComponents';
import type { SpellsConfig } from '@/config/ConfigLoader';
import { ArmorType, Faction } from '@/types';

const spellsConfig: SpellsConfig = {
  spells: [
    {
      id: 'chain_flame',
      name: 'Chain Flame',
      faction: 'orc',
      caster: 'shaman',
      targetType: 'enemy_unit',
      range: 7,
      cooldown: 12,
      effect: {
        type: 'chain_damage',
        damage: 40,
        bounces: 1,
        bounceRadius: 3,
      },
    },
    {
      id: 'protective_chant',
      name: 'Protective Chant',
      faction: 'human',
      caster: 'cleric',
      targetType: 'friendly_unit',
      range: 7,
      cooldown: 10,
      effect: {
        type: 'buff_armor',
        amount: 2,
        duration: 8,
      },
    },
  ],
};

function createCaster(world: World, playerId: 'human' | 'orc', x = 0, z = 0): number {
  const entityId = world.createEntity();
  world.addComponent(entityId, AliveType, {});
  world.addComponent(entityId, PositionType, { x, z });
  world.addComponent(entityId, OwnerType, {
    faction: playerId === 'human' ? Faction.Human : Faction.Orc,
    playerId,
  });
  world.addComponent(entityId, SpellCasterType, {
    spellIds: [],
    cooldowns: new Map(),
  });
  return entityId;
}

function createTarget(world: World, playerId: 'human' | 'orc', x: number, z: number): number {
  const entityId = world.createEntity();
  world.addComponent(entityId, AliveType, {});
  world.addComponent(entityId, PositionType, { x, z });
  world.addComponent(entityId, OwnerType, {
    faction: playerId === 'human' ? Faction.Human : Faction.Orc,
    playerId,
  });
  world.addComponent(entityId, HealthType, { current: 100, max: 100 });
  world.addComponent(entityId, BuffsType, { buffList: [] });
  world.addComponent(entityId, ArmorType_, {
    armorType: ArmorType.Light,
    armorValue: 1,
    bonusArmor: 0,
    armorLevel: 0,
  });
  return entityId;
}

describe('SpellSystem', () => {
  it('casts chain damage, bounces to the nearest enemy, and starts cooldown', () => {
    const world = new World();
    const caster = createCaster(world, 'orc', 0, 0);
    const primaryTarget = createTarget(world, 'human', 2, 0);
    const bounceTarget = createTarget(world, 'human', 4, 0);
    const farTarget = createTarget(world, 'human', 20, 0);

    const bus = new EventBus<GameEvents>();
    const spellCast = vi.fn();
    bus.on('SPELL_CAST', spellCast);

    const system = new SpellSystem(spellsConfig, bus);
    system.init(world);

    expect(system.castSpell(caster, 'chain_flame', primaryTarget)).toBe(true);

    expect(world.getComponent(primaryTarget, HealthType)?.current).toBe(60);
    expect(world.getComponent(bounceTarget, HealthType)?.current).toBe(60);
    expect(world.getComponent(farTarget, HealthType)?.current).toBe(100);
    expect(world.getComponent(caster, SpellCasterType)?.cooldowns.get('chain_flame')).toBe(12);
    expect(spellCast).toHaveBeenCalledWith({
      casterEntity: caster,
      spellId: 'chain_flame',
      targetEntity: primaryTarget,
    });
  });

  it('refreshes armor buff duration without stacking armor twice', () => {
    const world = new World();
    const caster = createCaster(world, 'human', 0, 0);
    const target = createTarget(world, 'human', 1, 0);
    const bus = new EventBus<GameEvents>();
    const buffApplied = vi.fn();
    bus.on('BUFF_APPLIED', buffApplied);

    const system = new SpellSystem(spellsConfig, bus);
    system.init(world);

    expect(system.castSpell(caster, 'protective_chant', target)).toBe(true);
    expect(world.getComponent(target, ArmorType_)?.bonusArmor).toBe(2);
    expect(world.getComponent(target, BuffsType)?.buffList).toHaveLength(1);

    system.update(10);

    const buffList = world.getComponent(target, BuffsType)?.buffList;
    if (buffList === undefined || buffList.length === 0) {
      throw new Error('Expected a buff entry to exist after the first cast');
    }
    buffList[0].remainingDuration = 1;

    expect(system.castSpell(caster, 'protective_chant', target)).toBe(true);

    expect(world.getComponent(target, ArmorType_)?.bonusArmor).toBe(2);
    expect(world.getComponent(target, BuffsType)?.buffList).toHaveLength(1);
    expect(world.getComponent(target, BuffsType)?.buffList[0]?.remainingDuration).toBe(8);
    expect(buffApplied).toHaveBeenCalledTimes(1);
  });
});
