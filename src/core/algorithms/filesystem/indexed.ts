/**
 * OScope — Indexed File Allocation Engine
 * Pure implementation of indexed block allocation accounting for dedicated index-block overhead and pointer limits.
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
 * Validates that an index block and its data blocks conform to indexed allocation invariants.
 */
export function validateIndexedPointers(
  diskBlocks: readonly DiskBlock[],
  indexBlockNum: number,
  dataBlocks: readonly number[]
): boolean {
  if (indexBlockNum < 0 || indexBlockNum >= diskBlocks.length) return false;
  const idxBlock = diskBlocks[indexBlockNum];
  if (!idxBlock.isAllocated || !idxBlock.isIndexBlock) return false;

  for (const bNum of dataBlocks) {
    if (bNum < 0 || bNum >= diskBlocks.length) return false;
    const b = diskBlocks[bNum];
    if (!b.isAllocated || b.isIndexBlock) return false;
  }

  return true;
}

/**
 * Allocates a file using the Indexed Allocation strategy.
 * Accounts for index-block storage overhead (data blocks + 1 index block) and enforces pointer capacity limits.
 */
export function allocateIndexed(
  state: FileSystemState,
  spec: FileSpecification,
  currentTime = 0,
  maxPointersPerIndex = 16
): FileAllocationResult {
  const { fileName, sizeBytes } = spec;

  if (!fileName || fileName.trim().length === 0) {
    throw new Error('AllocationError: File name must not be empty.');
  }
  if (sizeBytes < 0 || isNaN(sizeBytes)) {
    throw new Error(`AllocationError: File size must be non-negative, got ${sizeBytes}`);
  }

  const dataBlocksNeeded = Math.max(1, Math.ceil(sizeBytes / state.blockSizeBytes));

  // Check pointer capacity limit
  if (dataBlocksNeeded > maxPointersPerIndex) {
    const analysis = analyzeFreeRuns(state.diskBlocks);
    return Object.freeze({
      success: false,
      fileName,
      strategy: 'INDEXED',
      allocatedBlockNumbers: Object.freeze([]),
      updatedFileSystemState: state,
      fragmentation: Object.freeze({
        internalBytes: 0,
        externalFreeBlocks: analysis.totalFreeBlocks,
        largestFreeRun: analysis.largestFreeRun,
      }),
      reason: `INDEXED ALLOCATION FAILED: File requires ${dataBlocksNeeded} data blocks, exceeding index block pointer capacity limit (${maxPointersPerIndex} pointers). Single-level indexed allocation cannot represent this file.`,
    });
  }

  // Total blocks required = Data Blocks + 1 Index Block
  const totalBlocksNeeded = dataBlocksNeeded + 1;
  const analysis = analyzeFreeRuns(state.diskBlocks);

  if (analysis.totalFreeBlocks < totalBlocksNeeded) {
    return Object.freeze({
      success: false,
      fileName,
      strategy: 'INDEXED',
      allocatedBlockNumbers: Object.freeze([]),
      updatedFileSystemState: state,
      fragmentation: Object.freeze({
        internalBytes: 0,
        externalFreeBlocks: analysis.totalFreeBlocks,
        largestFreeRun: analysis.largestFreeRun,
      }),
      reason: `INDEXED ALLOCATION FAILED: Insufficient disk space. Requires ${totalBlocksNeeded} blocks (${dataBlocksNeeded} data + 1 index block overhead), but only ${analysis.totalFreeBlocks} free blocks remain.`,
    });
  }

  // Allocate first free block as the INDEX BLOCK, and subsequent blocks as DATA BLOCKS
  const candidateBlocks = analysis.freeBlocks.slice(0, totalBlocksNeeded);
  const indexBlockNum = candidateBlocks[0];
  const dataBlockNums = candidateBlocks.slice(1);

  // Generate unique Inode number
  const existingInodes = Object.keys(state.inodes).map(Number);
  const nextInodeNumber = existingInodes.length > 0 ? Math.max(...existingInodes) + 1 : 1;

  // Calculate internal fragmentation in data blocks
  const allocatedDataBytes = dataBlocksNeeded * state.blockSizeBytes;
  const internalBytes = allocatedDataBytes - sizeBytes;

  // Create Inode
  const inode: Inode = Object.freeze({
    inodeNumber: nextInodeNumber,
    fileName,
    fileSizeBytes: sizeBytes,
    blockCount: dataBlocksNeeded,
    allocationStrategy: 'INDEXED',
    directBlocks: Object.freeze([...dataBlockNums]),
    indexBlock: indexBlockNum,
    internalFragmentationBytes: internalBytes,
    createdAt: currentTime,
  });

  // Update Disk Blocks
  const newDiskBlocks: DiskBlock[] = state.diskBlocks.map((b) => {
    if (b.blockNumber === indexBlockNum) {
      return Object.freeze({
        ...b,
        isAllocated: true,
        role: 'INDEX',
        fileId: `file-${nextInodeNumber}`,
        fileName,
        inodeNumber: nextInodeNumber,
        nextBlock: null,
        isIndexBlock: true,
      });
    }
    if (dataBlockNums.includes(b.blockNumber)) {
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
    strategy: 'INDEXED',
    allocatedBlockNumbers: Object.freeze([...dataBlockNums]),
    indexBlockNumber: indexBlockNum,
    updatedFileSystemState: updatedState,
    fragmentation: Object.freeze({
      internalBytes,
      externalFreeBlocks: postAnalysis.totalFreeBlocks,
      largestFreeRun: postAnalysis.largestFreeRun,
    }),
    reason: `INDEXED ALLOCATION SUCCESS: Allocated Index Block #${indexBlockNum} pointing to data blocks [${dataBlockNums.join(', ')}]. Total space consumed: ${totalBlocksNeeded} blocks (including 1 index block metadata overhead). Internal fragmentation: ${internalBytes} bytes.`,
  });
}
