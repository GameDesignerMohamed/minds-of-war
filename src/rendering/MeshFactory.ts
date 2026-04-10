/**
 * MeshFactory — produces distinct Three.js meshes for each unit and building type.
 *
 * Uses composed primitives (cylinders, boxes, cones, spheres) to create
 * recognizable silhouettes per unit/building type. No textures needed —
 * the shapes themselves communicate what each entity is.
 *
 * @module rendering/MeshFactory
 */

import * as THREE from 'three';
import { getBuildingArt, getCharacterArt, getCharacterStateSheet } from '@/art/ArtLibrary';
import type {
  InitializedMapData,
  TerrainAtlasDefinition,
  TerrainTileDescriptor,
} from '@/map/MapInitializer';
import { Faction, TerrainType } from '@/types';

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------

const TERRAIN_COLORS: Record<TerrainType, number> = {
  [TerrainType.Grassland]: 0x5a8f3c,
  [TerrainType.Forest]: 0x2d5a27,
  [TerrainType.Cliff]: 0x7a6a55,
  [TerrainType.Road]: 0xb0a090,
};

const HUMAN_PRIMARY = 0x3366bb;
const HUMAN_SECONDARY = 0x6688cc;
const HUMAN_ACCENT = 0xccaa44;
const ORC_PRIMARY = 0x44882a;
const ORC_SECONDARY = 0x668844;
const ORC_ACCENT = 0xcc4422;

function factionColors(f: Faction) {
  return f === Faction.Human
    ? { primary: HUMAN_PRIMARY, secondary: HUMAN_SECONDARY, accent: HUMAN_ACCENT }
    : { primary: ORC_PRIMARY, secondary: ORC_SECONDARY, accent: ORC_ACCENT };
}

function mat(
  color: number,
  opts?: { emissive?: number; roughness?: number; metalness?: number },
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: opts?.emissive ?? 0x000000,
    roughness: opts?.roughness ?? 0.7,
    metalness: opts?.metalness ?? 0.0,
  });
}

// ---------------------------------------------------------------------------
// Shared geometry cache
// ---------------------------------------------------------------------------

const _geoCache = new Map<string, THREE.BufferGeometry>();

function geo(key: string, create: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = _geoCache.get(key);
  if (!g) {
    g = create();
    _geoCache.set(key, g);
  }
  return g;
}

interface TerrainBatch {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  positions: Array<{ x: number; z: number }>;
}

// ---------------------------------------------------------------------------
// MeshFactory
// ---------------------------------------------------------------------------

export class MeshFactory {
  private readonly _materials = new Map<string, THREE.MeshStandardMaterial>();
  private readonly _spriteMaterials = new Map<string, THREE.SpriteMaterial>();
  private readonly _textures = new Map<string, THREE.Texture>();

  static _enableShadows(obj: THREE.Object3D): void {
    obj.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  }

  // -------------------------------------------------------------------------
  // Terrain
  // -------------------------------------------------------------------------

  createTerrainLayer(mapData: InitializedMapData): THREE.Group {
    const terrainGroup = new THREE.Group();
    terrainGroup.name = 'terrain-layer';

    const batches = new Map<string, TerrainBatch>();
    for (const tile of mapData.terrainTiles) {
      const geometryKey = this._getTerrainGeometryKey(tile, mapData.terrainAtlas);
      const geometry = this._getTerrainGeometry(tile, mapData.terrainAtlas);
      const material = this._getTerrainMaterial(mapData.terrainAtlas, tile.terrain);
      const batchKey = `${geometryKey}|${material.uuid}`;

      let batch = batches.get(batchKey);
      if (!batch) {
        batch = {
          geometry,
          material,
          positions: [],
        };
        batches.set(batchKey, batch);
      }

      batch.positions.push({ x: tile.x, z: tile.z });
    }

    const matrix = new THREE.Matrix4();
    for (const batch of batches.values()) {
      const instancedMesh = new THREE.InstancedMesh(
        batch.geometry,
        batch.material,
        batch.positions.length,
      );
      instancedMesh.receiveShadow = true;
      instancedMesh.frustumCulled = false;

      for (let i = 0; i < batch.positions.length; i++) {
        const { x, z } = batch.positions[i];
        matrix.makeTranslation(x, 0, z);
        instancedMesh.setMatrixAt(i, matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      terrainGroup.add(instancedMesh);
    }

    return terrainGroup;
  }

  createTerrainTile(
    tile: TerrainTileDescriptor,
    terrainAtlas: TerrainAtlasDefinition | null,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      this._getTerrainGeometry(tile, terrainAtlas),
      this._getTerrainMaterial(terrainAtlas, tile.terrain),
    );
    mesh.position.set(tile.x, 0, tile.z);
    mesh.receiveShadow = true;
    return mesh;
  }

  // -------------------------------------------------------------------------
  // Units — each type has a distinct composed silhouette
  // -------------------------------------------------------------------------

  createUnitMesh(faction: Faction, unitId?: string): THREE.Object3D {
    const c = factionColors(faction);
    const id = unitId ?? 'generic';
    const sprite = this._createCharacterSprite(id);

    if (sprite !== null) {
      return sprite;
    }

    let mesh: THREE.Object3D;
    switch (id) {
      case 'peasant':
      case 'thrall':
        mesh = this._makeWorker(c);
        break;
      case 'footman':
      case 'grunt':
        mesh = this._makeMelee(c);
        break;
      case 'archer':
      case 'hunter':
        mesh = this._makeRanged(c);
        break;
      case 'knight':
      case 'berserker':
        mesh = this._makeMounted(c);
        break;
      case 'cleric':
      case 'shaman':
        mesh = this._makeCaster(c);
        break;
      case 'catapult':
      case 'war_catapult':
        mesh = this._makeSiege(c);
        break;
      case 'captain':
      case 'warlord':
        mesh = this._makeHero(c);
        break;
      default:
        mesh = this._makeMelee(c);
        break;
    }
    MeshFactory._enableShadows(mesh);
    return mesh;
  }

  private _makeWorker(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Body — short cylinder
    const body = new THREE.Mesh(
      geo('wcyl', () => new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8)),
      mat(c.secondary),
    );
    body.position.y = 0.35;
    g.add(body);
    // Head — sphere
    const head = new THREE.Mesh(
      geo('wsph', () => new THREE.SphereGeometry(0.18, 8, 6)),
      mat(0xddbb88),
    );
    head.position.y = 0.85;
    g.add(head);
    // Tool — small box (pickaxe/hammer)
    const tool = new THREE.Mesh(
      geo('wbox', () => new THREE.BoxGeometry(0.1, 0.5, 0.1)),
      mat(0x888888, { metalness: 0.5 }),
    );
    tool.position.set(0.35, 0.5, 0);
    tool.rotation.z = -0.3;
    g.add(tool);
    return g;
  }

  private _makeMelee(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Body — taller box
    const body = new THREE.Mesh(
      geo('mbod', () => new THREE.BoxGeometry(0.5, 0.9, 0.4)),
      mat(c.primary),
    );
    body.position.y = 0.45;
    g.add(body);
    // Head — sphere
    const head = new THREE.Mesh(
      geo('msph', () => new THREE.SphereGeometry(0.2, 8, 6)),
      mat(0xddbb88),
    );
    head.position.y = 1.05;
    g.add(head);
    // Shield — flat box on left
    const shield = new THREE.Mesh(
      geo('mshd', () => new THREE.BoxGeometry(0.08, 0.5, 0.4)),
      mat(c.accent, { metalness: 0.4 }),
    );
    shield.position.set(-0.35, 0.5, 0);
    g.add(shield);
    // Sword — thin cylinder on right
    const sword = new THREE.Mesh(
      geo('mswd', () => new THREE.CylinderGeometry(0.03, 0.03, 0.7, 4)),
      mat(0xcccccc, { metalness: 0.7 }),
    );
    sword.position.set(0.35, 0.6, 0);
    sword.rotation.z = -0.2;
    g.add(sword);
    return g;
  }

  private _makeRanged(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Slim body
    const body = new THREE.Mesh(
      geo('rbod', () => new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8)),
      mat(c.secondary),
    );
    body.position.y = 0.4;
    g.add(body);
    // Head
    const head = new THREE.Mesh(
      geo('rsph', () => new THREE.SphereGeometry(0.17, 8, 6)),
      mat(0xddbb88),
    );
    head.position.y = 0.95;
    g.add(head);
    // Bow — torus arc
    const bow = new THREE.Mesh(
      geo('rbow', () => new THREE.TorusGeometry(0.3, 0.025, 4, 8, Math.PI)),
      mat(0x8b6914),
    );
    bow.position.set(0.3, 0.55, 0);
    bow.rotation.y = Math.PI / 2;
    g.add(bow);
    return g;
  }

  private _makeMounted(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Horse body — wide box
    const horse = new THREE.Mesh(
      geo('hors', () => new THREE.BoxGeometry(0.5, 0.6, 0.9)),
      mat(0x8b6942),
    );
    horse.position.y = 0.3;
    g.add(horse);
    // Horse legs — 4 thin cylinders
    for (const [lx, lz] of [
      [-0.15, -0.3],
      [0.15, -0.3],
      [-0.15, 0.3],
      [0.15, 0.3],
    ]) {
      const leg = new THREE.Mesh(
        geo('hleg', () => new THREE.CylinderGeometry(0.04, 0.04, 0.3, 4)),
        mat(0x8b6942),
      );
      leg.position.set(lx, 0, lz);
      g.add(leg);
    }
    // Rider body
    const rider = new THREE.Mesh(
      geo('ridr', () => new THREE.BoxGeometry(0.35, 0.5, 0.3)),
      mat(c.primary),
    );
    rider.position.y = 0.85;
    g.add(rider);
    // Rider head
    const rhead = new THREE.Mesh(
      geo('rhdm', () => new THREE.SphereGeometry(0.15, 8, 6)),
      mat(0xddbb88),
    );
    rhead.position.y = 1.25;
    g.add(rhead);
    // Lance
    const lance = new THREE.Mesh(
      geo('lnce', () => new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4)),
      mat(0xaaaaaa, { metalness: 0.5 }),
    );
    lance.position.set(0.3, 0.9, 0.3);
    lance.rotation.x = -0.5;
    g.add(lance);
    return g;
  }

  private _makeCaster(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Robes — cone body
    const robe = new THREE.Mesh(
      geo('crob', () => new THREE.ConeGeometry(0.35, 0.9, 8)),
      mat(c.primary),
    );
    robe.position.y = 0.45;
    g.add(robe);
    // Head
    const head = new THREE.Mesh(
      geo('csph', () => new THREE.SphereGeometry(0.18, 8, 6)),
      mat(0xddbb88),
    );
    head.position.y = 1.0;
    g.add(head);
    // Pointy hat — small cone
    const hat = new THREE.Mesh(
      geo('chat', () => new THREE.ConeGeometry(0.2, 0.35, 6)),
      mat(c.accent),
    );
    hat.position.y = 1.3;
    g.add(hat);
    // Staff — glowing orb at top
    const staff = new THREE.Mesh(
      geo('cstf', () => new THREE.CylinderGeometry(0.03, 0.03, 1.1, 4)),
      mat(0x8b6914),
    );
    staff.position.set(0.35, 0.55, 0);
    g.add(staff);
    const orb = new THREE.Mesh(
      geo('corb', () => new THREE.SphereGeometry(0.1, 6, 4)),
      mat(0x44ffff, { emissive: 0x22aaaa }),
    );
    orb.position.set(0.35, 1.15, 0);
    g.add(orb);
    return g;
  }

  private _makeSiege(_c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Base — wide flat box
    const base = new THREE.Mesh(
      geo('sbas', () => new THREE.BoxGeometry(1.0, 0.3, 0.7)),
      mat(0x6a4a2a),
    );
    base.position.y = 0.15;
    g.add(base);
    // Wheels — 4 cylinders
    for (const [wx, wz] of [
      [-0.4, -0.35],
      [0.4, -0.35],
      [-0.4, 0.35],
      [0.4, 0.35],
    ]) {
      const wheel = new THREE.Mesh(
        geo('swhl', () => new THREE.CylinderGeometry(0.15, 0.15, 0.08, 8)),
        mat(0x4a3a2a),
      );
      wheel.position.set(wx, 0.15, wz);
      wheel.rotation.x = Math.PI / 2;
      g.add(wheel);
    }
    // Arm — angled beam
    const arm = new THREE.Mesh(
      geo('sarm', () => new THREE.BoxGeometry(0.12, 0.8, 0.12)),
      mat(0x6a4a2a),
    );
    arm.position.set(0, 0.6, 0);
    arm.rotation.z = 0.4;
    g.add(arm);
    // Counterweight
    const cw = new THREE.Mesh(
      geo('scw', () => new THREE.BoxGeometry(0.25, 0.25, 0.25)),
      mat(0x555555, { metalness: 0.3 }),
    );
    cw.position.set(-0.3, 0.9, 0);
    g.add(cw);
    return g;
  }

  private _makeHero(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Larger body
    const body = new THREE.Mesh(
      geo('hbod', () => new THREE.BoxGeometry(0.6, 1.1, 0.5)),
      mat(c.primary),
    );
    body.position.y = 0.55;
    g.add(body);
    // Head
    const head = new THREE.Mesh(
      geo('hhd', () => new THREE.SphereGeometry(0.22, 8, 6)),
      mat(0xddbb88),
    );
    head.position.y = 1.25;
    g.add(head);
    // Crown/helmet — small cylinder on top
    const crown = new THREE.Mesh(
      geo('hcrn', () => new THREE.CylinderGeometry(0.18, 0.22, 0.15, 8)),
      mat(c.accent, { metalness: 0.6 }),
    );
    crown.position.y = 1.48;
    g.add(crown);
    // Big shield
    const shield = new THREE.Mesh(
      geo('hshd', () => new THREE.BoxGeometry(0.1, 0.7, 0.5)),
      mat(c.accent, { metalness: 0.4 }),
    );
    shield.position.set(-0.4, 0.6, 0);
    g.add(shield);
    // Big sword
    const sword = new THREE.Mesh(
      geo('hswd', () => new THREE.CylinderGeometry(0.04, 0.04, 0.9, 4)),
      mat(0xeeeeee, { metalness: 0.8 }),
    );
    sword.position.set(0.4, 0.75, 0);
    sword.rotation.z = -0.15;
    g.add(sword);
    // Cape glow
    const cape = new THREE.Mesh(
      geo('hcap', () => new THREE.BoxGeometry(0.5, 0.8, 0.05)),
      mat(c.accent, { emissive: c.accent & 0x444444 }),
    );
    cape.position.set(0, 0.5, -0.28);
    g.add(cape);
    return g;
  }

  // -------------------------------------------------------------------------
  // Buildings — distinct per type
  // -------------------------------------------------------------------------

  createBuildingMesh(faction: Faction, buildingId?: string): THREE.Object3D {
    const c = factionColors(faction);
    const id = buildingId ?? 'generic';
    const sprite = this._createBuildingSprite(id);

    if (sprite !== null) {
      return sprite;
    }

    let mesh: THREE.Object3D;
    switch (id) {
      case 'keep':
      case 'stronghold':
        mesh = this._makeHQ(c);
        break;
      case 'farm':
      case 'war_hut':
        mesh = this._makeFarm(c);
        break;
      case 'barracks':
      case 'war_camp':
        mesh = this._makeBarracks(c);
        break;
      case 'archery_range':
      case 'beast_den':
        mesh = this._makeRange(c);
        break;
      case 'watch_tower':
      case 'watch_post':
        mesh = this._makeTower(c);
        break;
      case 'blacksmith':
      case 'war_forge':
        mesh = this._makeSmith(c);
        break;
      case 'sanctum':
      case 'spirit_lodge':
        mesh = this._makeTemple(c);
        break;
      case 'workshop':
      case 'siege_pit':
        mesh = this._makeWorkshop(c);
        break;
      default:
        mesh = this._makeBarracks(c);
        break;
    }
    MeshFactory._enableShadows(mesh);
    return mesh;
  }

  private _makeHQ(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Main building — large box
    const main = new THREE.Mesh(
      geo('hqm', () => new THREE.BoxGeometry(3, 2.0, 3)),
      mat(c.primary),
    );
    main.position.y = 1.0;
    g.add(main);
    // Tower — taller narrower box
    const tower = new THREE.Mesh(
      geo('hqt', () => new THREE.BoxGeometry(1.2, 1.5, 1.2)),
      mat(c.secondary),
    );
    tower.position.set(0.5, 2.75, 0.5);
    g.add(tower);
    // Roof cone
    const roof = new THREE.Mesh(
      geo('hqr', () => new THREE.ConeGeometry(1.0, 1.0, 4)),
      mat(c.accent),
    );
    roof.position.set(0.5, 3.8, 0.5);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    // Flag
    const flagPole = new THREE.Mesh(
      geo('hqfp', () => new THREE.CylinderGeometry(0.03, 0.03, 1.5, 4)),
      mat(0x888888),
    );
    flagPole.position.set(0.5, 4.55, 0.5);
    g.add(flagPole);
    const flag = new THREE.Mesh(
      geo('hqfl', () => new THREE.BoxGeometry(0.5, 0.3, 0.02)),
      mat(c.accent),
    );
    flag.position.set(0.75, 5.1, 0.5);
    g.add(flag);
    return g;
  }

  private _makeFarm(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Low building
    const main = new THREE.Mesh(
      geo('frmm', () => new THREE.BoxGeometry(2.0, 0.8, 2.0)),
      mat(c.secondary),
    );
    main.position.y = 0.4;
    g.add(main);
    // Triangular roof — use a custom geometry (stretched box rotated)
    const roof = new THREE.Mesh(
      geo('frmr', () => {
        const rg = new THREE.BoxGeometry(2.2, 0.1, 1.5);
        return rg;
      }),
      mat(0x8b5a2b),
    );
    roof.position.y = 0.95;
    roof.rotation.z = 0.3;
    g.add(roof);
    const roof2 = new THREE.Mesh(
      geo('frmr', () => new THREE.BoxGeometry(2.2, 0.1, 1.5)),
      mat(0x8b5a2b),
    );
    roof2.position.y = 0.95;
    roof2.rotation.z = -0.3;
    g.add(roof2);
    return g;
  }

  private _makeBarracks(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    const main = new THREE.Mesh(
      geo('brkm', () => new THREE.BoxGeometry(2.5, 1.5, 2.5)),
      mat(c.primary),
    );
    main.position.y = 0.75;
    g.add(main);
    // Flat top accent
    const top = new THREE.Mesh(
      geo('brkt', () => new THREE.BoxGeometry(2.7, 0.1, 2.7)),
      mat(c.accent),
    );
    top.position.y = 1.55;
    g.add(top);
    // Door
    const door = new THREE.Mesh(
      geo('brkd', () => new THREE.BoxGeometry(0.6, 0.9, 0.05)),
      mat(0x4a3a2a),
    );
    door.position.set(0, 0.45, 1.28);
    g.add(door);
    return g;
  }

  private _makeRange(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Open frame — walls
    const wall1 = new THREE.Mesh(
      geo('rngw', () => new THREE.BoxGeometry(0.15, 1.2, 2.0)),
      mat(c.secondary),
    );
    wall1.position.set(-1.0, 0.6, 0);
    g.add(wall1);
    const wall2 = new THREE.Mesh(
      geo('rngw', () => new THREE.BoxGeometry(0.15, 1.2, 2.0)),
      mat(c.secondary),
    );
    wall2.position.set(1.0, 0.6, 0);
    g.add(wall2);
    // Target
    const target = new THREE.Mesh(
      geo('rngt', () => new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12)),
      mat(0xcc2222),
    );
    target.position.set(0, 0.8, -0.95);
    target.rotation.x = Math.PI / 2;
    g.add(target);
    return g;
  }

  private _makeTower(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    const tower = new THREE.Mesh(
      geo('twrm', () => new THREE.BoxGeometry(1.0, 3.0, 1.0)),
      mat(c.primary),
    );
    tower.position.y = 1.5;
    g.add(tower);
    const cap = new THREE.Mesh(
      geo('twrc', () => new THREE.ConeGeometry(0.7, 0.8, 4)),
      mat(c.accent),
    );
    cap.position.y = 3.4;
    cap.rotation.y = Math.PI / 4;
    g.add(cap);
    return g;
  }

  private _makeSmith(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    const main = new THREE.Mesh(
      geo('smtm', () => new THREE.BoxGeometry(2.0, 1.2, 2.0)),
      mat(c.secondary),
    );
    main.position.y = 0.6;
    g.add(main);
    // Chimney
    const chimney = new THREE.Mesh(
      geo('smtc', () => new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8)),
      mat(0x555555),
    );
    chimney.position.set(0.6, 1.8, 0.6);
    g.add(chimney);
    // Glow from forge
    const glow = new THREE.Mesh(
      geo('smtg', () => new THREE.BoxGeometry(0.6, 0.4, 0.05)),
      mat(0xff6600, { emissive: 0xff3300 }),
    );
    glow.position.set(0, 0.3, 1.03);
    g.add(glow);
    return g;
  }

  private _makeTemple(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Cone-shaped main structure
    const main = new THREE.Mesh(
      geo('tmpm', () => new THREE.ConeGeometry(1.2, 2.5, 6)),
      mat(c.primary),
    );
    main.position.y = 1.25;
    g.add(main);
    // Orb at peak
    const orb = new THREE.Mesh(
      geo('tmpo', () => new THREE.SphereGeometry(0.25, 8, 6)),
      mat(0x44ffff, { emissive: 0x22aaaa }),
    );
    orb.position.y = 2.7;
    g.add(orb);
    return g;
  }

  private _makeWorkshop(c: { primary: number; secondary: number; accent: number }): THREE.Group {
    const g = new THREE.Group();
    // Wide low building
    const main = new THREE.Mesh(
      geo('wkpm', () => new THREE.BoxGeometry(3.0, 1.0, 2.0)),
      mat(c.secondary),
    );
    main.position.y = 0.5;
    g.add(main);
    // Crane arm protruding
    const arm = new THREE.Mesh(
      geo('wkpa', () => new THREE.BoxGeometry(0.1, 0.1, 1.5)),
      mat(0x6a4a2a),
    );
    arm.position.set(0.5, 1.3, -0.5);
    g.add(arm);
    const hook = new THREE.Mesh(
      geo('wkph', () => new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4)),
      mat(0x888888),
    );
    hook.position.set(0.5, 1.0, -1.2);
    g.add(hook);
    return g;
  }

  // -------------------------------------------------------------------------
  // Material cache
  // -------------------------------------------------------------------------

  private _getTerrainGeometryKey(
    tile: TerrainTileDescriptor,
    terrainAtlas: TerrainAtlasDefinition | null,
  ): string {
    if (!terrainAtlas || tile.atlasFrame === null) {
      return 'terrain-fallback-plane';
    }

    return `terrain-plane-${tile.atlasFrame.col}-${tile.atlasFrame.row}-${tile.rotationQuarterTurns}`;
  }

  private _getTerrainGeometry(
    tile: TerrainTileDescriptor,
    terrainAtlas: TerrainAtlasDefinition | null,
  ): THREE.BufferGeometry {
    const key = this._getTerrainGeometryKey(tile, terrainAtlas);

    return geo(key, () => {
      const geometry = new THREE.PlaneGeometry(1, 1);
      geometry.rotateX(-Math.PI / 2);

      if (terrainAtlas && tile.atlasFrame) {
        this._applyTerrainAtlasUVs(
          geometry,
          terrainAtlas,
          tile.atlasFrame.col,
          tile.atlasFrame.row,
          tile.rotationQuarterTurns,
        );
      }

      return geometry;
    });
  }

  private _applyTerrainAtlasUVs(
    geometry: THREE.BufferGeometry,
    terrainAtlas: TerrainAtlasDefinition,
    col: number,
    row: number,
    rotationQuarterTurns: 0 | 1 | 2 | 3,
  ): void {
    const uvs = geometry.getAttribute('uv');
    if (!(uvs instanceof THREE.BufferAttribute)) {
      return;
    }

    const cellWidth = 1 / terrainAtlas.columns;
    const cellHeight = 1 / terrainAtlas.rows;
    const insetU = cellWidth * 0.035;
    const insetV = cellHeight * 0.035;
    const left = col * cellWidth + insetU;
    const right = (col + 1) * cellWidth - insetU;
    const top = 1 - row * cellHeight - insetV;
    const bottom = 1 - (row + 1) * cellHeight + insetV;
    const centerU = (left + right) * 0.5;
    const centerV = (top + bottom) * 0.5;

    const atlasCorners = [
      { u: left, v: top },
      { u: right, v: top },
      { u: left, v: bottom },
      { u: right, v: bottom },
    ];

    for (let i = 0; i < atlasCorners.length; i++) {
      let { u, v } = atlasCorners[i];

      for (let turn = 0; turn < rotationQuarterTurns; turn++) {
        const deltaU = u - centerU;
        const deltaV = v - centerV;
        u = centerU + deltaV;
        v = centerV - deltaU;
      }

      uvs.setXY(i, u, v);
    }

    uvs.needsUpdate = true;
  }

  private _getTerrainMaterial(
    terrainAtlas: TerrainAtlasDefinition | null,
    terrain: TerrainType,
  ): THREE.MeshStandardMaterial {
    if (!terrainAtlas) {
      return this._getMat(`terrain-${terrain}`, TERRAIN_COLORS[terrain]);
    }

    const key = `terrain-atlas:${terrainAtlas.image}`;
    let material = this._materials.get(key);

    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this._getTexture(terrainAtlas.image),
        roughness: 1.0,
        metalness: 0.0,
      });
      this._materials.set(key, material);
    }

    return material;
  }

  private _getTexture(url: string): THREE.Texture {
    let texture = this._textures.get(url);

    if (!texture) {
      texture = new THREE.TextureLoader().load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      this._textures.set(url, texture);
    }

    return texture;
  }

  private _getTextureFrame(
    url: string,
    col: number,
    row: number,
    columns: number,
    rows: number,
  ): THREE.Texture {
    const key = `frame:${url}:${col}:${row}:${columns}:${rows}`;
    let texture = this._textures.get(key);

    if (!texture) {
      texture = this._getTexture(url).clone();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.repeat.set(1 / columns, 1 / rows);
      texture.offset.set(col / columns, 1 - (row + 1) / rows);
      texture.needsUpdate = true;
      this._textures.set(key, texture);
    }

    return texture;
  }

  private _createCharacterSprite(actorId: string): THREE.Sprite | null {
    const art = getCharacterArt(actorId);
    const idleSheet = getCharacterStateSheet(actorId, 'idle');
    if (art === null || idleSheet === null) {
      return null;
    }

    const texture = this._getTextureFrame(
      idleSheet.src,
      0,
      0,
      idleSheet.frameCount,
      idleSheet.rowCount,
    );
    const material = this._getSpriteMaterial(`character:${idleSheet.src}:0:0`, texture);
    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0);
    sprite.scale.set(art.worldScale.x, art.worldScale.y, 1);
    return sprite;
  }

  private _createBuildingSprite(buildingId: string): THREE.Sprite | null {
    const art = getBuildingArt(buildingId);
    if (art === null) {
      return null;
    }

    const material = this._getSpriteMaterial(
      `building:${art.sprite}`,
      this._getTexture(art.sprite),
    );
    const sprite = new THREE.Sprite(material);
    sprite.center.set(0.5, 0);
    sprite.scale.set(art.worldScale.x, art.worldScale.y, 1);
    return sprite;
  }

  private _getSpriteMaterial(key: string, texture: THREE.Texture): THREE.SpriteMaterial {
    let material = this._spriteMaterials.get(key);

    if (!material) {
      material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
      });
      this._spriteMaterials.set(key, material);
    }

    return material;
  }

  private _getMat(key: string, color: number): THREE.MeshStandardMaterial {
    let m = this._materials.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
      this._materials.set(key, m);
    }
    return m;
  }

  dispose(): void {
    for (const m of this._materials.values()) m.dispose();
    this._materials.clear();
    for (const material of this._spriteMaterials.values()) material.dispose();
    this._spriteMaterials.clear();
    for (const texture of this._textures.values()) texture.dispose();
    this._textures.clear();
    for (const g of _geoCache.values()) g.dispose();
    _geoCache.clear();
  }
}
