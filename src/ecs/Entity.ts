/**
 * ECS Entity — lightweight ID allocation and reclamation.
 *
 * An entity is nothing more than a unique number. This module provides the
 * {@link EntityManager} class that hands out IDs, recycles destroyed ones via a
 * free list, and tracks the current live-entity count.
 *
 * Design notes:
 * - IDs start at 1; 0 is reserved as the "null entity" sentinel.
 * - Destroyed IDs are pushed onto a free list and reissued before the high-water
 *   mark advances, keeping ID values small.
 * - No Map or Set is allocated here — component storage lives in {@link World}.
 */

import type { EntityId } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The sentinel value that represents "no entity". Never issued to live entities. */
export const NULL_ENTITY: EntityId = 0;

// ---------------------------------------------------------------------------
// EntityManager
// ---------------------------------------------------------------------------

/**
 * Manages the lifecycle of entity IDs: creation, destruction, and recycling.
 *
 * Inject this into {@link World}; do not access it from gameplay code directly.
 */
export class EntityManager {
  /** Monotonically increasing high-water mark; next ID when free list is empty. */
  private _nextId: EntityId = 1;

  /** Recycled IDs available for reuse before advancing `_nextId`. */
  private readonly _freeList: EntityId[] = [];

  /** Count of currently live (non-destroyed) entities. */
  private _liveCount: number = 0;

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Creates a new entity and returns its unique ID.
   *
   * Prefers recycled IDs from the free list; only advances the high-water mark
   * when the list is empty. O(1) amortised.
   *
   * @returns A unique {@link EntityId} greater than {@link NULL_ENTITY}.
   */
  create(): EntityId {
    let id: EntityId;
    if (this._freeList.length > 0) {
      // Safe cast: we just checked length > 0.
      id = this._freeList.pop() as EntityId;
    } else {
      id = this._nextId++;
    }
    this._liveCount++;
    return id;
  }

  /**
   * Marks an entity as destroyed and recycles its ID for future use.
   *
   * Callers are responsible for removing all components from the entity before
   * (or after) calling this — {@link World.destroyEntity} handles that concern.
   *
   * @param id - The entity to destroy. Silently ignored if equal to
   *   {@link NULL_ENTITY} or already destroyed (idempotent for safety).
   */
  destroy(id: EntityId): void {
    if (id === NULL_ENTITY) {
      return;
    }
    this._freeList.push(id);
    this._liveCount = Math.max(0, this._liveCount - 1);
  }

  /**
   * Returns whether a given ID is valid and non-null.
   *
   * Note: this is a lightweight check (id > 0 and < nextId) and does NOT
   * confirm the entity has not been destroyed. Authoritative liveness comes
   * from component presence checked through {@link World}.
   *
   * @param id - The entity ID to validate.
   */
  isValid(id: EntityId): boolean {
    return id > NULL_ENTITY && id < this._nextId;
  }

  /** Returns the number of currently live entities. */
  get liveCount(): number {
    return this._liveCount;
  }

  /**
   * Resets the manager to its initial state.
   *
   * Intended for use between game sessions or in test teardown. Does NOT notify
   * systems — callers must ensure the {@link World} is also cleared.
   */
  reset(): void {
    this._nextId = 1;
    this._freeList.length = 0;
    this._liveCount = 0;
  }
}
