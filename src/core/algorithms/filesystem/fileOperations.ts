/**
 * OScope — File System Lifecycle Operations Engine
 * Pure file creation, deletion, directory management, and block reclamation.
 */

import type {
  FileSystemState,
  FileSpecification,
  AllocationStrategy,
  FileAllocationResult,
  DiskBlock,
  DirectoryEntry,
} from '../../models/filesystem';
import { allocateContiguous } from './contiguous';
import { allocateLinked } from './linked';
import { allocateIndexed } from './indexed';

/**
 * Creates a file in the virtual file system according to the specified allocation strategy.
 */
export function createFile(
  state: FileSystemState,
  spec: FileSpecification,
  strategy: AllocationStrategy,
  currentTime = 0
): FileAllocationResult {
  const targetDir = spec.directoryPath ?? state.currentDirectory;
  const fullPath = targetDir === '/' ? `/${spec.fileName}` : `${targetDir}/${spec.fileName}`;

  // Validate for duplicate filenames in the same directory
  const exists = state.directoryEntries.some(
    (e) => e.path.toLowerCase() === fullPath.toLowerCase()
  );

  if (exists) {
    return Object.freeze({
      success: false,
      fileName: spec.fileName,
      strategy,
      allocatedBlockNumbers: Object.freeze([]),
      updatedFileSystemState: state,
      fragmentation: Object.freeze({
        internalBytes: 0,
        externalFreeBlocks: state.freeBlocksCount,
        largestFreeRun: 0,
      }),
      reason: `FILE CREATION FAILED: A file or directory with path "${fullPath}" already exists.`,
    });
  }

  switch (strategy) {
    case 'CONTIGUOUS':
      return allocateContiguous(state, spec, currentTime);
    case 'LINKED':
      return allocateLinked(state, spec, currentTime);
    case 'INDEXED':
      return allocateIndexed(state, spec, currentTime);
    default:
      throw new Error(`Unsupported allocation strategy: ${strategy}`);
  }
}

/**
 * Deletes a file from the virtual file system, freeing all data blocks and any index blocks,
 * removing its Inode, and clearing the directory entry.
 */
export function deleteFile(
  state: FileSystemState,
  targetPathOrName: string
): { success: boolean; updatedState: FileSystemState; freedBlocks: number[]; reason: string } {
  // Find directory entry
  const entryIndex = state.directoryEntries.findIndex(
    (e) =>
      e.path === targetPathOrName ||
      e.name === targetPathOrName ||
      e.path === `/${targetPathOrName}`
  );

  if (entryIndex === -1) {
    return {
      success: false,
      updatedState: state,
      freedBlocks: [],
      reason: `File "${targetPathOrName}" not found in file system.`,
    };
  }

  const entry = state.directoryEntries[entryIndex];
  const inode = state.inodes[entry.inodeNumber];

  if (!inode) {
    return {
      success: false,
      updatedState: state,
      freedBlocks: [],
      reason: `Corrupted state: Inode #${entry.inodeNumber} for file "${entry.name}" does not exist.`,
    };
  }

  // Identify all blocks to free: direct data blocks + index block if INDEXED
  const blocksToFree = new Set<number>(inode.directBlocks);
  if (inode.allocationStrategy === 'INDEXED' && inode.indexBlock !== undefined) {
    blocksToFree.add(inode.indexBlock);
  }

  // Update Disk Blocks: reclaim freed blocks
  const newDiskBlocks: DiskBlock[] = state.diskBlocks.map((b) => {
    if (blocksToFree.has(b.blockNumber)) {
      return Object.freeze({
        blockNumber: b.blockNumber,
        isAllocated: false,
        role: 'FREE',
        fileId: null,
        fileName: null,
        inodeNumber: null,
        nextBlock: null,
        isIndexBlock: false,
      });
    }
    return b;
  });

  // Remove Inode
  const newInodes = { ...state.inodes };
  delete newInodes[entry.inodeNumber];

  // Remove Directory Entry
  const newEntries = state.directoryEntries.filter((_, idx) => idx !== entryIndex);
  const newFreeCount = newDiskBlocks.filter((b) => !b.isAllocated).length;

  const updatedState: FileSystemState = Object.freeze({
    ...state,
    freeBlocksCount: newFreeCount,
    diskBlocks: Object.freeze(newDiskBlocks),
    inodes: Object.freeze(newInodes),
    directoryEntries: Object.freeze(newEntries),
  });

  const freedBlockList = Array.from(blocksToFree).sort((a, b) => a - b);

  return {
    success: true,
    updatedState,
    freedBlocks: freedBlockList,
    reason: `DELETION SUCCESS: Removed file "${entry.name}" (Inode #${entry.inodeNumber}). Reclaimed ${freedBlockList.length} blocks [${freedBlockList.join(', ')}] back into the free storage pool.`,
  };
}

/**
 * Creates a directory in the virtual file system.
 */
export function createDirectory(
  state: FileSystemState,
  parentDir: string,
  dirName: string
): { success: boolean; updatedState: FileSystemState; reason: string } {
  if (!dirName || dirName.trim().length === 0) {
    return { success: false, updatedState: state, reason: 'Directory name must not be empty.' };
  }

  const fullPath = parentDir === '/' ? `/${dirName}` : `${parentDir}/${dirName}`;
  const exists = state.directoryEntries.some((e) => e.path.toLowerCase() === fullPath.toLowerCase());

  if (exists) {
    return { success: false, updatedState: state, reason: `Directory "${fullPath}" already exists.` };
  }

  // Allocate Inode for directory
  const existingInodes = Object.keys(state.inodes).map(Number);
  const nextInodeNumber = existingInodes.length > 0 ? Math.max(...existingInodes) + 1 : 1;

  const dirInode = Object.freeze({
    inodeNumber: nextInodeNumber,
    fileName: dirName,
    fileSizeBytes: 0,
    blockCount: 0,
    allocationStrategy: 'CONTIGUOUS' as AllocationStrategy,
    directBlocks: Object.freeze([]),
    internalFragmentationBytes: 0,
    createdAt: Date.now(),
  });

  const dirEntry: DirectoryEntry = Object.freeze({
    name: dirName,
    inodeNumber: nextInodeNumber,
    type: 'DIRECTORY',
    path: fullPath,
  });

  const updatedState: FileSystemState = Object.freeze({
    ...state,
    inodes: Object.freeze({ ...state.inodes, [nextInodeNumber]: dirInode }),
    directoryEntries: Object.freeze([...state.directoryEntries, dirEntry]),
  });

  return {
    success: true,
    updatedState,
    reason: `Created directory "${fullPath}" (Inode #${nextInodeNumber}).`,
  };
}
