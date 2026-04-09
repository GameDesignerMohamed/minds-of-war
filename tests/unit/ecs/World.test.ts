import { describe, expect, it } from 'vitest';
import { ARCHETYPE_QUERY_TRIGGER_ENTITY_COUNT, World } from '@/ecs/World';
import { Component, componentType } from '@/ecs/Component';

interface TestPositionComponent extends Component {
  readonly type: 'TestPosition';
  x: number;
  z: number;
}

interface TestVelocityComponent extends Component {
  readonly type: 'TestVelocity';
  speed: number;
}

interface TestSelectableComponent extends Component {
  readonly type: 'TestSelectable';
}

const TestPositionType = componentType<TestPositionComponent>('TestPosition');
const TestVelocityType = componentType<TestVelocityComponent>('TestVelocity');
const TestSelectableType = componentType<TestSelectableComponent>('TestSelectable');

describe('World', () => {
  it('filters query results by required components while scan mode is active', () => {
    const world = new World();
    const movingEntity = world.createEntity();
    const staticEntity = world.createEntity();
    const velocityOnlyEntity = world.createEntity();

    world.addComponent(movingEntity, TestPositionType, { x: 1, z: 0 });
    world.addComponent(movingEntity, TestVelocityType, { speed: 3 });
    world.addComponent(staticEntity, TestPositionType, { x: 5, z: 0 });
    world.addComponent(velocityOnlyEntity, TestVelocityType, { speed: 1 });

    const matches = [...world.query(TestPositionType, TestVelocityType)];

    expect(world.queryStrategy).toBe('scan');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual([
      movingEntity,
      expect.objectContaining({ type: 'TestPosition', x: 1 }),
    ]);
  });

  it('keeps query results in sync when components are removed, replaced, or entities are destroyed', () => {
    const world = new World();
    const preservedEntity = world.createEntity();
    const removedEntity = world.createEntity();

    world.addComponent(preservedEntity, TestPositionType, { x: 10, z: 0 });
    world.addComponent(preservedEntity, TestSelectableType, {});
    world.addComponent(removedEntity, TestPositionType, { x: 20, z: 0 });
    world.addComponent(removedEntity, TestSelectableType, {});

    world.removeComponent(removedEntity, TestSelectableType);
    world.destroyEntity(removedEntity);
    world.addComponent(preservedEntity, TestPositionType, { x: 15, z: 0 });

    const matches = [...world.query(TestPositionType, TestSelectableType)];

    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual([
      preservedEntity,
      expect.objectContaining({ type: 'TestPosition', x: 15 }),
    ]);
  });

  it('switches to archetype-backed queries after the entity-count trigger and keeps results correct', () => {
    const world = new World();
    const matchingEntities: number[] = [];

    for (let index = 0; index <= ARCHETYPE_QUERY_TRIGGER_ENTITY_COUNT; index++) {
      const entity = world.createEntity();
      world.addComponent(entity, TestPositionType, { x: index, z: 0 });

      if (index % 2 === 0) {
        world.addComponent(entity, TestVelocityType, { speed: index + 1 });
      }
      if (index % 3 === 0) {
        world.addComponent(entity, TestSelectableType, {});
      }
      if (index % 6 === 0) {
        matchingEntities.push(entity);
      }
    }

    expect(world.entityCount).toBe(ARCHETYPE_QUERY_TRIGGER_ENTITY_COUNT + 1);
    expect(world.queryStrategy).toBe('archetype');
    expect(
      [...world.query(TestPositionType, TestVelocityType, TestSelectableType)].map(
        ([entity]) => entity,
      ),
    ).toEqual(matchingEntities);

    const removedEntity = matchingEntities[0];
    const destroyedEntity = matchingEntities[1];
    const newEntity = world.createEntity();

    world.removeComponent(removedEntity, TestSelectableType);
    world.destroyEntity(destroyedEntity);
    world.addComponent(newEntity, TestPositionType, { x: 999, z: 0 });
    world.addComponent(newEntity, TestVelocityType, { speed: 999 });
    world.addComponent(newEntity, TestSelectableType, {});

    expect(
      [...world.query(TestPositionType, TestVelocityType, TestSelectableType)].map(
        ([entity]) => entity,
      ),
    ).toEqual([...matchingEntities.slice(2), newEntity]);
  });
});
