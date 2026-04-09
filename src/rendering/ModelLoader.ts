/**
 * ModelLoader — loads and caches GLB/GLTF models via Three.js GLTFLoader.
 *
 * Provides async model loading with a cache so each .glb file is only fetched
 * once. Returns cloned scenes for each request so callers get independent
 * instances they can position and scale freely.
 *
 * Building compositions:
 * Each game building type maps to 1-3 Kenney Fantasy Town Kit pieces
 * assembled into a single Group. The mapping is defined in BUILDING_RECIPES.
 *
 * @module rendering/ModelLoader
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModelPart {
  /** Path relative to /art/models/ */
  file: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

interface BuildingRecipe {
  parts: ModelPart[];
  /** Overall scale applied to the assembled group */
  scale: number;
}

// ---------------------------------------------------------------------------
// Building recipes — maps game building IDs to Kenney model compositions
// ---------------------------------------------------------------------------

/*
 *  BUILDING RECIPE COMPOSITION
 *  ═══════════════════════════════════════════
 *  Each building = wall base + roof + optional details
 *
 *  keep/stronghold:  wall-block × 4 + roof-high-point + banner
 *  barracks/war_camp: wall-block × 2 + roof-gable + door
 *  farm/war_hut:     wall-wood × 2 + roof + stall
 *  tower:            wall-corner × 4 (tall) + roof-point
 *  blacksmith/forge: wall-block + chimney + roof-gable
 *  archery_range:    fence × 2 + stall (open air)
 *  sanctum/lodge:    wall-block + roof-high-point (tall)
 *  workshop/pit:     wall-wood-block × 2 + roof-flat + cart
 */

/*
 * Kenney models are ~1 unit in size. Our game grid has tiles at 1 unit spacing.
 * Buildings should be 2-3 tiles wide. Units ~0.8 tiles tall.
 * Use single iconic models scaled up rather than composing many pieces.
 */

const BUILDING_RECIPES: Record<string, BuildingRecipe> = {
  keep: {
    parts: [
      { file: 'buildings/wall-block.glb', position: [-0.5, 0, -0.5] },
      { file: 'buildings/wall-block.glb', position: [0.5, 0, -0.5] },
      { file: 'buildings/wall-block.glb', position: [-0.5, 0, 0.5] },
      { file: 'buildings/wall-block.glb', position: [0.5, 0, 0.5] },
      { file: 'buildings/roof-high-point.glb', position: [0, 1, 0] },
      { file: 'buildings/banner-red.glb', position: [0.8, 1.5, 0] },
    ],
    scale: 2.5,
  },
  stronghold: {
    parts: [
      { file: 'buildings/wall-wood-block.glb', position: [-0.5, 0, -0.5] },
      { file: 'buildings/wall-wood-block.glb', position: [0.5, 0, -0.5] },
      { file: 'buildings/wall-wood-block.glb', position: [-0.5, 0, 0.5] },
      { file: 'buildings/wall-wood-block.glb', position: [0.5, 0, 0.5] },
      { file: 'buildings/roof-high-point.glb', position: [0, 1, 0] },
      { file: 'buildings/banner-green.glb', position: [0.8, 1.5, 0] },
    ],
    scale: 2.5,
  },
  barracks: {
    parts: [
      { file: 'buildings/wall-block.glb', position: [-0.5, 0, 0] },
      { file: 'buildings/wall-block.glb', position: [0.5, 0, 0] },
      { file: 'buildings/wall-door.glb', position: [0, 0, -0.5] },
      { file: 'buildings/roof-gable.glb', position: [0, 1, 0] },
    ],
    scale: 2.0,
  },
  war_camp: {
    parts: [
      { file: 'buildings/wall-wood-block.glb', position: [-0.5, 0, 0] },
      { file: 'buildings/wall-wood-block.glb', position: [0.5, 0, 0] },
      { file: 'buildings/wall-wood-door.glb', position: [0, 0, -0.5] },
      { file: 'buildings/roof-gable.glb', position: [0, 1, 0] },
    ],
    scale: 2.0,
  },
  farm: {
    parts: [
      { file: 'buildings/stall.glb', position: [0, 0, 0] },
      { file: 'buildings/fence.glb', position: [-0.8, 0, 0] },
    ],
    scale: 2.0,
  },
  war_hut: {
    parts: [
      { file: 'buildings/stall.glb', position: [0, 0, 0] },
    ],
    scale: 2.0,
  },
  watch_tower: {
    parts: [
      { file: 'buildings/wall-corner.glb', position: [0, 0, 0] },
      { file: 'buildings/wall-corner.glb', position: [0, 1, 0] },
      { file: 'buildings/roof-point.glb', position: [0, 2, 0] },
    ],
    scale: 1.5,
  },
  watch_post: {
    parts: [
      { file: 'buildings/wall-wood-corner.glb', position: [0, 0, 0] },
      { file: 'buildings/wall-wood-corner.glb', position: [0, 1, 0] },
      { file: 'buildings/roof-point.glb', position: [0, 2, 0] },
    ],
    scale: 1.5,
  },
  blacksmith: {
    parts: [
      { file: 'buildings/wall-block.glb', position: [0, 0, 0] },
      { file: 'buildings/chimney.glb', position: [0.5, 1, 0.3] },
      { file: 'buildings/roof-gable.glb', position: [0, 1, 0] },
    ],
    scale: 2.0,
  },
  war_forge: {
    parts: [
      { file: 'buildings/wall-wood-block.glb', position: [0, 0, 0] },
      { file: 'buildings/chimney.glb', position: [0.5, 1, 0.3] },
      { file: 'buildings/roof-gable.glb', position: [0, 1, 0] },
    ],
    scale: 2.0,
  },
  archery_range: {
    parts: [
      { file: 'buildings/fence.glb', position: [-0.5, 0, 0] },
      { file: 'buildings/fence.glb', position: [0.5, 0, 0] },
      { file: 'buildings/stall.glb', position: [0, 0, -0.5] },
    ],
    scale: 2.0,
  },
  beast_den: {
    parts: [
      { file: 'buildings/fence.glb', position: [-0.5, 0, 0] },
      { file: 'buildings/fence.glb', position: [0.5, 0, 0] },
      { file: 'buildings/stall.glb', position: [0, 0, -0.5] },
    ],
    scale: 2.0,
  },
  sanctum: {
    parts: [
      { file: 'buildings/wall-block.glb', position: [0, 0, 0] },
      { file: 'buildings/roof-high-point.glb', position: [0, 1, 0] },
    ],
    scale: 2.2,
  },
  spirit_lodge: {
    parts: [
      { file: 'buildings/wall-wood-block.glb', position: [0, 0, 0] },
      { file: 'buildings/roof-high-point.glb', position: [0, 1, 0] },
    ],
    scale: 2.2,
  },
  workshop: {
    parts: [
      { file: 'buildings/wall-block.glb', position: [0, 0, 0] },
      { file: 'buildings/roof-flat.glb', position: [0, 1, 0] },
      { file: 'buildings/cart.glb', position: [-1.0, 0, 0] },
    ],
    scale: 2.0,
  },
  siege_pit: {
    parts: [
      { file: 'buildings/wall-wood-block.glb', position: [0, 0, 0] },
      { file: 'buildings/roof-flat.glb', position: [0, 1, 0] },
      { file: 'buildings/cart.glb', position: [-1.0, 0, 0] },
    ],
    scale: 2.0,
  },
};

// ---------------------------------------------------------------------------
// Resource recipes
// ---------------------------------------------------------------------------

/*
 * Only trees get 3D models. Gold mines keep the procedural glowing
 * yellow octahedron — it's more readable as a game resource than
 * Kenney's gray rock model.
 */
const RESOURCE_RECIPES: Record<string, { parts: ModelPart[]; scale: number }> = {
  wood: {
    parts: [
      { file: 'buildings/tree.glb', position: [0, 0, 0] },
    ],
    scale: 2.5,
  },
};

// ---------------------------------------------------------------------------
// Character model mapping
// ---------------------------------------------------------------------------

const CHARACTER_MODELS: Record<string, string> = {
  peasant: 'characters/character-male-a.glb',
  thrall: 'characters/character-male-b.glb',
  footman: 'characters/character-male-c.glb',
  grunt: 'characters/character-male-d.glb',
  archer: 'characters/character-female-a.glb',
  hunter: 'characters/character-female-b.glb',
  knight: 'characters/character-male-e.glb',
  berserker: 'characters/character-male-f.glb',
  cleric: 'characters/character-female-c.glb',
  shaman: 'characters/character-female-d.glb',
  captain: 'characters/character-female-e.glb',
  warlord: 'characters/character-female-f.glb',
};

// ---------------------------------------------------------------------------
// ModelLoader
// ---------------------------------------------------------------------------

const loader = new GLTFLoader();
const modelCache = new Map<string, THREE.Group>();
const pendingLoads = new Map<string, Promise<THREE.Group>>();

async function loadModel(path: string): Promise<THREE.Group> {
  const cached = modelCache.get(path);
  if (cached) return cached.clone(true);

  const pending = pendingLoads.get(path);
  if (pending) {
    const result = await pending;
    return result.clone(true);
  }

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      `/art/models/${path}`,
      (gltf) => {
        // Use scene directly (not clone) — GLTFLoader already parsed textures
        const group = gltf.scene as THREE.Group;

        // Ensure materials use sRGB color space for correct rendering
        group.traverse((node) => {
          if (node instanceof THREE.Mesh && node.material) {
            const mat = node.material as THREE.MeshStandardMaterial;
            if (mat.map) {
              mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.map.needsUpdate = true;
            }
            mat.needsUpdate = true;
          }
        });

        console.log(`[ModelLoader] Loaded ${path}, children: ${group.children.length}`);
        modelCache.set(path, group);
        pendingLoads.delete(path);
        resolve(group);
      },
      undefined,
      (error) => {
        console.warn(`[ModelLoader] Failed to load ${path}:`, error);
        pendingLoads.delete(path);
        reject(error);
      },
    );
  });

  pendingLoads.set(path, promise);
  const result = await promise;
  return result.clone(true);
}

/**
 * Attempts to build a 3D model for the given building ID.
 * Returns null if no recipe exists (caller should fall back to procedural geometry).
 */
export async function loadBuildingModel(buildingId: string): Promise<THREE.Group | null> {
  const recipe = BUILDING_RECIPES[buildingId];
  if (!recipe) return null;

  const group = new THREE.Group();
  group.userData['modelType'] = 'building';
  group.userData['buildingId'] = buildingId;

  const partPromises = recipe.parts.map(async (part) => {
    try {
      const model = await loadModel(part.file);
      if (part.position) model.position.set(...part.position);
      if (part.rotation) model.rotation.set(...part.rotation);
      if (part.scale) model.scale.set(...part.scale);
      return model;
    } catch {
      console.warn(`Failed to load model part: ${part.file}`);
      return null;
    }
  });

  const parts = await Promise.all(partPromises);
  for (const part of parts) {
    if (part) group.add(part);
  }

  group.scale.setScalar(recipe.scale);
  return group;
}

/**
 * Attempts to load a character model for the given unit ID.
 * Returns null if no mapping exists.
 */
export async function loadCharacterModel(unitId: string): Promise<THREE.Group | null> {
  const modelPath = CHARACTER_MODELS[unitId];
  if (!modelPath) return null;

  try {
    const model = await loadModel(modelPath);
    model.userData['modelType'] = 'character';
    model.userData['unitId'] = unitId;
    model.scale.setScalar(1.8);
    return model;
  } catch {
    console.warn(`Failed to load character model: ${modelPath}`);
    return null;
  }
}

/**
 * Attempts to load a resource node model (gold mine or tree).
 * Returns null if no recipe exists.
 */
export async function loadResourceModel(kind: 'gold' | 'wood'): Promise<THREE.Group | null> {
  const recipe = RESOURCE_RECIPES[kind];
  if (!recipe) return null;

  const group = new THREE.Group();
  group.userData['modelType'] = 'resource';
  group.userData['resourceKind'] = kind;

  for (const part of recipe.parts) {
    try {
      const model = await loadModel(part.file);
      if (part.position) model.position.set(...part.position);
      group.add(model);
    } catch {
      console.warn(`Failed to load resource model: ${part.file}`);
      return null;
    }
  }

  group.scale.setScalar(recipe.scale);
  return group;
}

/** Preload all models used by building and character recipes. */
export async function preloadAllModels(): Promise<void> {
  const allPaths = new Set<string>();

  for (const recipe of Object.values(BUILDING_RECIPES)) {
    for (const part of recipe.parts) allPaths.add(part.file);
  }
  for (const path of Object.values(CHARACTER_MODELS)) {
    allPaths.add(path);
  }
  for (const recipe of Object.values(RESOURCE_RECIPES)) {
    for (const part of recipe.parts) allPaths.add(part.file);
  }

  const promises = [...allPaths].map(async (path) => {
    try {
      await loadModel(path);
    } catch {
      console.warn(`Preload failed: ${path}`);
    }
  });

  await Promise.all(promises);
}
