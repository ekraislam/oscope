/**
 * OScope — Linked File Allocation Engine
 * Pure implementation of linked block allocation with pointer chain maintenance and cycle verification.
 */

import type {
  FileSystemState,
  FileSpecification,
  FileAllocationResult,
  DiskBlock,
  Inode,
  DirectoryEntry,
} from '../../models/filesystem';
import { analyzeFreeRuns } from './disk';

/**
 * Validates the integrity of a linked block chain on disk.
 */
export function validateLinkedChain(
  diskBlocks: readonly DiskBlock[],
  headBlock: number,
  expectedCount: number
): { valid: boolean; visited: number[]; error?: string } {
  const visited: number[] = [];
  const seen = new Set<number>();
  let curr: number | null = headBlock;

  while (curr !== null && curr !== -1) {
    if (curr < 0 || curr >= diskBlocks.length) {
      return { valid: false, visited, error: `Invalid block pointer out of range: ${curr}` };
    }
    if (seen.has(curr)) {
      return { valid: false, visited, error: `Circular loop detected in linked chain at block ${curr}` };
    }

    seen.add(curr);
    visited.push(curr);

    const block: DiskBlock | undefined = diskBlocks[curr];
    if (!block || !block.isAllocated) {
      return { valid: false, visited, error: `Chain block ${curr} is unexpectedly missing or marked FREE` };
    }

    curr = block.nextBlock;
  }

  if (visited.length !== expectedCount) {
    return {
      valid: false,
      visited,
      error: `Chain length mismatch: visited ${visited.length} blocks, expected ${expectedCount}`,
    };
  }

  return { valid: true, visited };
}

/**
 * Allocates a file using the Linked Allocation strategy, distributing blocks across available free storage
 * and linking them via pointer offsets.
 */
export function allocateLinked(
  state: FileSystemState,
  spec: FileSpecification,
  currentTime = 0
): FileAllocationResult {
  const { fileName, sizeBytes } = spec;

  if (!fileName || fileName.trim().length === 0) {
    throw new Error('AllocationError: File name must not be empty.');
  }
  if (sizeBytes < 0 || isNaN(sizeBytes)) {
    throw new Error(`AllocationError: File size must be non-negative, got ${sizeBytes}`);
  }

  const blocksNeeded = Math.max(1, Math.ceil(sizeBytes / state.blockSizeBytes));
  const analysis = analyzeFreeRuns(state.diskBlocks);

  if (analysis.totalFreeBlocks < blocksNeeded) {
    return Object.freeze({
      success: false,
      fileName,
      strategy: 'LINKED',
      allocatedBlockNumbers: Object.freeze([]),
      updatedFileSystemState: state,
      fragmentation: Object.freeze({
        internalBytes: 0,
        externalFreeBlocks: analysis.totalFreeBlocks,
        largestFreeRun: analysis.largestFreeRun,
      }),
      reason: `LINKED ALLOCATION FAILED: Insufficient disk space. File requires ${blocksNeeded} blocks, but only ${analysis.totalFreeBlocks} free blocks remain.`,
    });
  }

  // Select the first blocksNeeded free blocks (they can be scattered non-contiguously!)
  const allocatedBlocks = analysis.freeBlocks.slice(0, blocksNeeded);

  // Generate unique Inode number
  const existingInodes = Object.keys(state.inodes).map(Number);
  const nextInodeNumber = existingInodes.length > 0 ? Math.max(...existingInodes) + 1 : 1;

  // Calculate internal fragmentation
  const allocatedBytes = blocksNeeded * state.blockSizeBytes;
  const internalBytes = allocatedBytes - sizeBytes;

  // Create Inode (head pointer is allocatedBlocks[0], all blocks tracked in directBlocks)
  const inode: Inode = Object.freeze({
    inodeNumber: nextInodeNumber,
    fileName,
    fileSizeBytes: sizeBytes,
    blockCount: blocksNeeded,
    allocationStrategy: 'LINKED',
    directBlocks: Object.freeze([...allocatedBlocks]),
    internalFragmentationBytes: internalBytes,
    createdAt: currentTime,
  });

  // Build block map: each block points to the next block, last block points to -1 (EOF)
  const nextBlockMap = new Map<number, number>();
  for (let i = 0; i < allocatedBlocks.length; i++) {
    const curr = allocatedBlocks[i];
    const nxt = i < allocatedBlocks.length - 1 ? allocatedBlocks[i + 1] : -1;
    nextBlockMap.set(curr, nxt);
  }

  // Update Disk Blocks
  const newDiskBlocks: DiskBlock[] = state.diskBlocks.map((b) => {
    if (allocatedBlocks.includes(b.blockNumber)) {
      const nextPtr = nextBlockMap.get(b.blockNumber) ?? -1;
      return Object.freeze({
        ...b,
        isAllocated: true,
        role: 'DATA',
        fileId: `file-${nextInodeNumber}`,
        fileName,
        inodeNumber: nextInodeNumber,
        nextBlock: nextPtr,
        isIndexBlock: false,
      });
    }
    return b;
  });

  // Target directory
  const targetDir = spec.directoryPath ?? state.currentDirectory;
  const fullPath = targetDir === '/' ? `/${fileName}` : `${targetDir}/${fileName}`;

  const newEntry: DirectoryEntry = Object.freeze({
    name: fileName,
    inodeNumber: nextInodeNumber,
    type: 'FILE',
    path: fullPath,
  });

  const updatedInodes = Object.freeze({
    ...state.inodes,
    [nextInodeNumber]: inode,
  });

  const updatedEntries = Object.freeze([...state.directoryEntries, newEntry]);
  const newFreeCount = newDiskBlocks.filter((b) => !b.isAllocated).length;
  const postAnalysis = analyzeFreeRuns(newDiskBlocks);

  const updatedState: FileSystemState = Object.freeze({
    ...state,
    freeBlocksCount: newFreeCount,
    diskBlocks: Object.freeze(newDiskBlocks),
    inodes: updatedInodes,
    directoryEntries: updatedEntries,
  });

  return Object.freeze({
    success: true,
    fileName,
    strategy: 'LINKED',
    allocatedBlockNumbers: Object.freeze([...allocatedBlocks]),
    updatedFileSystemState: updatedState,
    fragmentation: Object.freeze({
      internalBytes,
      externalFreeBlocks: postAnalysis.totalFreeBlocks,
      largestFreeRun: postAnalysis.largestFreeRun,
    }),
    reason: `LINKED ALLOCATION SUCCESS: Allocated ${blocksNeeded} scattered blocks in chain <${allocatedBlocks.join(' → ')} → EOF>. External fragmentation does not block allocation. Internal fragmentation: ${internalBytes} bytes.`,
  });
}
