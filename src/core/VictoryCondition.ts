import type { EventBus } from './EventBus';
import type { GameEvents } from './GameEvents';

export type VictoryOutcome = 'win' | 'lose';

export interface VictoryPresenter {
  show(outcome: VictoryOutcome, subline?: string): void;
}

export function registerVictoryConditionHandlers(
  bus: EventBus<GameEvents>,
  presenter: VictoryPresenter,
): () => void {
  return bus.on('BUILDING_DESTROYED', (event) => {
    if (event.buildingId === 'keep' && event.playerId === 'human') {
      presenter.show('lose', 'Your Keep has been destroyed!');
      return;
    }

    if (event.buildingId === 'stronghold' && event.playerId === 'orc') {
      presenter.show('win', 'The Orc Stronghold has fallen!');
    }
  });
}
