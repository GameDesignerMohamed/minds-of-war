import { describe, expect, it, vi } from 'vitest';
import { TrainingQueueSystem } from '@/buildings/TrainingQueueSystem';
import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import { World } from '@/ecs/World';
import { Faction, type PlayerId } from '@/types';
import { OwnerType, PositionType, TrainingQueueType } from '@/ecs/components/GameComponents';
import type { UnitFactory } from '@/units/UnitFactory';
import type { GameConfig, UnitData } from '@/config/ConfigLoader';

function createQueuedBuilding(world: World, unitId: string, playerId: PlayerId = 'human'): number {
  const buildingEntity = world.createEntity();
  world.addComponent(buildingEntity, TrainingQueueType, {
    queue: [unitId],
    progress: 0,
    currentBuildTime: 0,
  });
  world.addComponent(buildingEntity, OwnerType, {
    faction: playerId === 'human' ? Faction.Human : Faction.Orc,
    playerId,
  });
  world.addComponent(buildingEntity, PositionType, { x: 10, z: 12 });
  return buildingEntity;
}

const footman: UnitData = {
  id: 'footman',
  name: 'Footman',
  tier: 1,
  hp: 100,
  baseDamage: 10,
  attackType: 'normal',
  armorType: 'heavy',
  armorValue: 1,
  attackRange: 1,
  attackCooldown: 1,
  moveSpeed: 2,
  sightRange: 5,
  supplyCost: 2,
  buildTime: 2,
  cost: { gold: 100, wood: 0 },
  trainedAt: 'barracks',
  isWorker: false,
  canAttack: true,
  abilities: [],
};

describe('TrainingQueueSystem', () => {
  it('spawns the trained unit, resets queue progress, and emits UNIT_TRAINED', () => {
    const world = new World();
    const buildingEntity = createQueuedBuilding(world, 'footman');
    const queue = world.getComponent(buildingEntity, TrainingQueueType);
    const createUnit = vi.fn(() => 99);
    const unitFactory = {
      getUnitDef: vi.fn(() => footman),
      createUnit,
    } as unknown as UnitFactory;
    const bus = new EventBus<GameEvents>();
    const trainedListener = vi.fn();
    bus.on('UNIT_TRAINED', trainedListener);

    const system = new TrainingQueueSystem(unitFactory, bus, {} as GameConfig);
    system.init(world);

    system.update(1);
    expect(queue?.currentBuildTime).toBe(2);
    expect(queue?.progress).toBe(1);

    system.update(1);

    expect(createUnit).toHaveBeenCalledWith('footman', 'human', 13, 15);
    expect(queue?.queue).toEqual([]);
    expect(queue?.progress).toBe(0);
    expect(queue?.currentBuildTime).toBe(0);
    expect(trainedListener).toHaveBeenCalledWith({
      spawnedEntity: 99,
      unitId: 'footman',
      faction: Faction.Human,
      playerId: 'human',
      buildingEntity,
    });
  });

  it('falls back to the default build time when the queued unit definition is missing', () => {
    const world = new World();
    const buildingEntity = createQueuedBuilding(world, 'ghost_unit');
    const queue = world.getComponent(buildingEntity, TrainingQueueType);
    const createUnit = vi.fn();
    const unitFactory = {
      getUnitDef: vi.fn(() => undefined),
      createUnit,
    } as unknown as UnitFactory;

    const system = new TrainingQueueSystem(
      unitFactory,
      new EventBus<GameEvents>(),
      {} as GameConfig,
    );
    system.init(world);

    system.update(0.5);

    expect(queue?.progress).toBe(0.5);
    expect(queue?.currentBuildTime).toBe(20);
    expect(createUnit).not.toHaveBeenCalled();
  });
});
