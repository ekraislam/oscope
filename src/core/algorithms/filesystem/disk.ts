/**
 * OScope — Virtual Disk Engine & Free-Run Analysis
 * Pure, deterministic storage representation and contiguous free-space analyzer.
 */

import type { DiskBlock, FileSystemState, FreeSpaceAnalysis, FreeRun } from '../../models/filesystem';

/**
 * Initializes a deterministic virtual disk state.
 */
export function createVirtualDisk(params: {
  totalBlocks: number;
  blockSizeBytes: number;
  initialBlocks?: readonly DiskBlock[];
  initialInodes?: Readonly<Record<number, any>>;
  initialEntries?: readonly any[];
  currentDirectory?: string;
}): FileSystemState {
  const { totalBlocks, blockSizeBytes, initialBlocks, initialInodes, initialEntries, currentDirectory } = params;

  if (totalBlocks <= 0 || !Number.isInteger(totalBlocks)) {
    throw new Error(`DiskError: totalBlocks must be a positive integer, received: ${totalBlocks}`);
  }
  if (blockSizeBytes <= 0 || !Number.isInteger(blockSizeBytes)) {
    throw new Error(`DiskError: blockSizeBytes must be a positive integer, received: ${blockSizeBytes}`);
  }

  let diskBlocks: DiskBlock[];

  if (initialBlocks && initialBlocks.length === totalBlocks) {
    diskBlocks = initialBlocks.map((b) => Object.freeze({ ...b }));
  } else {
    diskBlocks = [];
    for (let i = 0; i < totalBlocks; i++) {
      diskBlocks.push(
        Object.freeze({
          blockNumber: i,
          isAllocated: false,
          role: 'FREE',
          fileId: null,
          fileName: null,
          inodeNumber: null,
          nextBlock: null,
          isIndexBlock: false,
        })
      );
    }
  }

  const freeBlocksCount = diskBlocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks,
    blockSizeBytes,
    freeBlocksCount,
    diskBlocks: Object.freeze(diskBlocks),
    inodes: Object.freeze(initialInodes ?? {}),
    directoryEntries: Object.freeze(initialEntries ?? []),
    currentDirectory: currentDirectory ?? '/',
  });
}

/**
 * Analyzes the virtual disk to identify all free blocks, contiguous free extents (runs),
 * and the largest contiguous free run available.
 */
export function analyzeFreeRuns(diskBlocks: readonly DiskBlock[]): FreeSpaceAnalysis {
  const freeBlocks: number[] = [];
  const runs: FreeRun[] = [];

  let currentRunStart: number | null = null;
  let currentRunBlocks: number[] = [];

  for (let i = 0; i < diskBlocks.length; i++) {
    const block = diskBlocks[i];
    if (!block.isAllocated) {
      freeBlocks.push(block.blockNumber);

      if (currentRunStart === null) {
        currentRunStart = block.blockNumber;
        currentRunBlocks = [block.blockNumber];
      } else {
        currentRunBlocks.push(block.blockNumber);
      }
    } else {
      if (currentRunStart !== null) {
        runs.push(
          Object.freeze({
            startBlock: currentRunStart,
            length: currentRunBlocks.length,
            blocks: Object.freeze([...currentRunBlocks]),
          })
        );
        currentRunStart = null;
        currentRunBlocks = [];
      }
    }
  }

  // Push trailing run if disk ends with free blocks
  if (currentRunStart !== null) {
    runs.push(
      Object.freeze({
        startBlock: currentRunStart,
        length: currentRunBlocks.length,
        blocks: Object.freeze([...currentRunBlocks]),
      })
    );
  }

  let largestFreeRun = 0;
  for (const r of runs) {
    if (r.length > largestFreeRun) {
      largestFreeRun = r.length;
    }
  }

  return Object.freeze({
    totalFreeBlocks: freeBlocks.length,
    freeBlocks: Object.freeze(freeBlocks),
    runs: Object.freeze(runs),
    largestFreeRun,
  });
}
