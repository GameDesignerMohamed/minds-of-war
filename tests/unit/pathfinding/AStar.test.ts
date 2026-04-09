import { describe, it, expect } from 'vitest';
import { findPath } from '@/pathfinding/AStar';
import { TileGrid } from '@/map/TileGrid';

describe('AStar pathfinding', () => {
  it('finds straight path on open grid', () => {
    const grid = new TileGrid(10, 10);
    const path = findPath(grid, 0, 0, 5, 0);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    expect(path![0]).toEqual({ x: 0, z: 0 });
    expect(path![path!.length - 1]).toEqual({ x: 5, z: 0 });
  });

  it('finds path around obstacle', () => {
    const grid = new TileGrid(10, 10);
    // Block a wall at x=3, z=0-4
    for (let z = 0; z <= 4; z++) {
      grid.setWalkable(3, z, false);
    }
    const path = findPath(grid, 1, 2, 5, 2);
    expect(path).not.toBeNull();
    // Path should go around the wall (longer than straight line)
    expect(path!.length).toBeGreaterThan(5);
  });

  it('returns null for unreachable destination', () => {
    const grid = new TileGrid(10, 10);
    // Completely surround target
    for (let x = 4; x <= 6; x++) {
      for (let z = 4; z <= 6; z++) {
        if (x !== 5 || z !== 5) grid.setWalkable(x, z, false);
      }
    }
    const path = findPath(grid, 0, 0, 5, 5);
    expect(path).toBeNull();
  });

  it('returns path from start to end positions', () => {
    const grid = new TileGrid(20, 20);
    const path = findPath(grid, 2, 3, 15, 12);
    expect(path).not.toBeNull();
    expect(path![0].x).toBe(2);
    expect(path![0].z).toBe(3);
    const last = path![path!.length - 1];
    expect(last.x).toBe(15);
    expect(last.z).toBe(12);
  });
});
