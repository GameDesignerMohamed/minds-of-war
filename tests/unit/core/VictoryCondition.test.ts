import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '@/core/EventBus';
import type { GameEvents } from '@/core/GameEvents';
import { registerVictoryConditionHandlers } from '@/core/VictoryCondition';
import { Faction } from '@/types';

describe('registerVictoryConditionHandlers', () => {
  it.each([
    ['keep', 'human', 'lose', 'Your Keep has been destroyed!'],
    ['stronghold', 'orc', 'win', 'The Orc Stronghold has fallen!'],
  ] as const)('shows %s destruction for %s as %s', (buildingId, playerId, outcome, subline) => {
    const bus = new EventBus<GameEvents>();
    const presenter = { show: vi.fn() };
    registerVictoryConditionHandlers(bus, presenter);

    bus.emit('BUILDING_DESTROYED', {
      entityId: 12,
      buildingId,
      faction: playerId === 'human' ? Faction.Human : Faction.Orc,
      playerId,
      destroyedByEntity: 99,
    });

    expect(presenter.show).toHaveBeenCalledWith(outcome, subline);
  });

  it('ignores destroyed buildings that are not match-ending HQs', () => {
    const bus = new EventBus<GameEvents>();
    const presenter = { show: vi.fn() };
    registerVictoryConditionHandlers(bus, presenter);

    bus.emit('BUILDING_DESTROYED', {
      entityId: 9,
      buildingId: 'farm',
      faction: Faction.Human,
      playerId: 'human',
      destroyedByEntity: 15,
    });

    expect(presenter.show).not.toHaveBeenCalled();
  });
});
