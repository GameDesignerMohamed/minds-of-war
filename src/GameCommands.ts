import * as THREE from 'three';
import { InputManager, type InputEvents } from '@/input/InputManager';
import { SelectionManager } from '@/input/SelectionManager';
import { CommandDispatcher, type CommandEvents } from '@/input/CommandDispatcher';
import { EventBus } from '@/core/EventBus';
import { SelectionRect } from '@/ui/SelectionRect';
import { getCommandIconPath } from '@/art/ArtLibrary';
import { CommandCard, type CommandCardItem } from '@/ui/CommandCard';
import { CameraController } from '@/rendering/CameraController';
import { SceneManager } from '@/rendering/SceneManager';
import { BuildingFactory } from '@/buildings/BuildingFactory';
import { ResourceTracker } from '@/economy/ResourceTracker';
import { TechTreeSystem } from '@/buildings/TechTreeSystem';
import { World } from '@/ecs/World';
import type {
  BuildingData,
  GameConfig,
  UnitData,
} from '@/config/ConfigLoader';
import type { EntityId, Position } from '@/types';
import type { GameEvents } from '@/core/GameEvents';
import type {
  BuildingComponent,
  HarvesterComponent,
  OwnerComponent,
  PositionComponent,
  ResourceNodeComponent,
  TrainingQueueComponent,
  UnitComponent,
} from '@/ecs/components/GameComponents';
import {
  AttackTargetType,
  BuildingType,
  HarvesterType,
  MovementType,
  OwnerType,
  PositionType,
  ResourceNodeType,
  TrainingQueueType,
  UnitType,
} from '@/ecs/components/GameComponents';

export interface GameCommandsParams {
  appRoot: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sceneManager: SceneManager;
  cameraController: CameraController;
  world: World;
  gameEventBus: EventBus<GameEvents>;
  config: GameConfig;
  techTreeSystem: TechTreeSystem;
  resourceTracker: ResourceTracker;
  buildingFactory: BuildingFactory;
  commandCard: CommandCard;
  mapWidth: number;
  mapHeight: number;
}

export interface GameCommandsResult {
  inputBus: EventBus<InputEvents>;
  commandBus: EventBus<CommandEvents>;
  inputManager: InputManager;
  selectionManager: SelectionManager;
  commandDispatcher: CommandDispatcher;
  getPlacementMode: () => string | null;
}

export function createGameCommands({
  appRoot,
  renderer,
  scene,
  sceneManager,
  cameraController,
  world,
  gameEventBus,
  config,
  techTreeSystem,
  resourceTracker,
  buildingFactory,
  commandCard,
  mapWidth,
  mapHeight,
}: GameCommandsParams): GameCommandsResult {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const groundHit = new THREE.Vector3();
  let lastEntity: EntityId | null = null;

  const toNdc = (screenX: number, screenY: number): void => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(
      ((screenX - rect.left) / rect.width) * 2 - 1,
      -((screenY - rect.top) / rect.height) * 2 + 1,
    );
  };

  const screenToWorld = (screenX: number, screenY: number): Position | null => {
    toNdc(screenX, screenY);
    raycaster.setFromCamera(ndc, cameraController.camera);
    return raycaster.ray.intersectPlane(groundPlane, groundHit)
      ? { x: groundHit.x, z: groundHit.z }
      : null;
  };

  const updateEntityHit = (screenX: number, screenY: number): void => {
    toNdc(screenX, screenY);
    raycaster.setFromCamera(ndc, cameraController.camera);
    lastEntity = null;
    for (const hit of raycaster.intersectObjects(scene.children, true)) {
      let object: THREE.Object3D | null = hit.object;
      while (object) {
        if (object.userData['entityId'] != null) {
          lastEntity = object.userData['entityId'] as EntityId;
          return;
        }
        object = object.parent;
      }
    }
  };

  const entityAtPosition = (_position: Position): EntityId | null => lastEntity;

  const inputBus = new EventBus<InputEvents>();
  const commandBus = new EventBus<CommandEvents>();
  const inputManager = new InputManager(renderer.domElement, inputBus);
  const selectionRect = new SelectionRect();
  const selectionManager = new SelectionManager(world, entityAtPosition, 'human');
  const commandDispatcher = new CommandDispatcher(
    selectionManager,
    commandBus,
    world,
    entityAtPosition,
    'human',
  );
  selectionRect.mount(appRoot);
  inputManager.mount();

  let placementMode: string | null = null;
  let placementGhost: THREE.Mesh | null = null;

  const exitPlacementMode = (): void => {
    placementMode = null;
    if (placementGhost) {
      sceneManager.removeObject('placement-ghost');
      placementGhost = null;
    }
  };

  const enterPlacementMode = (buildingId: string): void => {
    exitPlacementMode();
    placementMode = buildingId;
    placementGhost = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 2),
      new THREE.MeshStandardMaterial({ color: 0x00ff88, transparent: true, opacity: 0.5 }),
    );
    placementGhost.position.y = 0.5;
    placementGhost.raycast = () => {};
    sceneManager.addObject('placement-ghost', placementGhost);
  };

  const issueTrainCommand = (buildingEntity: EntityId, unitId: string): void => {
    const owner = world.getComponent<OwnerComponent>(buildingEntity, OwnerType);
    if (!owner) {
      return;
    }

    const playerId = owner.playerId;
    const unitList = playerId === 'human' ? config.humanUnits.units : config.orcUnits.units;
    const unitDef = unitList.find((unit: UnitData) => unit.id === unitId);
    if (!unitDef) {
      console.warn(`Unknown unit: ${unitId}`);
      return;
    }
    if (!techTreeSystem.canTrainUnit(playerId, playerId, unitDef.id, unitDef.tier)) {
      console.log('Unit is not unlocked yet', unitId);
      return;
    }

    const cost = unitDef.cost ?? { gold: 0, wood: 0 };
    if (!resourceTracker.canAfford(playerId, cost)) {
      console.log('Cannot afford', unitId);
      return;
    }

    resourceTracker.spend(playerId, cost);

    const queue = world.getComponent<TrainingQueueComponent>(buildingEntity, TrainingQueueType);
    if (!queue) {
      return;
    }

    queue.queue.push(unitId);
    gameEventBus.emit('UNIT_QUEUED', {
      unitId,
      buildingEntity,
      playerId,
      queueLength: queue.queue.length,
    });
    console.log(`Queued ${unitId} at building ${buildingEntity}, queue length: ${queue.queue.length}`);
  };

  const updateCommandCard = (): void => {
    const selected = selectionManager.selected;
    if (selected.size === 0) {
      commandCard.setCommands([]);
      return;
    }

    const firstEntity = selected.values().next().value as EntityId;
    const items: CommandCardItem[] = [];
    const unitComponent = world.getComponent<UnitComponent>(firstEntity, UnitType);
    const buildingComponent = world.getComponent<BuildingComponent>(firstEntity, BuildingType);

    if (unitComponent && unitComponent.isWorker) {
      items.push({
        id: 'harvest',
        label: 'Harvest',
        hotkey: 'H',
        icon: getCommandIconPath('harvest') ?? '⛏',
        onActivate: () => {},
      });
      items.push({
        id: 'build-farm',
        label: 'Build Farm',
        hotkey: 'Q',
        icon: getCommandIconPath('build-farm') ?? '🌾',
        onActivate: () => enterPlacementMode('farm'),
      });
      items.push({
        id: 'build-barracks',
        label: 'Build Barracks',
        hotkey: 'W',
        icon: getCommandIconPath('build-barracks') ?? '⚔',
        onActivate: () => enterPlacementMode('barracks'),
      });
      items.push({
        id: 'build-tower',
        label: 'Build Tower',
        hotkey: 'E',
        icon: getCommandIconPath('build-tower') ?? '🗼',
        onActivate: () => enterPlacementMode('watch_tower'),
      });
      items.push({
        id: 'build-archery',
        label: 'Archery Range',
        hotkey: 'R',
        icon: getCommandIconPath('build-archery') ?? '🏹',
        onActivate: () => enterPlacementMode('archery_range'),
      });
      if (techTreeSystem.canConstructBuilding('human', 'human', 'blacksmith')) {
        items.push({
          id: 'build-blacksmith',
          label: 'Blacksmith',
          hotkey: 'T',
          icon: getCommandIconPath('build-blacksmith') ?? '🔨',
          onActivate: () => enterPlacementMode('blacksmith'),
        });
      }
    } else if (buildingComponent) {
      const buildingId = buildingComponent.buildingId;
      if (buildingId === 'keep' || buildingId === 'stronghold') {
        const workerUnitId = buildingId === 'keep' ? 'peasant' : 'thrall';
        items.push({
          id: 'train-worker',
          label: `Train ${workerUnitId}`,
          hotkey: 'Q',
          icon: getCommandIconPath('train-worker') ?? '👷',
          onActivate: () => issueTrainCommand(firstEntity, workerUnitId),
        });
      }
      if (buildingId === 'barracks' || buildingId === 'war_camp') {
        const meleeUnitId = buildingId === 'barracks' ? 'footman' : 'grunt';
        items.push({
          id: 'train-melee',
          label: `Train ${meleeUnitId}`,
          hotkey: 'Q',
          icon: getCommandIconPath('train-melee') ?? '⚔',
          onActivate: () => issueTrainCommand(firstEntity, meleeUnitId),
        });
      }
      if (buildingId === 'archery_range' || buildingId === 'beast_den') {
        const rangedUnitId = buildingId === 'archery_range' ? 'archer' : 'hunter';
        items.push({
          id: 'train-ranged',
          label: `Train ${rangedUnitId}`,
          hotkey: 'Q',
          icon: getCommandIconPath('train-ranged') ?? '🏹',
          onActivate: () => issueTrainCommand(firstEntity, rangedUnitId),
        });
      }
    } else if (unitComponent) {
      items.push({
        id: 'attack',
        label: 'Attack',
        hotkey: 'A',
        icon: getCommandIconPath('attack') ?? '⚔',
        onActivate: () => {},
      });
      items.push({
        id: 'stop',
        label: 'Stop',
        hotkey: 'S',
        icon: getCommandIconPath('stop') ?? '⛔',
        onActivate: () => commandDispatcher.issueHotkey('KeyS'),
      });
    }

    commandCard.setCommands(items);
  };

  const issueHarvestCommand = (
    resourceEntity: EntityId,
    resourceNode: ResourceNodeComponent,
  ): void => {
    const resourcePosition = world.getComponent<PositionComponent>(resourceEntity, PositionType);
    if (!resourcePosition) {
      return;
    }

    let nearestDropOff: EntityId | null = null;
    let nearestDistance = Infinity;
    for (const [buildingEntity, buildingComponent] of world.query<BuildingComponent>(BuildingType)) {
      const owner = world.getComponent<OwnerComponent>(buildingEntity, OwnerType);
      if (!owner || owner.playerId !== 'human' || !buildingComponent.isComplete) {
        continue;
      }

      const buildingPosition = world.getComponent<PositionComponent>(buildingEntity, PositionType);
      if (!buildingPosition) {
        continue;
      }

      const distance =
        Math.abs(buildingPosition.x - resourcePosition.x) +
        Math.abs(buildingPosition.z - resourcePosition.z);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestDropOff = buildingEntity;
      }
    }
    if (nearestDropOff === null) {
      return;
    }

    for (const entityId of selectionManager.selected) {
      const harvester = world.getComponent<HarvesterComponent>(entityId, HarvesterType);
      if (!harvester) {
        continue;
      }

      harvester.assignedResource = resourceEntity;
      harvester.assignedDropOff = nearestDropOff;
      harvester.carryType = resourceNode.kind;
      harvester.state = 'movingToResource';
      harvester.carryAmount = 0;
      harvester.gatherTimer = 0;

      const movement = world.getComponent(entityId, MovementType);
      if (movement) {
        movement.targetX = resourcePosition.x;
        movement.targetZ = resourcePosition.z;
        movement.waypoints = [];
        movement.waypointIndex = 0;
      }
    }
    console.log(`Harvest order: ${selectionManager.selected.size} workers → ${resourceNode.kind}`);
  };

  let dragOrigin: { x: number; y: number } | null = null;
  let isDragging = false;

  inputBus.on('pointerDown', ({ x, y, button }: { x: number; y: number; button: number }) => {
    updateEntityHit(x, y);

    if (button === 0) {
      if (placementMode) {
        const worldPosition = screenToWorld(x, y);
        if (worldPosition) {
          const gridX = Math.round(worldPosition.x);
          const gridZ = Math.round(worldPosition.z);
          if (gridX >= 0 && gridX < mapWidth && gridZ >= 0 && gridZ < mapHeight) {
            let workerId: EntityId | null = null;
            for (const entityId of selectionManager.selected) {
              const unit = world.getComponent<UnitComponent>(entityId, UnitType);
              if (unit?.isWorker) {
                workerId = entityId;
                break;
              }
            }

            if (workerId !== null) {
              const buildingDef = config.humanBuildings.buildings.find(
                (building: BuildingData) => building.id === placementMode,
              );
              if (buildingDef) {
                if (!techTreeSystem.canConstructBuilding('human', 'human', buildingDef.id)) {
                  console.log('Building is not unlocked yet', buildingDef.id);
                  exitPlacementMode();
                  return;
                }
                const cost = buildingDef.cost ?? { gold: 0, wood: 0 };
                if (resourceTracker.canAfford('human', cost)) {
                  resourceTracker.spend('human', cost);
                  buildingFactory.createBuilding(
                    placementMode,
                    'human',
                    gridX,
                    gridZ,
                    false,
                    workerId,
                  );

                  const movement = world.getComponent(workerId, MovementType);
                  if (movement) {
                    movement.targetX = gridX;
                    movement.targetZ = gridZ;
                    movement.waypoints = [];
                    movement.waypointIndex = 0;
                  }
                  console.log(`Building ${placementMode} at (${gridX}, ${gridZ})`);
                }
              }
            }
          }
        }
        exitPlacementMode();
        return;
      }

      dragOrigin = { x, y };
      isDragging = false;
    }

    if (button === 2) {
      if (placementMode) {
        exitPlacementMode();
        return;
      }

      const worldPosition = screenToWorld(x, y);
      if (!worldPosition) {
        return;
      }

      const targetEntity = lastEntity;
      if (targetEntity !== null) {
        const resourceNode = world.getComponent<ResourceNodeComponent>(targetEntity, ResourceNodeType);
        if (resourceNode) {
          issueHarvestCommand(targetEntity, resourceNode);
          return;
        }
      }

      commandDispatcher.issueRightClick(worldPosition);
    }
  });

  inputBus.on('pointerDrag', ({ x, y, buttons }: { x: number; y: number; buttons: number }) => {
    if (!(buttons & 1) || !dragOrigin) {
      return;
    }
    if (!isDragging && Math.hypot(x - dragOrigin.x, y - dragOrigin.y) >= 5) {
      isDragging = true;
      selectionRect.begin({ x: dragOrigin.x, z: dragOrigin.y });
    }
    if (isDragging) {
      selectionRect.update({ x, z: y });
    }
  });

  inputBus.on('pointerUp', ({ x, y, button }: { x: number; y: number; button: number }) => {
    if (button !== 0) {
      return;
    }

    if (isDragging) {
      const selectionBounds = selectionRect.end();
      if (selectionBounds) {
        const start = screenToWorld(selectionBounds.origin.x, selectionBounds.origin.z);
        const end = screenToWorld(selectionBounds.current.x, selectionBounds.current.z);
        if (start && end) {
          selectionManager.selectInBox(start, end, false);
        }
      }
    } else {
      updateEntityHit(x, y);
      const worldPosition = screenToWorld(x, y);
      if (worldPosition) {
        selectionManager.selectAt(worldPosition, false);
      }
    }

    dragOrigin = null;
    isDragging = false;
    updateCommandCard();
  });

  inputBus.on('pointerMove', ({ x, y }: { x: number; y: number }) => {
    if (!placementMode || !placementGhost) {
      return;
    }
    const worldPosition = screenToWorld(x, y);
    if (worldPosition) {
      placementGhost.position.x = Math.round(worldPosition.x);
      placementGhost.position.z = Math.round(worldPosition.z);
    }
  });

  inputBus.on('keyDown', ({ code }: { code: string }) => {
    if (code === 'Escape') {
      exitPlacementMode();
      return;
    }
    commandCard.handleHotkey(code);
    commandDispatcher.issueHotkey(code);
  });

  commandBus.on(
    'moveCommand',
    ({ entities, target }: { entities: readonly EntityId[]; target: Position }) => {
      for (const entityId of entities) {
        const movement = world.getComponent(entityId, MovementType);
        if (movement) {
          movement.targetX = target.x;
          movement.targetZ = target.z;
          movement.waypoints = [];
          movement.waypointIndex = 0;
        }
      }
    },
  );

  commandBus.on(
    'attackCommand',
    ({ entities, targetId }: { entities: readonly EntityId[]; targetId: EntityId }) => {
      for (const entityId of entities) {
        world.addComponent(entityId, AttackTargetType, { targetEntity: targetId });
      }
    },
  );

  commandBus.on('stopCommand', ({ entities }: { entities: readonly EntityId[] }) => {
    for (const entityId of entities) {
      const movement = world.getComponent(entityId, MovementType);
      if (movement) {
        movement.targetX = undefined;
        movement.targetZ = undefined;
        movement.waypoints = [];
        movement.waypointIndex = 0;
      }
    }
  });

  return {
    inputBus,
    commandBus,
    inputManager,
    selectionManager,
    commandDispatcher,
    getPlacementMode: () => placementMode,
  };
}
