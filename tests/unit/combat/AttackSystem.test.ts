import { describe, expect, it, vi } from 'vitest';
import { AttackSystem } from '@/combat/AttackSystem';
import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import { World } from '@/ecs/World';
import {
  AliveType,
  ArmorType_,
  AttackTargetType,
  BuildingType,
  CombatStatsType,
  HealthType,
  OwnerType,
  PositionType,
} from '@/ecs/components/GameComponents';
import type { CombatConfig } from '@/config/ConfigLoader';
import { ArmorType, AttackType, Faction } from '@/types';

const combatConfig: CombatConfig = {
  armorReductionFactor: 0.06,
  minimumDamage: 1,
  matrix: {
    normal: { light: 1, medium: 1, heavy: 0.75, fortified: 0.5 },
    pierce: { light: 1.5, medium: 1, heavy: 0.75, fortified: 0.35 },
    siege: { light: 0.5, medium: 0.75, heavy: 1, fortified: 1.75 },
    magic: { light: 1.25, medium: 1.25, heavy: 1, fortified: 0.75 },
  },
};

function createAttacker(world: World, targetEntity: number, damage = 25): number {
  const entityId = world.createEntity();
  world.addComponent(entityId, AliveType, {});
  world.addComponent(entityId, PositionType, { x: 0, z: 0 });
  world.addComponent(entityId, AttackTargetType, { targetEntity });
  world.addComponent(entityId, CombatStatsType, {
    baseDamage: damage,
    bonusDamage: 0,
    weaponLevel: 0,
    attackType: AttackType.Normal,
    attackRange: 2,
    attackCooldown: 1.5,
    attackCooldownRemaining: 0,
  });
  return entityId;
}

describe('AttackSystem', () => {
  it('applies damage, emits UNIT_ATTACKED, and resets cooldown on a valid attack', () => {
    const world = new World();
    const targetEntity = world.createEntity();
    world.addComponent(targetEntity, AliveType, {});
    world.addComponent(targetEntity, PositionType, { x: 1, z: 0 });
    world.addComponent(targetEntity, HealthType, { current: 60, max: 60 });
    world.addComponent(targetEntity, ArmorType_, {
      armorType: ArmorType.Light,
      armorValue: 0,
      bonusArmor: 0,
      armorLevel: 0,
    });

    const attackerEntity = createAttacker(world, targetEntity);
    const bus = new EventBus<GameEvents>();
    const attackedListener = vi.fn();
    bus.on('UNIT_ATTACKED', attackedListener);

    const system = new AttackSystem(bus, combatConfig);
    system.init(world);
    system.update(0.016);

    expect(world.getComponent(targetEntity, HealthType)?.current).toBe(35);
    expect(world.getComponent(attackerEntity, CombatStatsType)?.attackCooldownRemaining).toBe(1.5);
    expect(attackedListener).toHaveBeenCalledWith({
      attackerEntity,
      targetEntity,
      finalDamage: 25,
    });
  });

  it('removes a killed building from Alive and emits BUILDING_DESTROYED', () => {
    const world = new World();
    const buildingEntity = world.createEntity();
    world.addComponent(buildingEntity, AliveType, {});
    world.addComponent(buildingEntity, PositionType, { x: 1, z: 0 });
    world.addComponent(buildingEntity, HealthType, { current: 20, max: 20 });
    world.addComponent(buildingEntity, ArmorType_, {
      armorType: ArmorType.Light,
      armorValue: 0,
      bonusArmor: 0,
      armorLevel: 0,
    });
    world.addComponent(buildingEntity, BuildingType, {
      buildingId: 'stronghold',
      displayName: 'Stronghold',
      populationProvided: 10,
      gridSize: '4x4',
      isComplete: true,
    });
    world.addComponent(buildingEntity, OwnerType, {
      faction: Faction.Orc,
      playerId: 'orc',
    });

    const attackerEntity = createAttacker(world, buildingEntity, 30);
    const bus = new EventBus<GameEvents>();
    const buildingDestroyed = vi.fn();
    bus.on('BUILDING_DESTROYED', buildingDestroyed);

    const system = new AttackSystem(bus, combatConfig);
    system.init(world);
    system.update(0.016);

    expect(world.hasComponent(buildingEntity, AliveType)).toBe(false);
    expect(world.getComponent(buildingEntity, HealthType)?.current).toBe(0);
    expect(buildingDestroyed).toHaveBeenCalledWith({
      entityId: buildingEntity,
      buildingId: 'stronghold',
      faction: Faction.Orc,
      playerId: 'orc',
      destroyedByEntity: attackerEntity,
    });
  });
});
