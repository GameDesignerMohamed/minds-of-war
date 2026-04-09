import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameLoop } from '@/core/GameLoop';

type ScheduledFrame = (timestamp: number) => void;

describe('GameLoop', () => {
  let scheduledFrames: ScheduledFrame[];
  let nextHandle: number;
  let requestAnimationFrameSpy: ReturnType<typeof vi.fn>;
  let cancelAnimationFrameSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scheduledFrames = [];
    nextHandle = 1;
    requestAnimationFrameSpy = vi.fn((callback: ScheduledFrame) => {
      scheduledFrames.push(callback);
      return nextHandle++;
    });
    cancelAnimationFrameSpy = vi.fn();

    vi.stubGlobal('requestAnimationFrame', requestAnimationFrameSpy);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function runNextFrame(timestamp: number): void {
    const callback = scheduledFrames.shift();
    if (callback === undefined) {
      throw new Error('Expected a scheduled animation frame');
    }
    callback(timestamp);
  }

  it('accumulates frame time until enough has elapsed for a fixed tick', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1_000);

    const updates = vi.fn();
    const renders = vi.fn();
    const loop = new GameLoop({ tickRate: 0.05, maxFrameTime: 0.25 }, updates, renders);

    loop.start();

    expect(loop.isRunning).toBe(true);
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

    runNextFrame(1_020);
    expect(updates).not.toHaveBeenCalled();
    expect(renders.mock.lastCall?.[0]).toBeCloseTo(0.4);

    runNextFrame(1_040);
    expect(updates).not.toHaveBeenCalled();
    expect(renders.mock.lastCall?.[0]).toBeCloseTo(0.8);

    runNextFrame(1_060);
    expect(updates).toHaveBeenCalledTimes(1);
    expect(updates).toHaveBeenLastCalledWith(0.05);
    expect(renders.mock.lastCall?.[0]).toBeCloseTo(0.2);
  });

  it('processes multiple fixed ticks and clamps oversized frame deltas', () => {
    vi.spyOn(performance, 'now').mockReturnValue(2_000);

    const updates: number[] = [];
    const renders: number[] = [];
    const loop = new GameLoop(
      { tickRate: 0.05, maxFrameTime: 0.12 },
      (deltaTime) => updates.push(deltaTime),
      (alpha) => renders.push(alpha),
    );

    loop.start();
    runNextFrame(2_250);

    expect(updates).toEqual([0.05, 0.05]);
    expect(renders).toHaveLength(1);
    expect(renders[0]).toBeCloseTo(0.4);
  });

  it('clears accumulated time when stopped before restarting', () => {
    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(1_000);

    const updates = vi.fn();
    const loop = new GameLoop({ tickRate: 0.05, maxFrameTime: 0.25 }, updates);

    loop.start();
    runNextFrame(1_030);

    expect(updates).not.toHaveBeenCalled();

    loop.stop();

    expect(loop.isRunning).toBe(false);
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(2);

    nowSpy.mockReturnValue(2_000);
    loop.start();
    runNextFrame(2_020);

    expect(updates).not.toHaveBeenCalled();
  });
});
