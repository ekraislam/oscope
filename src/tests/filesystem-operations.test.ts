/**
 * OScope — File System Lifecycle Operations & Consistency Vitest Suite
 * Tests file creation, deletion, block reclamation and reuse, directory creation,
 * structural invariant audits, and verification of all 8 educational presets.
 */

import { describe, it, expect } from 'vitest';
import {
  createVirtualDisk,
  createFile,
  deleteFile,
  createDirectory,
  verifyFileSystemConsistency,
  FILESYSTEM_PRESETS,
} from '../core/algorithms/filesystem';
import type { FileSystemState } from '../core/models/filesystem';

describe('File Creation & Directory Operations', () => {
  it('creates files across directories and rejects duplicate filenames in the same directory', () => {
    let state = createVirtualDisk({ totalBlocks: 16, blockSizeBytes: 1024 });

    // Create /project.c
    const res1 = createFile(state, { fileName: 'project.c', sizeBytes: 1500 }, 'CONTIGUOUS');
    expect(res1.success).toBe(true);
    state = res1.updatedFileSystemState;

    // Attempt to create duplicate /project.c
    const dupRes = createFile(state, { fileName: 'project.c', sizeBytes: 1000 }, 'CONTIGUOUS');
    expect(dupRes.success).toBe(false);
    expect(dupRes.reason).toContain('already exists');

    // Create subdirectory /src
    const dirRes = createDirectory(state, '/', 'src');
    expect(dirRes.success).toBe(true);
    state = dirRes.updatedState;

    // Creating project.c inside /src should succeed (different path!)
    const subRes = createFile(
      state,
      { fileName: 'project.c', sizeBytes: 1000, directoryPath: '/src' },
      'LINKED'
    );
    expect(subRes.success).toBe(true);
    expect(subRes.strategy).toBe('LINKED');
  });

  it('rejects duplicate directory names', () => {
    let state = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const dir1 = createDirectory(state, '/', 'docs');
    expect(dir1.success).toBe(true);

    const dir2 = createDirectory(dir1.updatedState, '/', 'docs');
    expect(dir2.success).toBe(false);
    expect(dir2.reason).toContain('already exists');
  });
});

describe('File Deletion, Block Reclamation & Storage Reuse', () => {
  it('deletes a contiguous file and immediately reclaims all its blocks for reuse', () => {
    let state = createVirtualDisk({ totalBlocks: 10, blockSizeBytes: 1024 });

    // Allocate File A (Blocks 0..2)
    const fileA = createFile(state, { fileName: 'fileA.dat', sizeBytes: 3000 }, 'CONTIGUOUS');
    state = fileA.updatedFileSystemState;
    expect(fileA.allocatedBlockNumbers).toEqual([0, 1, 2]);
    expect(state.freeBlocksCount).toBe(7);

    // Allocate File B (Blocks 3..5)
    const fileB = createFile(state, { fileName: 'fileB.dat', sizeBytes: 3000 }, 'CONTIGUOUS');
    state = fileB.updatedFileSystemState;
    expect(fileB.allocatedBlockNumbers).toEqual([3, 4, 5]);
    expect(state.freeBlocksCount).toBe(4);

    // Delete File A -> should free blocks 0, 1, 2!
    const delA = deleteFile(state, '/fileA.dat');
    expect(delA.success).toBe(true);
    expect(delA.freedBlocks).toEqual([0, 1, 2]);
    state = delA.updatedState;
    expect(state.freeBlocksCount).toBe(7);

    // Blocks 0, 1, 2 must now be FREE
    expect(state.diskBlocks[0].role).toBe('FREE');
    expect(state.diskBlocks[1].role).toBe('FREE');
    expect(state.diskBlocks[2].role).toBe('FREE');

    // Allocate File C (size 3000 -> needs 3 blocks) -> should reuse vacated blocks 0, 1, 2!
    const fileC = createFile(state, { fileName: 'fileC.dat', sizeBytes: 3000 }, 'CONTIGUOUS');
    expect(fileC.success).toBe(true);
    expect(fileC.allocatedBlockNumbers).toEqual([0, 1, 2]); // Block reuse confirmed!
  });

  it('deletes an indexed file and reclaims both data blocks AND the dedicated index block', () => {
    let state = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });

    // Allocate Indexed file: 2 data blocks + 1 index block = 3 blocks total
    const file = createFile(state, { fileName: 'data.db', sizeBytes: 2000 }, 'INDEXED');
    expect(file.success).toBe(true);
    expect(file.allocatedBlockNumbers.length).toBe(2);
    expect(file.indexBlockNumber).toBeDefined();
    state = file.updatedFileSystemState;
    expect(state.freeBlocksCount).toBe(5);

    const indexBlock = file.indexBlockNumber!;
    const dataBlocks = file.allocatedBlockNumbers;

    // Delete file
    const del = deleteFile(state, '/data.db');
    expect(del.success).toBe(true);
    expect(del.freedBlocks).toContain(indexBlock); // Index block freed!
    dataBlocks.forEach((db) => expect(del.freedBlocks).toContain(db)); // Data blocks freed!
    expect(del.updatedState.freeBlocksCount).toBe(8); // All 8 blocks free again!

    // Verify index block is no longer marked INDEX
    expect(del.updatedState.diskBlocks[indexBlock].role).toBe('FREE');
    expect(del.updatedState.diskBlocks[indexBlock].isIndexBlock).toBe(false);
  });

  it('returns failure when attempting to delete a non-existent file', () => {
    const state = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const res = deleteFile(state, '/ghost.txt');
    expect(res.success).toBe(false);
    expect(res.reason).toContain('not found');
  });
});

describe('File System Consistency Auditor', () => {
  it('validates that a newly created disk is 100% consistent across all 6 invariants', () => {
    const state = createVirtualDisk({ totalBlocks: 16, blockSizeBytes: 1024 });
    const audit = verifyFileSystemConsistency(state);

    expect(audit.isConsistent).toBe(true);
    expect(audit.errors.length).toBe(0);
    expect(audit.checks.length).toBe(6);
    expect(audit.checks.every((c) => c.passed)).toBe(true);
  });

  it('detects orphaned directory entries that point to non-existent Inodes', () => {
    const state = createVirtualDisk({
      totalBlocks: 8,
      blockSizeBytes: 1024,
      initialEntries: [{ name: 'orphan.txt', inodeNumber: 999, type: 'FILE', path: '/orphan.txt' }],
    });

    const audit = verifyFileSystemConsistency(state);
    expect(audit.isConsistent).toBe(false);
    expect(audit.errors.some((e) => e.includes('references non-existent Inode #999'))).toBe(true);
  });

  it('detects block ownership conflicts (two files claiming the same physical block)', () => {
    const disk = createVirtualDisk({ totalBlocks: 8, blockSizeBytes: 1024 });
    const corruptedInodes = {
      1: {
        inodeNumber: 1,
        fileName: 'fileA.txt',
        fileSizeBytes: 1024,
        blockCount: 1,
        allocationStrategy: 'CONTIGUOUS' as const,
        directBlocks: [3], // Block 3 claimed
        internalFragmentationBytes: 0,
        createdAt: 10,
      },
      2: {
        inodeNumber: 2,
        fileName: 'fileB.txt',
        fileSizeBytes: 1024,
        blockCount: 1,
        allocationStrategy: 'CONTIGUOUS' as const,
        directBlocks: [3], // Block 3 ALSO claimed!
        internalFragmentationBytes: 0,
        createdAt: 20,
      },
    };

    const corruptedDisk: FileSystemState = {
      ...disk,
      inodes: corruptedInodes,
      directoryEntries: [
        { name: 'fileA.txt', inodeNumber: 1, type: 'FILE', path: '/fileA.txt' },
        { name: 'fileB.txt', inodeNumber: 2, type: 'FILE', path: '/fileB.txt' },
      ],
    };

    const audit = verifyFileSystemConsistency(corruptedDisk);
    expect(audit.isConsistent).toBe(false);
    expect(audit.errors.some((e) => e.includes('Block #3 is claimed simultaneously by multiple Inodes'))).toBe(true);
  });
});

describe('Educational Presets Invariant Verification', () => {
  it('confirms all 8 educational presets pass structural consistency audits', () => {
    expect(FILESYSTEM_PRESETS.length).toBe(8);

    for (const preset of FILESYSTEM_PRESETS) {
      const audit = verifyFileSystemConsistency(preset.state);
      expect(
        audit.isConsistent,
        `Preset "${preset.name}" failed consistency audit: ${audit.errors.join('; ')}`
      ).toBe(true);
      expect(audit.errors.length).toBe(0);
    }
  });
});
