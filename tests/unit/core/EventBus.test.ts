import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '@/core/EventBus';

interface TestEvents {
  unitCreated: { entityId: number };
  goldChanged: { playerId: string; amount: number };
}

describe('EventBus', () => {
  it('delivers emitted payloads to subscribed listeners in registration order', () => {
    const bus = new EventBus<TestEvents>();
    const deliveryOrder: string[] = [];

    const firstListener = vi.fn((payload: TestEvents['unitCreated']) => {
      deliveryOrder.push(`first:${payload.entityId}`);
    });
    const secondListener = vi.fn((payload: TestEvents['unitCreated']) => {
      deliveryOrder.push(`second:${payload.entityId}`);
    });

    bus.on('unitCreated', firstListener);
    bus.on('unitCreated', secondListener);

    bus.emit('unitCreated', { entityId: 7 });

    expect(firstListener).toHaveBeenCalledWith({ entityId: 7 });
    expect(secondListener).toHaveBeenCalledWith({ entityId: 7 });
    expect(deliveryOrder).toEqual(['first:7', 'second:7']);
    expect(bus.listenerCount('unitCreated')).toBe(2);
  });

  it('supports unsubscribe handles and snapshots listeners during dispatch', () => {
    const bus = new EventBus<TestEvents>();
    const deliveryOrder: string[] = [];
    let unsubscribeSecond: () => void = () => {};
    let addedLateListener = false;

    const lateListener = vi.fn((payload: TestEvents['goldChanged']) => {
      deliveryOrder.push(`late:${payload.amount}`);
    });
    const firstListener = vi.fn((payload: TestEvents['goldChanged']) => {
      deliveryOrder.push(`first:${payload.amount}`);
      unsubscribeSecond();
      if (!addedLateListener) {
        bus.on('goldChanged', lateListener);
        addedLateListener = true;
      }
    });
    const secondListener = vi.fn((payload: TestEvents['goldChanged']) => {
      deliveryOrder.push(`second:${payload.amount}`);
    });
    const onceListener = vi.fn((payload: TestEvents['goldChanged']) => {
      deliveryOrder.push(`once:${payload.amount}`);
    });

    bus.on('goldChanged', firstListener);
    unsubscribeSecond = bus.on('goldChanged', secondListener);
    bus.once('goldChanged', onceListener);

    bus.emit('goldChanged', { playerId: 'human', amount: 50 });
    bus.emit('goldChanged', { playerId: 'human', amount: 25 });

    expect(deliveryOrder).toEqual(['first:50', 'second:50', 'once:50', 'first:25', 'late:25']);
    expect(secondListener).toHaveBeenCalledTimes(1);
    expect(onceListener).toHaveBeenCalledTimes(1);
    expect(lateListener).toHaveBeenCalledTimes(1);
    expect(bus.listenerCount('goldChanged')).toBe(2);
  });
});
