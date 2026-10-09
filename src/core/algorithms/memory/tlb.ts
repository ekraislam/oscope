/**
 * OScope — Translation Lookaside Buffer (TLB) Engine
 * Models the hardware associative cache with LRU eviction and stale-entry invalidation.
 */

import type { TLBEntry } from '../../models/memory';

export interface TLBState {
  readonly capacity: number;
  readonly entries: readonly TLBEntry[];
}

/**
 * Initializes a new empty TLB cache with the configured capacity.
 */
export function createTLB(capacity: number): TLBState {
  if (capacity <= 0 || !Number.isInteger(capacity)) {
    throw new Error(`TLBError: Capacity must be a positive integer, received: ${capacity}`);
  }
  return Object.freeze({
    capacity,
    entries: Object.freeze([]),
  });
}

/**
 * Searches the TLB for a given page number.
 * If found (HIT), updates the entry's lastUsedTime for LRU accounting.
 * If not found (MISS), returns hit: false.
 */
export function lookupTLB(
  tlb: TLBState,
  pageNumber: number,
  accessTime: number
): {
  hit: boolean;
  entry: TLBEntry | null;
  updatedTLB: TLBState;
} {
  const existingIdx = tlb.entries.findIndex((e) => e.pageNumber === pageNumber);

  if (existingIdx !== -1) {
    // TLB HIT: Refresh lastUsedTime for LRU
    const hitEntry: TLBEntry = {
      ...tlb.entries[existingIdx],
      lastUsedTime: accessTime,
    };

    const nextEntries = [...tlb.entries];
    nextEntries[existingIdx] = hitEntry;

    return {
      hit: true,
      entry: Object.freeze(hitEntry),
      updatedTLB: Object.freeze({
        capacity: tlb.capacity,
        entries: Object.freeze(nextEntries),
      }),
    };
  }

  // TLB MISS
  return {
    hit: false,
    entry: null,
    updatedTLB: tlb,
  };
}

/**
 * Inserts or updates a page-to-frame translation in the TLB.
 * If capacity is exceeded, evicts the Least Recently Used (LRU) entry.
 */
export function insertTLB(
  tlb: TLBState,
  pageNumber: number,
  frameNumber: number,
  accessTime: number
): {
  evictedEntry: TLBEntry | null;
  updatedTLB: TLBState;
} {
  const existingIdx = tlb.entries.findIndex((e) => e.pageNumber === pageNumber);

  // If already present, just update frame and timestamp
  if (existingIdx !== -1) {
    const updated: TLBEntry = {
      pageNumber,
      frameNumber,
      lastUsedTime: accessTime,
    };
    const nextEntries = [...tlb.entries];
    nextEntries[existingIdx] = updated;

    return {
      evictedEntry: null,
      updatedTLB: Object.freeze({
        capacity: tlb.capacity,
        entries: Object.freeze(nextEntries),
      }),
    };
  }

  // If at capacity, evict the entry with the oldest lastUsedTime (LRU)
  let evicted: TLBEntry | null = null;
  let nextEntries = [...tlb.entries];

  if (nextEntries.length >= tlb.capacity) {
    // Find min lastUsedTime
    let lruIdx = 0;
    let minTime = nextEntries[0].lastUsedTime;

    for (let i = 1; i < nextEntries.length; i++) {
      if (nextEntries[i].lastUsedTime < minTime) {
        minTime = nextEntries[i].lastUsedTime;
        lruIdx = i;
      }
    }

    evicted = nextEntries[lruIdx];
    nextEntries.splice(lruIdx, 1);
  }

  const newEntry: TLBEntry = {
    pageNumber,
    frameNumber,
    lastUsedTime: accessTime,
  };
  nextEntries.push(newEntry);

  return {
    evictedEntry: evicted ? Object.freeze(evicted) : null,
    updatedTLB: Object.freeze({
      capacity: tlb.capacity,
      entries: Object.freeze(nextEntries),
    }),
  };
}

/**
 * Purges an entry from the TLB by page number.
 * CRITICAL for Stale-TLB Safety: Must be invoked whenever a page is evicted
 * from physical memory so stale mappings are never returned.
 */
export function invalidateTLBEntry(tlb: TLBState, pageNumber: number): TLBState {
  const filtered = tlb.entries.filter((e) => e.pageNumber !== pageNumber);
  if (filtered.length === tlb.entries.length) {
    return tlb; // No change
  }
  return Object.freeze({
    capacity: tlb.capacity,
    entries: Object.freeze(filtered),
  });
}

/**
 * Clears all entries from the TLB.
 */
export function flushTLB(tlb: TLBState): TLBState {
  return Object.freeze({
    capacity: tlb.capacity,
    entries: Object.freeze([]),
  });
}
