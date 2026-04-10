/**
 * DecorScatter — places non-interactive decorative props on the map.
 *
 * All decor is visual only: no ECS components, no collision, no gameplay effect.
 * Uses procedural geometry (rocks, bushes) since no GLB model assets are available.
 */

import * as THREE from 'three';

interface DecorOptions {
  mapWidth: number;
  mapHeight: number;
  /** Tile positions to avoid (resource nodes, starting positions). */
  avoid: Array<{ x: number; z: number }>;
}

const MIN_DISTANCE = 3.5;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function tooClose(
  x: number,
  z: number,
  placed: Array<{ x: number; z: number }>,
  avoid: Array<{ x: number; z: number }>,
): boolean {
  for (const p of avoid) {
    if (Math.abs(p.x - x) < MIN_DISTANCE && Math.abs(p.z - z) < MIN_DISTANCE) return true;
  }
  for (const p of placed) {
    if (Math.abs(p.x - x) < MIN_DISTANCE && Math.abs(p.z - z) < MIN_DISTANCE) return true;
  }
  return false;
}

function makeSmallRock(): THREE.Mesh {
  const g = new THREE.DodecahedronGeometry(0.25, 0);
  const m = new THREE.MeshStandardMaterial({ color: 0x7a7a6a, roughness: 0.95 });
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeWideRock(): THREE.Group {
  const group = new THREE.Group();
  const g = new THREE.DodecahedronGeometry(0.45, 0);
  const m = new THREE.MeshStandardMaterial({ color: 0x6a6a5a, roughness: 0.95 });
  const mesh = new THREE.Mesh(g, m);
  mesh.scale.set(1.4, 0.6, 1.0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

function makeBush(): THREE.Mesh {
  const g = new THREE.SphereGeometry(0.35, 6, 4);
  const m = new THREE.MeshStandardMaterial({ color: 0x3a6a2a, roughness: 0.9 });
  const mesh = new THREE.Mesh(g, m);
  mesh.scale.set(1.0, 0.7, 1.0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function scatterDecor(scene: THREE.Scene, opts: DecorOptions): void {
  const { mapWidth, mapHeight, avoid } = opts;
  const rand = seededRandom(42);
  const placed: Array<{ x: number; z: number }> = [];
  const margin = 3;

  // Small rocks — 15-20 scattered on open grass
  for (let i = 0; i < 18; i++) {
    const x = margin + rand() * (mapWidth - margin * 2);
    const z = margin + rand() * (mapHeight - margin * 2);
    if (tooClose(x, z, placed, avoid)) continue;
    const rock = makeSmallRock();
    rock.position.set(x, 0.12, z);
    rock.rotation.y = rand() * Math.PI * 2;
    scene.add(rock);
    placed.push({ x, z });
  }

  // Wide rocks — 5-8 accent rocks
  for (let i = 0; i < 6; i++) {
    const x = margin + rand() * (mapWidth - margin * 2);
    const z = margin + rand() * (mapHeight - margin * 2);
    if (tooClose(x, z, placed, avoid)) continue;
    const rock = makeWideRock();
    rock.position.set(x, 0.15, z);
    rock.rotation.y = rand() * Math.PI * 2;
    scene.add(rock);
    placed.push({ x, z });
  }

  // Bushes along map edges — 12-15
  for (let i = 0; i < 14; i++) {
    let x: number, z: number;
    const side = Math.floor(rand() * 4);
    switch (side) {
      case 0:
        x = 1 + rand() * 2;
        z = margin + rand() * (mapHeight - margin * 2);
        break;
      case 1:
        x = mapWidth - 1 - rand() * 2;
        z = margin + rand() * (mapHeight - margin * 2);
        break;
      case 2:
        x = margin + rand() * (mapWidth - margin * 2);
        z = 1 + rand() * 2;
        break;
      default:
        x = margin + rand() * (mapWidth - margin * 2);
        z = mapHeight - 1 - rand() * 2;
        break;
    }
    if (tooClose(x, z, placed, avoid)) continue;
    const bush = makeBush();
    bush.position.set(x, 0.2, z);
    bush.rotation.y = rand() * Math.PI * 2;
    scene.add(bush);
    placed.push({ x, z });
  }
}
