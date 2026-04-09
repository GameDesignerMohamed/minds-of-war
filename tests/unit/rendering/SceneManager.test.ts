import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { SceneManager } from '../../../src/rendering/SceneManager';

describe('SceneManager', () => {
  it('uses the provided THREE.Scene instance as its backing scene', () => {
    const threeScene = new THREE.Scene();
    const manager = new SceneManager(threeScene);

    expect(manager.threeScene).toBe(threeScene);
    expect(threeScene.children.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps the injected scene in sync with object registration and removal', () => {
    const threeScene = new THREE.Scene();
    const manager = new SceneManager(threeScene);
    const meshA = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    const meshB = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());

    manager.addObject('unit-1', meshA);
    expect(threeScene.children).toContain(meshA);
    expect(manager.getObject('unit-1')).toBe(meshA);

    manager.addObject('unit-1', meshB);
    expect(threeScene.children).not.toContain(meshA);
    expect(threeScene.children).toContain(meshB);
    expect(manager.getObject('unit-1')).toBe(meshB);

    manager.removeObject('unit-1');
    expect(threeScene.children).not.toContain(meshB);
    expect(manager.getObject('unit-1')).toBeUndefined();
  });
});
