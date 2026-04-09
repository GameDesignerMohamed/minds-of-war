/**
 * TrainingQueueSystem — processes unit training queues on buildings each tick.
 *
 * Buildings with a TrainingQueueComponent and non-empty queue train units
 * sequentially. When the front item completes, a unit is spawned via
 * UnitFactory and UNIT_TRAINED is emitted.
 *
 * Dependencies injected via constructor:
 *  - UnitFactory — to spawn completed units
 *  - EventBus — to emit UNIT_TRAINED
 *  - GameConfig — to look up unit build times
 *
 * @module buildings/TrainingQueueSystem
 */

import { System } from '../ecs/System';
import type { UnitFactory } from '../units/UnitFactory';
import type { EventBus } from '../core/EventBus';
import type { GameEvents } from '../core/GameEvents';
import type { GameConfig } from '../config/ConfigLoader';
import type { PlayerId } from '../types';
import { Faction } from '../types';
import {
  TrainingQueueType,
  ConstructionType,
  PositionType,
  OwnerType,
} from '../ecs/components/GameComponents';

/** Offset distance from building center where trained units spawn. */
const SPAWN_OFFSET = 3;

export class TrainingQueueSystem extends System {
  readonly name = 'TrainingQueueSystem';

  constructor(
    private unitFactory: UnitFactory,
    private eventBus: EventBus<GameEvents>,
    private config: GameConfig,
  ) {
    super();
  }

  update(dt: number): void {
    const world = this.world;

    for (const [id, queue] of world.query(TrainingQueueType)) {
      // Skip buildings under construction
      if (world.hasComponent(id, ConstructionType)) continue;

      // Skip if queue is empty
      if (queue.queue.length === 0) continue;

      const currentUnitId = queue.queue[0];

      // Initialize build time for current item if needed
      if (queue.currentBuildTime === 0) {
        const owner = world.getComponent(id, OwnerType);
        const faction = (owner?.playerId ?? 'human') as PlayerId;
        const unitDef = this.unitFactory.getUnitDef(currentUnitId, faction);
        queue.currentBuildTime = unitDef?.buildTime ?? 20;
      }

      // Advance progress
      queue.progress += dt;

      // Training complete
      if (queue.progress >= queue.currentBuildTime) {
        const owner = world.getComponent(id, OwnerType);
        const pos = world.getComponent(id, PositionType);
        const faction = (owner?.playerId ?? 'human') as PlayerId;

        // Spawn the trained unit near the building
        const spawnX = (pos?.x ?? 0) + SPAWN_OFFSET;
        const spawnZ = (pos?.z ?? 0) + SPAWN_OFFSET;

        const spawnedEntity = this.unitFactory.createUnit(currentUnitId, faction, spawnX, spawnZ);
        const factionEnum = faction === 'human' ? Faction.Human : Faction.Orc;

        // Emit event
        this.eventBus.emit('UNIT_TRAINED', {
          spawnedEntity,
          unitId: currentUnitId,
          faction: factionEnum,
          playerId: faction,
          buildingEntity: id,
        });

        // Shift queue
        queue.queue.shift();
        queue.progress = 0;
        queue.currentBuildTime = 0;
      }
    }
  }
}
