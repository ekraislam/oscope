/**
 * OScope — Page Table & Physical Frame Engine
 * Authoritative mapping between virtual pages and physical frames with validity flags and state tracking.
 */

import type { PageTableEntry, MemoryFrame } from '../../models/memory';

export interface PageTableState {
  readonly numPages: number;
  readonly entries: readonly PageTableEntry[];
}

export interface PhysicalMemoryState {
  readonly frameCount: number;
  readonly frames: readonly MemoryFrame[];
}

/**
 * Initializes a page table of size `numPages`, with optional initial mappings.
 */
export function createPageTable(
  numPages: number,
  initialMappings?: ReadonlyArray<{ page: number; frame: number }>
): PageTableState {
  if (numPages <= 0 || !Number.isInteger(numPages)) {
    throw new Error(`PageTableError: Number of pages must be a positive integer, received: ${numPages}`);
  }

  const map = new Map<number, number>();
  if (initialMappings) {
    for (const m of initialMappings) {
      map.set(m.page, m.frame);
    }
  }

  const entries: PageTableEntry[] = [];
  for (let p = 0; p < numPages; p++) {
    const isMapped = map.has(p);
    entries.push(
      Object.freeze({
        pageNumber: p,
        frameNumber: isMapped ? map.get(p)! : null,
        isValid: isMapped,
        isDirty: false,
        referenceBit: isMapped,
        lastAccessedTime: isMapped ? 0 : 0,
      })
    );
  }

  return Object.freeze({
    numPages,
    entries: Object.freeze(entries),
  });
}

/**
 * Initializes physical memory frames of size `frameCount`.
 */
export function createPhysicalMemory(
  frameCount: number,
  initialAllocations?: ReadonlyArray<{ frame: number; page: number; loadedAt?: number; lastAccess?: number }>
): PhysicalMemoryState {
  if (frameCount <= 0 || !Number.isInteger(frameCount)) {
    throw new Error(`PhysicalMemoryError: Frame count must be a positive integer, received: ${frameCount}`);
  }

  const frameMap = new Map<number, { page: number; loadedAt: number; lastAccess: number }>();
  if (initialAllocations) {
    for (const alloc of initialAllocations) {
      frameMap.set(alloc.frame, {
        page: alloc.page,
        loadedAt: alloc.loadedAt ?? 0,
        lastAccess: alloc.lastAccess ?? 0,
      });
    }
  }

  const frames: MemoryFrame[] = [];
  for (let f = 0; f < frameCount; f++) {
    const isOcc = frameMap.has(f);
    const details = frameMap.get(f);
    frames.push(
      Object.freeze({
        frameNumber: f,
        allocatedPage: isOcc && details ? details.page : null,
        owningPid: isOcc ? 'P1' : null,
        isOccupied: isOcc,
        loadedAtTime: isOcc && details ? details.loadedAt : 0,
        lastAccessTime: isOcc && details ? details.lastAccess : 0,
      })
    );
  }

  return Object.freeze({
    frameCount,
    frames: Object.freeze(frames),
  });
}

/**
 * Looks up a page in the page table. Returns the PageTableEntry or null if page number is out of bounds.
 */
export function lookupPageTable(
  pageTable: PageTableState,
  pageNumber: number,
  accessTime: number
): {
  entry: PageTableEntry | null;
  isValid: boolean;
  updatedPageTable: PageTableState;
} {
  if (pageNumber < 0 || pageNumber >= pageTable.numPages) {
    return { entry: null, isValid: false, updatedPageTable: pageTable };
  }

  const current = pageTable.entries[pageNumber];

  if (!current.isValid || current.frameNumber === null) {
    return { entry: current, isValid: false, updatedPageTable: pageTable };
  }

  // Update reference bit and last accessed time
  const updatedEntry: PageTableEntry = {
    ...current,
    referenceBit: true,
    lastAccessedTime: accessTime,
  };

  const nextEntries = [...pageTable.entries];
  nextEntries[pageNumber] = Object.freeze(updatedEntry);

  return {
    entry: Object.freeze(updatedEntry),
    isValid: true,
    updatedPageTable: Object.freeze({
      numPages: pageTable.numPages,
      entries: Object.freeze(nextEntries),
    }),
  };
}

/**
 * Finds the lowest-numbered free frame in physical memory, or returns null if full.
 */
export function findLowestFreeFrame(memory: PhysicalMemoryState): number | null {
  for (let f = 0; f < memory.frameCount; f++) {
    if (!memory.frames[f].isOccupied) {
      return f;
    }
  }
  return null;
}

/**
 * Maps a page to a physical frame, updating both the page table and physical memory.
 */
export function mapPageToFrame(
  pageTable: PageTableState,
  memory: PhysicalMemoryState,
  pageNumber: number,
  frameNumber: number,
  currentTime: number,
  owningPid: string = 'P1'
): {
  updatedPageTable: PageTableState;
  updatedMemory: PhysicalMemoryState;
} {
  if (pageNumber < 0 || pageNumber >= pageTable.numPages) {
    throw new Error(`PageTableError: Page number ${pageNumber} out of range [0, ${pageTable.numPages - 1}]`);
  }
  if (frameNumber < 0 || frameNumber >= memory.frameCount) {
    throw new Error(`PhysicalMemoryError: Frame number ${frameNumber} out of range [0, ${memory.frameCount - 1}]`);
  }

  // 1. Update Page Table
  const nextPTEntries = [...pageTable.entries];
  nextPTEntries[pageNumber] = Object.freeze({
    pageNumber,
    frameNumber,
    isValid: true,
    isDirty: false,
    referenceBit: true,
    lastAccessedTime: currentTime,
  });

  // 2. Update Physical Memory Frame
  const nextFrames = [...memory.frames];
  nextFrames[frameNumber] = Object.freeze({
    frameNumber,
    allocatedPage: pageNumber,
    owningPid,
    isOccupied: true,
    loadedAtTime: currentTime,
    lastAccessTime: currentTime,
  });

  return {
    updatedPageTable: Object.freeze({
      numPages: pageTable.numPages,
      entries: Object.freeze(nextPTEntries),
    }),
    updatedMemory: Object.freeze({
      frameCount: memory.frameCount,
      frames: Object.freeze(nextFrames),
    }),
  };
}

/**
 * Unmaps (evicts) a page from physical memory.
 * Invalidates the page-table entry and frees the frame.
 */
export function unmapPage(
  pageTable: PageTableState,
  memory: PhysicalMemoryState,
  pageNumber: number
): {
  evictedFrame: number | null;
  updatedPageTable: PageTableState;
  updatedMemory: PhysicalMemoryState;
} {
  if (pageNumber < 0 || pageNumber >= pageTable.numPages) {
    return { evictedFrame: null, updatedPageTable: pageTable, updatedMemory: memory };
  }

  const ptEntry = pageTable.entries[pageNumber];
  const frameNumber = ptEntry.frameNumber;

  // Invalidate page table entry
  const nextPTEntries = [...pageTable.entries];
  nextPTEntries[pageNumber] = Object.freeze({
    pageNumber,
    frameNumber: null,
    isValid: false,
    isDirty: false,
    referenceBit: false,
    lastAccessedTime: ptEntry.lastAccessedTime,
  });

  let nextFrames = memory.frames;
  if (frameNumber !== null && frameNumber >= 0 && frameNumber < memory.frameCount) {
    const framesCopy = [...memory.frames];
    framesCopy[frameNumber] = Object.freeze({
      frameNumber,
      allocatedPage: null,
      owningPid: null,
      isOccupied: false,
      loadedAtTime: 0,
      lastAccessTime: 0,
    });
    nextFrames = Object.freeze(framesCopy);
  }

  return {
    evictedFrame: frameNumber,
    updatedPageTable: Object.freeze({
      numPages: pageTable.numPages,
      entries: Object.freeze(nextPTEntries),
    }),
    updatedMemory: Object.freeze({
      frameCount: memory.frameCount,
      frames: nextFrames,
    }),
  };
}
