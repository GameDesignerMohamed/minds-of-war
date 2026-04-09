/**
 * BinaryHeap — generic min-heap for O(log n) push/pop.
 *
 * Used by A* to maintain the open set with efficient extraction of the
 * lowest-f-score node. Replaces the O(n) Map-scan pattern from the prototype.
 *
 * The heap is array-backed (standard binary heap layout):
 *   - Parent of index i: Math.floor((i - 1) / 2)
 *   - Left child of i:   2 * i + 1
 *   - Right child of i:  2 * i + 2
 *
 * All operations are in-place and zero-allocation beyond the internal array
 * growth, which uses standard JS array push (amortised O(1)).
 *
 * @module pathfinding/BinaryHeap
 */

// ---------------------------------------------------------------------------
// BinaryHeap
// ---------------------------------------------------------------------------

/**
 * Generic min-heap keyed by a caller-supplied score function.
 *
 * The item with the *lowest* score is always at the top (index 0) and is
 * returned by {@link pop}.
 *
 * @template T - The element type stored in the heap.
 *
 * @example
 * const heap = new BinaryHeap<Node>(n => n.f);
 * heap.push(nodeA);
 * heap.push(nodeB);
 * const best = heap.pop(); // node with lowest f
 */
export class BinaryHeap<T> {
  private readonly _data: T[] = [];
  private readonly _score: (item: T) => number;

  /**
   * @param scoreFunction - Returns the priority value for an item.
   *   Lower values are dequeued first.
   */
  constructor(scoreFunction: (item: T) => number) {
    this._score = scoreFunction;
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Inserts an item into the heap.
   *
   * Time complexity: O(log n).
   *
   * @param item - The item to insert.
   */
  push(item: T): void {
    this._data.push(item);
    this._siftUp(this._data.length - 1);
  }

  /**
   * Removes and returns the item with the lowest score.
   *
   * Returns `undefined` if the heap is empty.
   *
   * Time complexity: O(log n).
   */
  pop(): T | undefined {
    if (this._data.length === 0) {
      return undefined;
    }

    // Swap root with last element, shrink array, then restore heap property.
    const top = this._data[0];
    const last = this._data.pop()!;

    if (this._data.length > 0) {
      this._data[0] = last;
      this._siftDown(0);
    }

    return top;
  }

  /** Number of items currently in the heap. */
  get size(): number {
    return this._data.length;
  }

  /** Removes all items from the heap. */
  clear(): void {
    this._data.length = 0;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  /**
   * Restores the heap property upward from `index` toward the root.
   * Called after inserting at the bottom.
   */
  private _siftUp(index: number): void {
    const item = this._data[index];
    const itemScore = this._score(item);

    while (index > 0) {
      const parentIndex = (index - 1) >> 1; // Math.floor((index - 1) / 2)
      const parent = this._data[parentIndex];

      if (itemScore >= this._score(parent)) {
        // Heap property satisfied.
        break;
      }

      // Swap parent down.
      this._data[index] = parent;
      index = parentIndex;
    }

    this._data[index] = item;
  }

  /**
   * Restores the heap property downward from `index` toward the leaves.
   * Called after moving the last element to the root during pop.
   */
  private _siftDown(index: number): void {
    const length = this._data.length;
    const item = this._data[index];
    const itemScore = this._score(item);

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;
      let smallestScore = itemScore;

      if (left < length) {
        const ls = this._score(this._data[left]);
        if (ls < smallestScore) {
          smallest = left;
          smallestScore = ls;
        }
      }

      if (right < length) {
        const rs = this._score(this._data[right]);
        if (rs < smallestScore) {
          smallest = right;
        }
      }

      if (smallest === index) {
        // Heap property satisfied.
        break;
      }

      // Swap smallest child up.
      this._data[index] = this._data[smallest];
      this._data[smallest] = item;
      index = smallest;
    }
  }
}
