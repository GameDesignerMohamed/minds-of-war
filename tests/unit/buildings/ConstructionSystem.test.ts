import { describe, expect, it, vi } from 'vitest';
import { ConstructionSystem } from '@/buildings/ConstructionSystem';
import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import { World } from '@/ecs/World';
import {
  AliveType,
  BuildingType,
  ConstructionType,
  HealthType,
  OwnerType,
  UnitType,
} from '@/ecs/components/GameComponents';
import { Faction } from '@/types';
import { NULL_ENTITY } from '@/ecs/Entity';

describe('ConstructionSystem', () => {
  it('completes buildings, restores full HP, and emits BUILDING_COMPLETE', () => {
    const world = new World();
    const entityId = world.createEntity();
    const builderEntity = world.createEntity();
    world.addComponent(entityId, ConstructionType, {
      elapsed: 4,
      buildTime: 5,
      builderEntity,
    });
    world.addComponent(entityId, HealthType, { current: 1, max: 1200 });
    world.addComponent(entityId, BuildingType, {
      buildingId: 'barracks',
      displayName: 'Barracks',
      populationProvided: 0,
      gridSize: '3x3',
      isComplete: false,
    });
    world.addComponent(entityId, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(builderEntity, UnitType, {
      unitId: 'peasant',
      displayName: 'Peasant',
      tier: 1,
      supplyCost: 1,
      isWorker: true,
    });
    world.addComponent(builderEntity, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(builderEntity, AliveType, {});

    const bus = new EventBus<GameEvents>();
    const completeListener = vi.fn();
    bus.on('BUILDING_COMPLETE', completeListener);

    const system = new ConstructionSystem(bus);
    system.init(world);
    system.update(1);

    expect(world.hasComponent(entityId, ConstructionType)).toBe(false);
    expect(world.getComponent(entityId, BuildingType)?.isComplete).toBe(true);
    expect(world.getComponent(entityId, HealthType)?.current).toBe(1200);
    expect(completeListener).toHaveBeenCalledWith({
      entityId,
      buildingId: 'barracks',
      faction: Faction.Human,
      playerId: 'human',
    });
  });

  it('keeps incomplete buildings under construction and clamps HP to at least 1', () => {
    const world = new World();
    const entityId = world.createEntity();
    const builderEntity = world.createEntity();
    world.addComponent(entityId, ConstructionType, {
      elapsed: 0,
      buildTime: 100,
      builderEntity,
    });
    world.addComponent(entityId, HealthType, { current: 1, max: 50 });
    world.addComponent(entityId, BuildingType, {
      buildingId: 'farm',
      displayName: 'Farm',
      populationProvided: 8,
      gridSize: '2x2',
      isComplete: false,
    });
    world.addComponent(builderEntity, UnitType, {
      unitId: 'peasant',
      displayName: 'Peasant',
      tier: 1,
      supplyCost: 1,
      isWorker: true,
    });
    world.addComponent(builderEntity, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(builderEntity, AliveType, {});

    const bus = new EventBus<GameEvents>();
    const completeListener = vi.fn();
    bus.on('BUILDING_COMPLETE', completeListener);

    const system = new ConstructionSystem(bus);
    system.init(world);
    system.update(0.1);

    expect(world.hasComponent(entityId, ConstructionType)).toBe(true);
    expect(world.getComponent(entityId, BuildingType)?.isComplete).toBe(false);
    expect(world.getComponent(entityId, HealthType)?.current).toBe(1);
    expect(completeListener).not.toHaveBeenCalled();
  });

  it('reassigns construction to another live worker when the builder dies', () => {
    const world = new World();
    const entityId = world.createEntity();
    const deadBuilder = world.createEntity();
    const replacementBuilder = world.createEntity();

    world.addComponent(entityId, ConstructionType, {
      elapsed: 0,
      buildTime: 10,
      builderEntity: deadBuilder,
    });
    world.addComponent(entityId, HealthType, { current: 1, max: 100 });
    world.addComponent(entityId, BuildingType, {
      buildingId: 'farm',
      displayName: 'Farm',
      populationProvided: 8,
      gridSize: '2x2',
      isComplete: false,
    });
    world.addComponent(entityId, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });

    world.addComponent(deadBuilder, UnitType, {
      unitId: 'peasant',
      displayName: 'Peasant',
      tier: 1,
      supplyCost: 1,
      isWorker: true,
    });
    world.addComponent(deadBuilder, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(deadBuilder, AliveType, {});

    world.addComponent(replacementBuilder, UnitType, {
      unitId: 'peasant',
      displayName: 'Peasant',
      tier: 1,
      supplyCost: 1,
      isWorker: true,
    });
    world.addComponent(replacementBuilder, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(replacementBuilder, AliveType, {});

    const bus = new EventBus<GameEvents>();
    const system = new ConstructionSystem(bus);
    system.init(world);

    world.removeComponent(deadBuilder, AliveType);
    bus.emit('UNIT_DIED', {
      entityId: deadBuilder,
      killedByEntity: 77,
      faction: Faction.Human,
    });

    expect(world.getComponent(entityId, ConstructionType)?.builderEntity).toBe(replacementBuilder);

    system.update(1);

    expect(world.getComponent(entityId, ConstructionType)?.elapsed).toBe(1);
    expect(world.getComponent(entityId, HealthType)?.current).toBe(10);
  });

  it('pauses construction without a replacement and resumes once a new worker exists', () => {
    const world = new World();
    const entityId = world.createEntity();
    const deadBuilder = world.createEntity();

    world.addComponent(entityId, ConstructionType, {
      elapsed: 3,
      buildTime: 10,
      builderEntity: deadBuilder,
    });
    world.addComponent(entityId, HealthType, { current: 30, max: 100 });
    world.addComponent(entityId, BuildingType, {
      buildingId: 'farm',
      displayName: 'Farm',
      populationProvided: 8,
      gridSize: '2x2',
      isComplete: false,
    });
    world.addComponent(entityId, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });

    world.addComponent(deadBuilder, UnitType, {
      unitId: 'peasant',
      displayName: 'Peasant',
      tier: 1,
      supplyCost: 1,
      isWorker: true,
    });
    world.addComponent(deadBuilder, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(deadBuilder, AliveType, {});

    const bus = new EventBus<GameEvents>();
    const system = new ConstructionSystem(bus);
    system.init(world);

    world.removeComponent(deadBuilder, AliveType);
    bus.emit('UNIT_DIED', {
      entityId: deadBuilder,
      killedByEntity: 77,
      faction: Faction.Human,
    });

    expect(world.getComponent(entityId, ConstructionType)?.builderEntity).toBe(NULL_ENTITY);

    system.update(1);
    expect(world.getComponent(entityId, ConstructionType)?.elapsed).toBe(3);

    const replacementBuilder = world.createEntity();
    world.addComponent(replacementBuilder, UnitType, {
      unitId: 'peasant',
      displayName: 'Peasant',
      tier: 1,
      supplyCost: 1,
      isWorker: true,
    });
    world.addComponent(replacementBuilder, OwnerType, {
      faction: Faction.Human,
      playerId: 'human',
    });
    world.addComponent(replacementBuilder, AliveType, {});

    system.update(1);

    expect(world.getComponent(entityId, ConstructionType)?.builderEntity).toBe(replacementBuilder);
    expect(world.getComponent(entityId, ConstructionType)?.elapsed).toBe(4);
    expect(world.getComponent(entityId, HealthType)?.current).toBe(40);
  });
});
