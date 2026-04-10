import {
  loadGameConfig,
  type AIBehaviorProfile,
  type BuildingData,
  type UnitData,
} from '@/config/ConfigLoader';
import { World } from '@/ecs/World';
import { EventBus } from '@/core/EventBus';
import { MeshFactory } from '@/rendering/MeshFactory';
import { UnitFactory } from '@/units/UnitFactory';
import { BuildingFactory } from '@/buildings/BuildingFactory';
import { MovementSystem } from '@/units/MovementSystem';
import { HarvestSystem } from '@/economy/HarvestSystem';
import { ResourceTracker } from '@/economy/ResourceTracker';
import { ConstructionSystem } from '@/buildings/ConstructionSystem';
import { TrainingQueueSystem } from '@/buildings/TrainingQueueSystem';
import { AttackSystem } from '@/combat/AttackSystem';
import { TileGrid } from '@/map/TileGrid';
import { initializeMap } from '@/map/MapInitializer';
import { scatterDecor } from '@/map/DecorScatter';
import { PathfindingSystem } from '@/pathfinding/PathfindingSystem';
import { TechTreeSystem } from '@/buildings/TechTreeSystem';
import { SelectionPanel } from '@/ui/SelectionPanel';
import { CommandCard } from '@/ui/CommandCard';
import { MinimapRenderer } from '@/ui/MinimapRenderer';
import { AISystem } from '@/ai/AISystem';
import { AIController } from '@/ai/AIController';
import { AIStateMachine } from '@/ai/AIStateMachine';
import { EcoState } from '@/ai/states/EcoState';
import { BuildState } from '@/ai/states/BuildState';
import { ArmyState } from '@/ai/states/ArmyState';
import { AttackState } from '@/ai/states/AttackState';
import { DefenseOverride } from '@/ai/states/DefenseOverride';
import { VictoryScreen } from '@/ui/VictoryScreen';
import { HUD, type HUDEvents } from '@/ui/HUD';
import { DisciplineAuraSystem } from '@/factions/DisciplineAuraSystem';
import { BloodRushSystem } from '@/factions/BloodRushSystem';
import { SpellSystem } from '@/factions/SpellSystem';
import { BuffSystem } from '@/factions/BuffSystem';
import { FogOfWarGrid } from '@/map/FogOfWarGrid';
import { FogOfWarSystem } from '@/map/FogOfWarSystem';
import { FogOfWarRenderer } from '@/rendering/FogOfWarRenderer';
import { EffectsSystem } from '@/rendering/EffectsSystem';
import { SoundManager } from '@/audio/SoundManager';
import { TutorialController } from '@/tutorial/TutorialController';
import { TutorialOverlay } from '@/tutorial/TutorialOverlay';
import { createTutorialSteps } from '@/tutorial/TutorialStep';
import type { AIContext } from '@/ai/AIContext';
import type { GameEvents } from '@/core/GameEvents';
import { createGameCommands } from '@/GameCommands';
import { createGameRenderer } from '@/GameRenderer';
import { createGameSetup, spawnResourceNode } from '@/GameSetup';

async function main(): Promise<void> {
  console.log('Minds of War — initializing...');
  const appRoot = document.getElementById('app')!;
  const config = await loadGameConfig();
  const mapData = config.map;
  const mapWidth = 96;
  const mapHeight = 96;

  const setup = createGameSetup({
    appRoot,
    mapWidth,
    mapHeight,
    initialCameraTarget: mapData.startingPositions.player1,
  });

  const world = new World();
  const gameEventBus = new EventBus<GameEvents>();
  const meshFactory = new MeshFactory();
  const unitFactory = new UnitFactory(
    world,
    config,
    setup.sceneManager,
    meshFactory,
    setup.hpBarSystem,
  );
  const buildingFactory = new BuildingFactory(
    world,
    config,
    setup.sceneManager,
    meshFactory,
    setup.hpBarSystem,
  );

  const tileGrid = new TileGrid(mapWidth, mapHeight);
  // initializeMap populates tileGrid walkability data; terrain tiles are NOT rendered.
  // Clean flat ground plane (from GameSetup) is the visual surface.
  initializeMap(tileGrid, config.map);

  const fogGrid = new FogOfWarGrid(mapWidth, mapHeight);
  const fogRenderer = new FogOfWarRenderer(setup.sceneManager, fogGrid, mapWidth, mapHeight);
  const fogSystem = new FogOfWarSystem(tileGrid, fogGrid, 'human', fogRenderer);

  const resourceTracker = new ResourceTracker(gameEventBus, world, config.startingLoadout);
  resourceTracker.initPlayer('human');
  resourceTracker.initPlayer('orc');

  world.registerSystem(new PathfindingSystem(tileGrid));
  world.registerSystem(new MovementSystem(setup.sceneManager));
  world.registerSystem(new HarvestSystem(gameEventBus, config.economy.resources));
  world.registerSystem(new ConstructionSystem(gameEventBus));
  const techTreeSystem = new TechTreeSystem(gameEventBus, config.techTree);
  world.registerSystem(techTreeSystem);
  world.registerSystem(new TrainingQueueSystem(unitFactory, gameEventBus, config));
  world.registerSystem(new DisciplineAuraSystem(config.disciplineAura, gameEventBus));
  world.registerSystem(new BloodRushSystem());
  world.registerSystem(new BuffSystem(gameEventBus));
  world.registerSystem(new SpellSystem(config.spells, gameEventBus));
  world.registerSystem(fogSystem);
  world.registerSystem(new AttackSystem(gameEventBus, config.combat));

  const aiSystem = new AISystem();
  world.registerSystem(aiSystem);
  const orcProfile: AIBehaviorProfile = config.aiBehavior.normal;
  const orcWorkerData = config.orcUnits.units.find((u) => u.isWorker);
  if (orcWorkerData === undefined) {
    throw new Error('Missing worker unit in orc unit config');
  }
  const aiCtx: AIContext = {
    playerId: 'orc',
    gold: config.startingLoadout.gold,
    wood: config.startingLoadout.wood,
    supplyUsed: 0,
    supplyCap: config.startingLoadout.initialSupply,
    workerCount: config.startingLoadout.workers,
    armySize: 0,
    completedBuildings: new Set(['stronghold']),
    buildingsUnderConstruction: new Set(),
    hqEntity: 0,
    previousStateName: '',
    defenseTimer: 0,
  };
  const orcBuildingMap = new Map<string, BuildingData>(config.orcBuildings.buildings.map((b) => [b.id, b]));
  const orcUnitMap = new Map<string, UnitData>(config.orcUnits.units.map((u) => [u.id, u]));
  const aiFsm = new AIStateMachine<AIContext>();
  aiFsm.registerState(new EcoState(orcProfile, world, resourceTracker, orcWorkerData, 'stronghold'));
  aiFsm.registerState(
    new BuildState(orcProfile, world, resourceTracker, techTreeSystem, orcBuildingMap),
  );
  aiFsm.registerState(
    new ArmyState(orcProfile, world, resourceTracker, techTreeSystem, orcUnitMap),
  );
  aiFsm.registerState(new AttackState(orcProfile, world, 'human'));
  aiFsm.registerState(new DefenseOverride(orcProfile, world, 'human'));
  const aiController = new AIController(
    'orc',
    orcProfile,
    aiFsm,
    aiCtx,
    world,
    resourceTracker,
    gameEventBus,
  );
  aiController.init();
  aiSystem.addController(aiController);
  console.log('All systems registered');

  const playerOneStart = mapData.startingPositions.player1;
  const playerTwoStart = mapData.startingPositions.player2;
  buildingFactory.createBuilding('keep', 'human', playerOneStart.x, playerOneStart.z, true);
  for (let index = 0; index < config.startingLoadout.workers; index += 1) {
    unitFactory.createUnit('peasant', 'human', playerOneStart.x + 3 + index * 2, playerOneStart.z + 3);
  }
  buildingFactory.createBuilding('stronghold', 'orc', playerTwoStart.x, playerTwoStart.z, true);
  for (let index = 0; index < config.startingLoadout.workers; index += 1) {
    unitFactory.createUnit('thrall', 'orc', playerTwoStart.x - 3 - index * 2, playerTwoStart.z - 3);
  }

  for (const mine of mapData.goldMines) {
    spawnResourceNode(world, setup.sceneManager, 'gold', mine.x, mine.z, mine.capacity);
  }
  for (const treeLine of mapData.treeLines) {
    const deltaX = treeLine.end.x - treeLine.start.x;
    const deltaZ = treeLine.end.z - treeLine.start.z;
    const treeCount = Math.max(Math.abs(deltaX), Math.abs(deltaZ)) + 1;
    for (let index = 0; index < treeCount; index += 1) {
      const treeX = treeLine.start.x + (deltaX === 0 ? 0 : Math.sign(deltaX) * index);
      const treeZ = treeLine.start.z + (deltaZ === 0 ? 0 : Math.sign(deltaZ) * index);
      spawnResourceNode(world, setup.sceneManager, 'wood', treeX, treeZ, 100);
    }
  }
  // Scatter decorative rocks and bushes (visual only, no gameplay effect)
  const avoidPositions = [
    playerOneStart,
    playerTwoStart,
    ...mapData.goldMines.map((m) => ({ x: m.x, z: m.z })),
  ];
  scatterDecor(setup.scene, { mapWidth, mapHeight, avoid: avoidPositions });

  console.log(`Entities spawned, scene.children=${setup.scene.children.length}`);

  const hudBus = new EventBus<HUDEvents>();
  const hud = new HUD(hudBus);
  hud.mount(appRoot);
  hudBus.emit('resourceUpdate', {
    gold: config.startingLoadout.gold,
    wood: config.startingLoadout.wood,
  });
  gameEventBus.on('RESOURCES_CHANGED', (event) => {
    if (event.playerId === 'human') {
      hudBus.emit('resourceUpdate', { gold: event.gold, wood: event.wood });
    }
  });
  gameEventBus.on('SUPPLY_CHANGED', (event) => {
    if (event.playerId === 'human') {
      hudBus.emit('supplyUpdate', { current: event.current, cap: event.cap });
    }
  });

  const minimap = new MinimapRenderer(world, fogGrid, mapWidth, mapHeight, (position) => {
    setup.cameraController.centerOn(position.x, position.z);
  });
  if (hud.minimapFrame) {
    minimap.mount(hud.minimapFrame);
  }

  const victoryScreen = new VictoryScreen({
    onPlayAgain: () => location.reload(),
    onMainMenu: () => location.reload(),
  });
  victoryScreen.mount(appRoot);
  gameEventBus.on('BUILDING_DESTROYED', (event) => {
    if (event.buildingId === 'keep' && event.playerId === 'human') {
      victoryScreen.show('lose', 'Your Keep has been destroyed!');
    } else if (event.buildingId === 'stronghold' && event.playerId === 'orc') {
      victoryScreen.show('win', 'The Orc Stronghold has fallen!');
    }
  });

  const selectionPanel = new SelectionPanel(world);
  selectionPanel.mount(hud.selectionFrame ?? appRoot);

  const commandCard = new CommandCard();
  commandCard.mount(hud.commandFrame ?? appRoot);

  const commands = createGameCommands({
    appRoot,
    renderer: setup.renderer,
    scene: setup.scene,
    sceneManager: setup.sceneManager,
    cameraController: setup.cameraController,
    world,
    gameEventBus,
    config,
    techTreeSystem,
    resourceTracker,
    buildingFactory,
    commandCard,
    mapWidth,
    mapHeight,
  });

  const effectsSystem = new EffectsSystem(setup.sceneManager, world, gameEventBus);
  void new SoundManager(gameEventBus);

  localStorage.removeItem('mow_tutorial_done');
  const tutorialOverlay = new TutorialOverlay();
  tutorialOverlay.mount(appRoot);
  const tutorialSteps = createTutorialSteps({
    selectionMgr: commands.selectionManager,
    world,
    camCtrl: setup.cameraController,
    getPlacementMode: commands.getPlacementMode,
  });
  const tutorial = new TutorialController(tutorialSteps, tutorialOverlay, gameEventBus);
  if (!TutorialController.isDone()) {
    tutorial.start();
  }
  console.log(
    '[Tutorial] active:',
    tutorial.active,
    'tooltip el:',
    document.getElementById('tut-tooltip'),
    'title el:',
    document.getElementById('tut-title'),
  );

  const loop = createGameRenderer({
    renderer: setup.renderer,
    sceneManager: setup.sceneManager,
    cameraController: setup.cameraController,
    world,
    hpBarSystem: setup.hpBarSystem,
    selectionPanel,
    selectionManager: commands.selectionManager,
    minimap,
    fogRenderer,
    effectsSystem,
    tutorial,
    hudBus,
  });
  loop.start();
  console.log('Game loop started');
}

main().catch((error: unknown) => {
  console.error('Fatal:', error);
  document.body.innerHTML = `<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#ff5c7a;font-family:monospace;padding:2rem;text-align:center;font-size:18px;">CRASH: ${error instanceof Error ? error.message : String(error)}</div>`;
});
