import { describe, expect, it, vi } from 'vitest';
import { CommandDispatcher } from '@/input/CommandDispatcher';
import { EventBus } from '@/core/EventBus';
import { World } from '@/ecs/World';
import { HealthType, OwnerType } from '@/ecs/components/GameComponents';
import { Faction } from '@/types';

describe('CommandDispatcher', () => {
  it('treats entities with a different owner playerId as enemies even without FactionType', () => {
    const world = new World();
    const enemy = world.createEntity();
    world.addComponent(enemy, HealthType, { current: 10, max: 10 });
    world.addComponent(enemy, OwnerType, { playerId: 'orc', faction: Faction.Orc });

    const selection = { selected: new Set([101]) };
    const bus = new EventBus<{
      moveCommand: {
        entities: readonly number[];
        target: { x: number; z: number };
        playerId: string;
      };
      attackCommand: { entities: readonly number[]; targetId: number; playerId: string };
      stopCommand: { entities: readonly number[]; playerId: string };
      patrolCommand: {
        entities: readonly number[];
        target: { x: number; z: number };
        playerId: string;
      };
      buildCommand: {
        workerEntity: number;
        buildingType: string;
        target: { x: number; z: number };
        playerId: string;
      };
    }>();
    const attackListener = vi.fn();
    bus.on('attackCommand', attackListener);

    const dispatcher = new CommandDispatcher(
      selection as never,
      bus as never,
      world,
      () => enemy,
      'human',
    );

    dispatcher.issueRightClick({ x: 4, z: 6 });

    expect(attackListener).toHaveBeenCalledWith({
      entities: [101],
      targetId: enemy,
      playerId: 'human',
    });
  });
});
