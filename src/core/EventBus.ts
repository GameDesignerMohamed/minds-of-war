/**
 * Core EventBus — type-safe publish/subscribe message broker.
 *
 * Provides decoupled cross-system communication without direct dependencies
 * between systems. Listeners subscribe to typed event topics; publishers emit
 * events without knowing who is listening.
 *
 * Design notes:
 * - Generic over an `EventMap` type parameter so the compiler enforces that
 *   emitted payloads match the declared shape for each topic key.
 * - Listener arrays are cloned before iteration so handlers added or removed
 *   during dispatch do not cause iteration errors.
 * - Subscriptions return an unsubscribe handle ({@link Unsubscribe}) for
 *   clean teardown without needing to retain the original callback reference.
 * - No static singleton — callers create and inject instances.
 *
 * @example
 * // Declare your event map:
 * interface GameEvents {
 *   unitDied:   { entityId: number; killedBy: number };
 *   goldChanged:{ playerId: string; amount: number };
 * }
 *
 * const bus = new EventBus<GameEvents>();
 * const unsub = bus.on('unitDied', (e) => console.log(e.entityId));
 * bus.emit('unitDied', { entityId: 42, killedBy: 7 });
 * unsub(); // remove listener
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A map of event topic keys to their payload types.
 *
 * Implement this interface in your game module to get full type inference:
 * ```ts
 * interface GameEvents extends EventMap {
 *   unitDied: { entityId: number };
 * }
 * ```
 */
export type EventMap = Record<string, unknown>;

/** A typed listener callback for a single event topic. */
export type EventListener<T> = (payload: T) => void;

/** Calling this function removes the associated listener from the bus. */
export type Unsubscribe = () => void;

// ---------------------------------------------------------------------------
// EventBus
// ---------------------------------------------------------------------------

/**
 * Type-safe publish/subscribe event bus.
 *
 * @typeParam TMap - Record type mapping topic keys to their payload shapes.
 */
export class EventBus<TMap extends { [K in keyof TMap]: unknown } = any> {
  private readonly _listeners: Map<keyof TMap, EventListener<unknown>[]> = new Map();

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Subscribes a listener to the specified event topic.
   *
   * The same listener may be registered multiple times on the same topic and
   * will be called once per registration per emit.
   *
   * @param topic    - The event topic key to listen for.
   * @param listener - Callback invoked when the topic is emitted.
   * @returns An {@link Unsubscribe} handle that removes this registration when called.
   */
  on<K extends keyof TMap>(topic: K, listener: EventListener<TMap[K]>): Unsubscribe {
    let listeners = this._listeners.get(topic);
    if (listeners === undefined) {
      listeners = [];
      this._listeners.set(topic, listeners);
    }
    listeners.push(listener as EventListener<unknown>);

    return () => this.off(topic, listener);
  }

  /**
   * Subscribes a listener that fires exactly once, then automatically removes itself.
   *
   * @param topic    - The event topic key to listen for.
   * @param listener - Callback invoked on the next emit of this topic.
   * @returns An {@link Unsubscribe} handle that cancels the one-time subscription.
   */
  once<K extends keyof TMap>(topic: K, listener: EventListener<TMap[K]>): Unsubscribe {
    const wrapper: EventListener<TMap[K]> = (payload) => {
      unsub();
      listener(payload);
    };
    const unsub = this.on(topic, wrapper);
    return unsub;
  }

  /**
   * Removes a specific listener from a topic.
   *
   * No-op if the listener is not currently registered for the topic.
   *
   * @param topic    - The event topic from which to remove the listener.
   * @param listener - The exact function reference that was passed to {@link on}.
   */
  off<K extends keyof TMap>(topic: K, listener: EventListener<TMap[K]>): void {
    const listeners = this._listeners.get(topic);
    if (listeners === undefined) {
      return;
    }
    const index = listeners.indexOf(listener as EventListener<unknown>);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emits an event, synchronously invoking all registered listeners for the topic.
   *
   * Listeners are called in subscription order. The listener array is cloned
   * before iteration so that listeners added or removed during dispatch do not
   * affect the current emit.
   *
   * @param topic   - The event topic to emit.
   * @param payload - The event payload, typed to the declared shape for this topic.
   */
  emit<K extends keyof TMap>(topic: K, payload: TMap[K]): void {
    const listeners = this._listeners.get(topic);
    if (listeners === undefined || listeners.length === 0) {
      return;
    }
    // Snapshot to avoid mutation-during-iteration issues.
    const snapshot = listeners.slice();
    for (const listener of snapshot) {
      listener(payload);
    }
  }

  /**
   * Removes all listeners for a given topic.
   *
   * @param topic - The topic whose listeners should be cleared.
   */
  clearTopic<K extends keyof TMap>(topic: K): void {
    this._listeners.delete(topic);
  }

  /**
   * Removes all listeners for all topics.
   *
   * Useful during world teardown or between game sessions.
   */
  clearAll(): void {
    this._listeners.clear();
  }

  /**
   * Returns the number of listeners currently registered for a topic.
   *
   * Primarily useful in tests to assert expected subscription counts.
   *
   * @param topic - The topic to inspect.
   */
  listenerCount<K extends keyof TMap>(topic: K): number {
    return this._listeners.get(topic)?.length ?? 0;
  }
}
