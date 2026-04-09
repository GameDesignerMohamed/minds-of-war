import * as THREE from 'three';
import { CameraController } from '@/rendering/CameraController';
import { HpBarSystem } from '@/rendering/HpBarSystem';
import { loadResourceModel } from '@/rendering/ModelLoader';
import { SceneManager } from '@/rendering/SceneManager';
import { Faction } from '@/types';
import type { World } from '@/ecs/World';
import type { SceneManager as SceneManagerType } from '@/rendering/SceneManager';
import {
  AliveType,
  HealthType,
  OwnerType,
  PositionType,
  RenderableType,
  ResourceNodeType,
} from '@/ecs/components/GameComponents';

const BORDER_PADDING = 24;
const OUTER_BORDER_PADDING = 80;

export interface GameSetupParams {
  appRoot: HTMLElement;
  mapWidth: number;
  mapHeight: number;
  initialCameraTarget: {
    x: number;
    z: number;
  };
}

export interface GameSetupResult {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  sceneManager: SceneManager;
  cameraController: CameraController;
  hpBarSystem: HpBarSystem;
}

export function createGameSetup({
  appRoot,
  mapWidth,
  mapHeight,
  initialCameraTarget,
}: GameSetupParams): GameSetupResult {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:0;';
  appRoot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const sceneManager = new SceneManager(scene);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(mapWidth + BORDER_PADDING, mapHeight + BORDER_PADDING),
    new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(mapWidth / 2, -0.01, mapHeight / 2);
  ground.receiveShadow = true;
  sceneManager.addObject('ground', ground);

  const border = new THREE.Mesh(
    new THREE.PlaneGeometry(mapWidth + OUTER_BORDER_PADDING, mapHeight + OUTER_BORDER_PADDING),
    new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 1.0 }),
  );
  border.rotation.x = -Math.PI / 2;
  border.position.set(mapWidth / 2, -0.02, mapHeight / 2);
  sceneManager.addObject('border', border);

  const boundaryMaterial = new THREE.LineBasicMaterial({
    color: 0x4a6a3a,
    transparent: true,
    opacity: 0.3,
  });
  const boundaryGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.01, 0),
    new THREE.Vector3(mapWidth, 0.01, 0),
    new THREE.Vector3(mapWidth, 0.01, 0),
    new THREE.Vector3(mapWidth, 0.01, mapHeight),
    new THREE.Vector3(mapWidth, 0.01, mapHeight),
    new THREE.Vector3(0, 0.01, mapHeight),
    new THREE.Vector3(0, 0.01, mapHeight),
    new THREE.Vector3(0, 0.01, 0),
  ]);
  sceneManager.addObject(
    'map-boundary',
    new THREE.LineSegments(boundaryGeometry, boundaryMaterial),
  );

  const cameraController = new CameraController(window.innerWidth, window.innerHeight, {
    panSpeed: 15,
    mapWidth,
    mapHeight,
    baseViewWidth: 70,
  });
  cameraController.centerOn(initialCameraTarget.x, initialCameraTarget.z);

  const hpOverlay = document.createElement('div');
  hpOverlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;';
  appRoot.appendChild(hpOverlay);
  const hpBarSystem = new HpBarSystem(hpOverlay);

  return {
    renderer,
    scene,
    sceneManager,
    cameraController,
    hpBarSystem,
  };
}

let resourceCounter = 0;

export function spawnResourceNode(
  world: World,
  sceneManager: SceneManagerType,
  kind: 'gold' | 'wood',
  x: number,
  z: number,
  cap: number,
): void {
  const id = world.createEntity();
  const sceneKey = `res-${resourceCounter++}`;
  world.addComponent(id, PositionType, { x, z });
  world.addComponent(id, HealthType, { current: cap, max: cap });
  world.addComponent(id, AliveType, {});
  world.addComponent(id, OwnerType, { faction: Faction.Human, playerId: 'neutral' as never });
  world.addComponent(id, ResourceNodeType, {
    kind,
    remaining: cap,
    capacity: cap,
    assignedWorkers: 0,
    maxEffectiveWorkers: kind === 'gold' ? 5 : 3,
  });
  world.addComponent(id, RenderableType, { sceneKey, visible: true });

  // Immediate procedural fallback
  let object3d: THREE.Object3D;
  if (kind === 'gold') {
    object3d = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.0),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0x553300,
        emissiveIntensity: 0.4,
        roughness: 0.3,
      }),
    );
    object3d.position.set(x, 1.0, z);
  } else {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 0.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a }),
    );
    trunk.position.y = 0.4;
    group.add(trunk);

    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a7a2a, roughness: 0.8 }),
    );
    canopy.position.y = 1.2;
    group.add(canopy);
    group.position.set(x, 0, z);
    object3d = group;
  }

  object3d.userData['entityId'] = id;
  sceneManager.addObject(sceneKey, object3d);

  // Async: swap in Kenney 3D model when loaded
  loadResourceModel(kind).then((model) => {
    if (model) {
      model.position.set(x, 0, z);
      model.userData['entityId'] = id;
      sceneManager.removeObject(sceneKey);
      sceneManager.addObject(sceneKey, model);
    }
  }).catch(() => { /* keep procedural fallback */ });
}
