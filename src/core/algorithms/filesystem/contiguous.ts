/**
 * OScope — Contiguous File Allocation Engine
 * Pure implementation of contiguous block allocation with external and internal fragmentation accounting.
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
 * Allocates a file contiguously on the virtual disk using the First-Fit contiguous policy.
 */
export function allocateContiguous(
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

  // Calculate required data blocks (minimum 1 block for extents)
  const blocksNeeded = Math.max(1, Math.ceil(sizeBytes / state.blockSizeBytes));
  const analysis = analyzeFreeRuns(state.diskBlocks);

  // Search for the first contiguous free run with length >= blocksNeeded
  const suitableRun = analysis.runs.find((r) => r.length >= blocksNeeded);

  if (!suitableRun) {
    // Check if external fragmentation is the blocking culprit
    const isBlockedByExternalFrag = analysis.totalFreeBlocks >= blocksNeeded;
    const reason = isBlockedByExternalFrag
      ? `CONTIGUOUS ALLOCATION FAILED: File "${fileName}" requires ${blocksNeeded} consecutive blocks (${sizeBytes} bytes). Total free blocks on disk: ${analysis.totalFreeBlocks}, but the largest contiguous free extent is only ${analysis.largestFreeRun} blocks. Allocation is BLOCKED BY EXTERNAL FRAGMENTATION.`
      : `CONTIGUOUS ALLOCATION FAILED: Insufficient total storage. File requires ${blocksNeeded} blocks, but only ${analysis.totalFreeBlocks} free blocks remain on disk.`;

    return Object.freeze({
      success: false,
      fileName,
      strategy: 'CONTIGUOUS',
      allocatedBlockNumbers: Object.freeze([]),
      updatedFileSystemState: state,
      fragmentation: Object.freeze({
        internalBytes: 0,
        externalFreeBlocks: analysis.totalFreeBlocks,
        largestFreeRun: analysis.largestFreeRun,
      }),
      reason,
    });
  }

  // Take the first blocksNeeded blocks from the suitable run
  const allocatedBlocks = suitableRun.blocks.slice(0, blocksNeeded);

  // Generate unique Inode number
  const existingInodes = Object.keys(state.inodes).map(Number);
  const nextInodeNumber = existingInodes.length > 0 ? Math.max(...existingInodes) + 1 : 1;

  // Calculate internal fragmentation
  const allocatedBytes = blocksNeeded * state.blockSizeBytes;
  const internalBytes = allocatedBytes - sizeBytes;

  // Create Inode
  const inode: Inode = Object.freeze({
    inodeNumber: nextInodeNumber,
    fileName,
    fileSizeBytes: sizeBytes,
    blockCount: blocksNeeded,
    allocationStrategy: 'CONTIGUOUS',
    directBlocks: Object.freeze([...allocatedBlocks]),
    internalFragmentationBytes: internalBytes,
    createdAt: currentTime,
  });

  // Update Disk Blocks
  const newDiskBlocks: DiskBlock[] = state.diskBlocks.map((b) => {
    if (allocatedBlocks.includes(b.blockNumber)) {
      return Object.freeze({
        ...b,
        isAllocated: true,
        role: 'DATA',
        fileId: `file-${nextInodeNumber}`,
        fileName,
        inodeNumber: nextInodeNumber,
        nextBlock: null,
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
    strategy: 'CONTIGUOUS',
    allocatedBlockNumbers: Object.freeze([...allocatedBlocks]),
    updatedFileSystemState: updatedState,
    fragmentation: Object.freeze({
      internalBytes,
      externalFreeBlocks: postAnalysis.totalFreeBlocks,
      largestFreeRun: postAnalysis.largestFreeRun,
    }),
    reason: `CONTIGUOUS ALLOCATION SUCCESS: Allocated ${blocksNeeded} consecutive blocks [${allocatedBlocks.join(', ')}] for file "${fileName}". Internal fragmentation: ${internalBytes} bytes in terminal block.`,
  });
}
