/**
 * OScope — File System Allocation Engines Academic Vitest Suite
 * Tests contiguous, linked, and indexed disk allocation algorithms,
 * external fragmentation detection, index block overhead accounting,
 * pointer validation, immutability, determinism, and access traces.
 */

import { describe, it, expect } from 'vitest';
import {
  createVirtualDisk,
  analyzeFreeRuns,
  allocateContiguous,
  allocateLinked,
  allocateIndexed,
  validateLinkedChain,
  validateIndexedPointers,
  previewAllocation,
  simulateBlockAccess,
} from '../core/algorithms/filesystem';
import type { FileSystemState, DiskBlock } from '../core/models/filesystem';

describe('Virtual Disk & Free-Run Analysis', () => {
  it('initializes a clean deterministic virtual disk with all blocks free', () => {
    const disk = createVirtualDisk({ totalBlocks: 16, blockSizeBytes: 1024 });
    expect(disk.totalBlocks).toBe(16);
    expect(disk.blockSizeBytes).toBe(1024);
    expect(disk.freeBlocksCount).toBe(16);
    expect(disk.diskBlocks.length).toBe(16);
    expect(disk.diskBlocks.every((b) => !b.isAllocated && b.role === 'FREE')).toBe(true);
  });

  it('accurately identifies free blocks, extents, and largest free run', () => {
    const disk = createVirtualDisk({ totalBlocks: 10, blockSizeBytes: 1024 });

    // Mark blocks 0, 1, 4, 7 as allocated
    const updatedBlocks: DiskBlock[] = disk.diskBlocks.map((b) => {
      if ([0, 1, 4, 7].includes(b.blockNumber)) {
        return {
          ...b,
          isAllocated: true,
          role: 'DATA' as const,
          fileId: 'test_file',
          fileName: 'test.dat',
          inodeNumber: 1,
        };
      }
      return b;
    });

    const analysis = analyzeFreeRuns(updatedBlocks);
    // Free blocks should be: 2, 3 (len 2), 5, 6 (len 2), 8, 9 (len 2)
    expect(analysis.totalFreeBlocks).toBe(6);
    expect(analysis.freeBlocks).toEqual([2, 3, 5, 6, 8, 9]);
    expect(analysis.runs.length).toBe(3);
    expect(analysis.runs[0].blocks).toEqual([2, 3]);
    expect(analysis.runs[1].blocks).toEqual([5, 6]);
    expect(analysis.runs[2].blocks).toEqual([8, 9]);
    expect(analysis.largestFreeRun).toBe(2);
  });
});

describe('Contiguous Allocation Engine', () => {
  it('allocates contiguous adjacent blocks on an empty disk', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const result = allocateContiguous(disk, { fileName: 'report.txt', sizeBytes: 2500 });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('CONTIGUOUS');
    expect(result.allocatedBlockNumbers).toEqual([0, 1, 2]); // ceil(2500/1024) = 3 blocks
    expect(result.fragmentation.internalBytes).toBe(3 * 1024 - 2500); // 572 bytes
    expect(result.updatedFileSystemState.freeBlocksCount).toBe(5);

    // Verify Inode creation
    const inode = result.updatedFileSystemState.inodes[1];
    expect(inode).toBeDefined();
    expect(inode.fileName).toBe('report.txt');
    expect(inode.directBlocks).toEqual([0, 1, 2]);
    expect(inode.internalFragmentationBytes).toBe(572);
  });

  it('fails with external fragmentation when total free blocks suffice but no run is long enough', () => {
    // Build a disk where total free = 4, but runs are [1, 2] and [5, 6] (largest run = 2)
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const fragmentedBlocks: DiskBlock[] = disk.diskBlocks.map((b) => {
      // Allocate 0, 3, 4, 7 -> Free are [1, 2] and [5, 6]
      if ([0, 3, 4, 7].includes(b.blockNumber)) {
        return {
          ...b,
          isAllocated: true,
          role: 'DATA' as const,
          fileId: 'other',
          fileName: 'other.dat',
          inodeNumber: 99,
        };
      }
      return b;
    });

    const fragmentedDisk: FileSystemState = {
      ...disk,
      freeBlocksCount: 4,
      diskBlocks: fragmentedBlocks,
    };

    // Request 3 blocks (size 3000) -> Needs run of 3, but largest run is 2
    const result = allocateContiguous(fragmentedDisk, { fileName: 'big.iso', sizeBytes: 3000 });

    expect(result.success).toBe(false);
    expect(result.allocatedBlockNumbers.length).toBe(0);
    expect(result.fragmentation.externalFreeBlocks).toBe(4);
    expect(result.fragmentation.largestFreeRun).toBe(2);
    expect(result.reason).toContain('EXTERNAL FRAGMENTATION');
  });

  it('preserves input disk immutability during contiguous allocation', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const originalFree = disk.freeBlocksCount;
    const originalBlocks = [...disk.diskBlocks];

    allocateContiguous(disk, { fileName: 'test.dat', sizeBytes: 1024 });

    expect(disk.freeBlocksCount).toBe(originalFree);
    expect(disk.diskBlocks).toEqual(originalBlocks);
  });

  it('produces deterministic output for identical contiguous inputs', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const res1 = allocateContiguous(disk, { fileName: 'sample.dat', sizeBytes: 2048 });
    const res2 = allocateContiguous(disk, { fileName: 'sample.dat', sizeBytes: 2048 });

    expect(res1.allocatedBlockNumbers).toEqual(res2.allocatedBlockNumbers);
    expect(res1.fragmentation).toEqual(res2.fragmentation);
  });
});

describe('Linked Allocation Engine', () => {
  it('allocates scattered non-contiguous blocks and creates valid pointer chain', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    // Simulate scattered free blocks by occupying 0, 1, 3
    const scatteredBlocks: DiskBlock[] = disk.diskBlocks.map((b) => {
      if ([0, 1, 3].includes(b.blockNumber)) {
        return {
          ...b,
          isAllocated: true,
          role: 'DATA' as const,
          fileId: 'pre_existing',
          fileName: 'pre.dat',
          inodeNumber: 5,
        };
      }
      return b;
    });

    const scatteredDisk: FileSystemState = {
      ...disk,
      freeBlocksCount: 5,
      diskBlocks: scatteredBlocks,
    };

    // Need 3 blocks (size 2500) -> Will allocate 2, 4, 5
    const result = allocateLinked(scatteredDisk, { fileName: 'linked_doc.pdf', sizeBytes: 2500 });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('LINKED');
    expect(result.allocatedBlockNumbers).toEqual([2, 4, 5]);

    const updatedBlocks = result.updatedFileSystemState.diskBlocks;
    // Block 2 -> points to 4
    expect(updatedBlocks[2].nextBlock).toBe(4);
    // Block 4 -> points to 5
    expect(updatedBlocks[4].nextBlock).toBe(5);
    // Block 5 -> EOF (-1)
    expect(updatedBlocks[5].nextBlock).toBe(-1);

    // Validation
    const validation = validateLinkedChain(updatedBlocks, 2, 3);
    expect(validation.valid).toBe(true);
    expect(validation.visited).toEqual([2, 4, 5]);
  });

  it('detects corrupted linked chain containing invalid pointer or loop', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const corruptedBlocks: DiskBlock[] = disk.diskBlocks.map((b) => {
      if (b.blockNumber === 1) return { ...b, isAllocated: true, nextBlock: 2 };
      if (b.blockNumber === 2) return { ...b, isAllocated: true, nextBlock: 1 }; // Loop 1 <-> 2
      return b;
    });

    const validation = validateLinkedChain(corruptedBlocks, 1, 2);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('loop');
  });
});

describe('Indexed Allocation Engine', () => {
  it('allocates dedicated index block plus data blocks and accounts for index overhead', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    // 2500 bytes -> ceil(2500/1024) = 3 data blocks + 1 index block = 4 total blocks!
    const result = allocateIndexed(disk, { fileName: 'database.db', sizeBytes: 2500 });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('INDEXED');
    expect(result.allocatedBlockNumbers.length).toBe(3); // 3 data blocks: [1, 2, 3]
    expect(result.indexBlockNumber).toBe(0); // Index block = 0
    expect(result.updatedFileSystemState.freeBlocksCount).toBe(8 - 4); // 4 blocks consumed!

    const indexBlock = result.updatedFileSystemState.diskBlocks[0];
    expect(indexBlock.role).toBe('INDEX');
    expect(indexBlock.isIndexBlock).toBe(true);

    const inode = result.updatedFileSystemState.inodes[1];
    expect(inode.indexBlock).toBe(0);
    expect(inode.directBlocks).toEqual([1, 2, 3]);

    const val = validateIndexedPointers(result.updatedFileSystemState.diskBlocks, 0, [1, 2, 3]);
    expect(val).toBe(true);
  });

  it('fails when disk has enough space for data but not for dedicated index block', () => {
    const disk = createVirtualDisk({ totalBlocks: 3, blockSizeBytes: 1024 });
    // Need 3 data blocks + 1 index block = 4 blocks total, but disk only has 3 blocks!
    const result = allocateIndexed(disk, { fileName: 'large.dat', sizeBytes: 3000 });

    expect(result.success).toBe(false);
    expect(result.reason).toContain('index block overhead');
  });
});

describe('Live Pre-allocation Preview Engine', () => {
  it('correctly previews candidate blocks without mutating disk state', () => {
    const disk = createVirtualDisk({ totalBlocks: 16, blockSizeBytes: 1024 });
    const prev = previewAllocation(disk, { fileName: 'test.bin', sizeBytes: 2048 }, 'CONTIGUOUS');

    expect(prev.canAllocate).toBe(true);
    expect(prev.dataBlocksNeeded).toBe(2);
    expect(prev.totalBlocksNeeded).toBe(2);
    expect(prev.candidateBlocks).toEqual([0, 1]);
    expect(prev.externalFragmentationBlocking).toBe(false);
    expect(disk.freeBlocksCount).toBe(16); // Untouched
  });

  it('previews external fragmentation blocking for contiguous allocation', () => {
    const disk = createVirtualDisk({ totalBlocks: 6, blockSizeBytes: 1024 });
    // Fill blocks 0, 2, 4 -> Free are 1, 3, 5 (Total free = 3, but largest run = 1)
    const blocks: DiskBlock[] = disk.diskBlocks.map((b) => {
      if ([0, 2, 4].includes(b.blockNumber)) {
        return { ...b, isAllocated: true, role: 'DATA' as const };
      }
      return b;
    });

    const fragDisk: FileSystemState = { ...disk, freeBlocksCount: 3, diskBlocks: blocks };
    const prev = previewAllocation(fragDisk, { fileName: 'run2.bin', sizeBytes: 2000 }, 'CONTIGUOUS');

    expect(prev.canAllocate).toBe(false);
    expect(prev.externalFragmentationBlocking).toBe(true);
    expect(prev.reason).toContain('External Fragmentation');
  });
});

describe('Storage Read Access Trace Simulator', () => {
  it('traces Contiguous access in exactly 1 direct offset step', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const alloc = allocateContiguous(disk, { fileName: 'app.exe', sizeBytes: 3000 });
    const state = alloc.updatedFileSystemState;

    // Logical block 2 should resolve to physical block 2 in 1 step
    const trace = simulateBlockAccess(state, 'app.exe', 2);
    expect(trace.strategy).toBe('CONTIGUOUS');
    expect(trace.logicalBlockIndex).toBe(2);
    expect(trace.physicalBlockNumber).toBe(2);
    expect(trace.totalSteps).toBe(1);
    expect(trace.steps[0].role).toBe('DATA');
  });

  it('traces Linked access through k+1 sequential pointer hops', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const alloc = allocateLinked(disk, { fileName: 'chain.txt', sizeBytes: 3000 });
    const state = alloc.updatedFileSystemState;

    // Direct blocks are [0, 1, 2] -> Logical index 2 requires 3 steps (0 -> 1 -> 2)
    const trace = simulateBlockAccess(state, 'chain.txt', 2);
    expect(trace.strategy).toBe('LINKED');
    expect(trace.logicalBlockIndex).toBe(2);
    expect(trace.physicalBlockNumber).toBe(2);
    expect(trace.totalSteps).toBe(3);
    expect(trace.steps[0].role).toBe('POINTER_TRAVERSAL');
    expect(trace.steps[1].role).toBe('POINTER_TRAVERSAL');
    expect(trace.steps[2].role).toBe('DATA');
  });

  it('traces Indexed access in 2 steps: index block lookup followed by direct data access', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const alloc = allocateIndexed(disk, { fileName: 'index_demo.db', sizeBytes: 2048 });
    const state = alloc.updatedFileSystemState;

    // Index block is 0, data blocks are [1, 2]
    // Accessing logical block 1 -> Step 1 reads Index Block 0, Step 2 reads Data Block 2
    const trace = simulateBlockAccess(state, 'index_demo.db', 1);
    expect(trace.strategy).toBe('INDEXED');
    expect(trace.logicalBlockIndex).toBe(1);
    expect(trace.physicalBlockNumber).toBe(2);
    expect(trace.totalSteps).toBe(2);
    expect(trace.steps[0].role).toBe('INDEX');
    expect(trace.steps[1].role).toBe('DATA');
  });
});
