/**
 * OScope — File System Educational Presets
 * Deterministic configurations illustrating fundamental storage allocation principles,
 * external fragmentation, pointer traversal, and index block overhead.
 */

import type {
  FileSystemState,
  DiskBlock,
  Inode,
  DirectoryEntry,
  AllocationStrategy,
} from '../../models/filesystem';

export interface FileSystemPreset {
  readonly id: string;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly academicFocus: string;
  readonly state: FileSystemState;
  readonly recommendedFileName?: string;
  readonly recommendedSizeBytes?: number;
  readonly recommendedStrategy?: AllocationStrategy;
}

const DEFAULT_BLOCK_SIZE = 1024;
const DEFAULT_TOTAL_BLOCKS = 32;

function createEmptyBlocks(total: number): DiskBlock[] {
  return Array.from({ length: total }, (_, i) =>
    Object.freeze({
      blockNumber: i,
      isAllocated: false,
      role: 'FREE' as const,
      fileId: null,
      fileName: null,
      inodeNumber: null,
      nextBlock: null,
      isIndexBlock: false,
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 1: Empty Disk
// ─────────────────────────────────────────────────────────────────────────────
function buildEmptyDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);
  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: DEFAULT_TOTAL_BLOCKS,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze({}),
    directoryEntries: Object.freeze([]),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2: Contiguous Allocation
// ─────────────────────────────────────────────────────────────────────────────
function buildContiguousDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File 1: kernel.sys (Blocks 0..3)
  for (let i = 0; i <= 3; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_1',
      fileName: 'kernel.sys',
      inodeNumber: 1,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File 2: boot.img (Blocks 4..7)
  for (let i = 4; i <= 7; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_2',
      fileName: 'boot.img',
      inodeNumber: 2,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File 3: readme.txt (Blocks 12..14)
  for (let i = 12; i <= 14; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_3',
      fileName: 'readme.txt',
      inodeNumber: 3,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'kernel.sys',
      fileSizeBytes: 3900,
      blockCount: 4,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([0, 1, 2, 3]),
      internalFragmentationBytes: 4 * 1024 - 3900,
      createdAt: 100,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'boot.img',
      fileSizeBytes: 4096,
      blockCount: 4,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([4, 5, 6, 7]),
      internalFragmentationBytes: 0,
      createdAt: 110,
    }),
    3: Object.freeze({
      inodeNumber: 3,
      fileName: 'readme.txt',
      fileSizeBytes: 2500,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([12, 13, 14]),
      internalFragmentationBytes: 3 * 1024 - 2500,
      createdAt: 120,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'kernel.sys', inodeNumber: 1, type: 'FILE', path: '/kernel.sys' }),
    Object.freeze({ name: 'boot.img', inodeNumber: 2, type: 'FILE', path: '/boot.img' }),
    Object.freeze({ name: 'readme.txt', inodeNumber: 3, type: 'FILE', path: '/readme.txt' }),
  ];

  const freeCount = blocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: freeCount,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3: External Fragmentation Case
// Total Free = 7 blocks, Largest Run = 2 blocks. Requesting 4 blocks FAILS!
// ─────────────────────────────────────────────────────────────────────────────
function buildExternalFragmentationDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File A (0..2)
  for (let i = 0; i <= 2; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_a',
      fileName: 'archive_A.bin',
      inodeNumber: 1,
      nextBlock: null,
      isIndexBlock: false,
    });
  }
  // Blocks 3, 4 are FREE (Run length = 2)

  // File B (5..7)
  for (let i = 5; i <= 7; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_b',
      fileName: 'archive_B.bin',
      inodeNumber: 2,
      nextBlock: null,
      isIndexBlock: false,
    });
  }
  // Blocks 8, 9 are FREE (Run length = 2)

  // File C (10..11)
  for (let i = 10; i <= 11; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_c',
      fileName: 'archive_C.bin',
      inodeNumber: 3,
      nextBlock: null,
      isIndexBlock: false,
    });
  }
  // Block 12 is FREE (Run length = 1)

  // File D (13..15)
  for (let i = 13; i <= 15; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_d',
      fileName: 'archive_D.bin',
      inodeNumber: 4,
      nextBlock: null,
      isIndexBlock: false,
    });
  }
  // Blocks 16, 17 are FREE (Run length = 2)

  // Remaining blocks 18..31 ALL ALLOCATED by system image
  for (let i = 18; i < 32; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'sys_core',
      fileName: 'system.img',
      inodeNumber: 5,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // Total free blocks = [3,4], [8,9], [12], [16,17] => 2 + 2 + 1 + 2 = 7 free blocks!
  // Largest run = 2.
  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'archive_A.bin',
      fileSizeBytes: 3000,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([0, 1, 2]),
      internalFragmentationBytes: 72,
      createdAt: 10,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'archive_B.bin',
      fileSizeBytes: 3000,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([5, 6, 7]),
      internalFragmentationBytes: 72,
      createdAt: 20,
    }),
    3: Object.freeze({
      inodeNumber: 3,
      fileName: 'archive_C.bin',
      fileSizeBytes: 2000,
      blockCount: 2,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([10, 11]),
      internalFragmentationBytes: 48,
      createdAt: 30,
    }),
    4: Object.freeze({
      inodeNumber: 4,
      fileName: 'archive_D.bin',
      fileSizeBytes: 3000,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([13, 14, 15]),
      internalFragmentationBytes: 72,
      createdAt: 40,
    }),
    5: Object.freeze({
      inodeNumber: 5,
      fileName: 'system.img',
      fileSizeBytes: 14 * 1024,
      blockCount: 14,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze(Array.from({ length: 14 }, (_, idx) => 18 + idx)),
      internalFragmentationBytes: 0,
      createdAt: 50,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'archive_A.bin', inodeNumber: 1, type: 'FILE', path: '/archive_A.bin' }),
    Object.freeze({ name: 'archive_B.bin', inodeNumber: 2, type: 'FILE', path: '/archive_B.bin' }),
    Object.freeze({ name: 'archive_C.bin', inodeNumber: 3, type: 'FILE', path: '/archive_C.bin' }),
    Object.freeze({ name: 'archive_D.bin', inodeNumber: 4, type: 'FILE', path: '/archive_D.bin' }),
    Object.freeze({ name: 'system.img', inodeNumber: 5, type: 'FILE', path: '/system.img' }),
  ];

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: 7,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 4: Linked Allocation
// Scattered blocks linked via pointers (block -> nextBlock)
// ─────────────────────────────────────────────────────────────────────────────
function buildLinkedDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File 1: report.docx -> 4 blocks: 2 -> 9 -> 17 -> 24 -> -1
  const chain1 = [2, 9, 17, 24];
  for (let i = 0; i < chain1.length; i++) {
    const bNum = chain1[i];
    const nextB = i < chain1.length - 1 ? chain1[i + 1] : -1;
    blocks[bNum] = Object.freeze({
      blockNumber: bNum,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_1',
      fileName: 'report.docx',
      inodeNumber: 1,
      nextBlock: nextB,
      isIndexBlock: false,
    });
  }

  // File 2: data.bin -> 3 blocks: 5 -> 12 -> 21 -> -1
  const chain2 = [5, 12, 21];
  for (let i = 0; i < chain2.length; i++) {
    const bNum = chain2[i];
    const nextB = i < chain2.length - 1 ? chain2[i + 1] : -1;
    blocks[bNum] = Object.freeze({
      blockNumber: bNum,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_2',
      fileName: 'data.bin',
      inodeNumber: 2,
      nextBlock: nextB,
      isIndexBlock: false,
    });
  }

  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'report.docx',
      fileSizeBytes: 3500,
      blockCount: 4,
      allocationStrategy: 'LINKED',
      directBlocks: Object.freeze(chain1),
      internalFragmentationBytes: 4 * 1024 - 3500,
      createdAt: 100,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'data.bin',
      fileSizeBytes: 2500,
      blockCount: 3,
      allocationStrategy: 'LINKED',
      directBlocks: Object.freeze(chain2),
      internalFragmentationBytes: 3 * 1024 - 2500,
      createdAt: 110,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'report.docx', inodeNumber: 1, type: 'FILE', path: '/report.docx' }),
    Object.freeze({ name: 'data.bin', inodeNumber: 2, type: 'FILE', path: '/data.bin' }),
  ];

  const freeCount = blocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: freeCount,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 5: Indexed Allocation
// Dedicated index block holding array of pointers to data blocks
// ─────────────────────────────────────────────────────────────────────────────
function buildIndexedDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File 1: database.db
  // Index Block = 6
  // Data Blocks = [1, 8, 14, 22] (4 data blocks)
  const dataBlocks1 = [1, 8, 14, 22];
  blocks[6] = Object.freeze({
    blockNumber: 6,
    isAllocated: true,
    role: 'INDEX',
    fileId: 'file_1',
    fileName: 'database.db',
    inodeNumber: 1,
    nextBlock: null,
    isIndexBlock: true,
  });

  for (const bNum of dataBlocks1) {
    blocks[bNum] = Object.freeze({
      blockNumber: bNum,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_1',
      fileName: 'database.db',
      inodeNumber: 1,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File 2: archive.tar
  // Index Block = 19
  // Data Blocks = [4, 11, 27] (3 data blocks)
  const dataBlocks2 = [4, 11, 27];
  blocks[19] = Object.freeze({
    blockNumber: 19,
    isAllocated: true,
    role: 'INDEX',
    fileId: 'file_2',
    fileName: 'archive.tar',
    inodeNumber: 2,
    nextBlock: null,
    isIndexBlock: true,
  });

  for (const bNum of dataBlocks2) {
    blocks[bNum] = Object.freeze({
      blockNumber: bNum,
      isAllocated: true,
      role: 'DATA',
      fileId: 'file_2',
      fileName: 'archive.tar',
      inodeNumber: 2,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'database.db',
      fileSizeBytes: 3950,
      blockCount: 5, // 4 data + 1 index
      allocationStrategy: 'INDEXED',
      directBlocks: Object.freeze(dataBlocks1),
      indexBlock: 6,
      internalFragmentationBytes: 4 * 1024 - 3950,
      createdAt: 100,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'archive.tar',
      fileSizeBytes: 2900,
      blockCount: 4, // 3 data + 1 index
      allocationStrategy: 'INDEXED',
      directBlocks: Object.freeze(dataBlocks2),
      indexBlock: 19,
      internalFragmentationBytes: 3 * 1024 - 2900,
      createdAt: 110,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'database.db', inodeNumber: 1, type: 'FILE', path: '/database.db' }),
    Object.freeze({ name: 'archive.tar', inodeNumber: 2, type: 'FILE', path: '/archive.tar' }),
  ];

  const freeCount = blocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: freeCount,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 6: Strategy Comparison
// Identical 3-data-block workload (2800 bytes) allocated across all 3 strategies
// ─────────────────────────────────────────────────────────────────────────────
function buildStrategyComparisonDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File 1: Contiguous (Blocks 1..3)
  for (let i = 1; i <= 3; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'contig_file',
      fileName: 'file_contig.dat',
      inodeNumber: 1,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File 2: Linked (Blocks 7 -> 13 -> 20 -> -1)
  const linkedChain = [7, 13, 20];
  for (let i = 0; i < linkedChain.length; i++) {
    const b = linkedChain[i];
    const nextB = i < linkedChain.length - 1 ? linkedChain[i + 1] : -1;
    blocks[b] = Object.freeze({
      blockNumber: b,
      isAllocated: true,
      role: 'DATA',
      fileId: 'linked_file',
      fileName: 'file_linked.dat',
      inodeNumber: 2,
      nextBlock: nextB,
      isIndexBlock: false,
    });
  }

  // File 3: Indexed (Index Block 9, Data Blocks [11, 17, 26])
  blocks[9] = Object.freeze({
    blockNumber: 9,
    isAllocated: true,
    role: 'INDEX',
    fileId: 'index_file',
    fileName: 'file_index.dat',
    inodeNumber: 3,
    nextBlock: null,
    isIndexBlock: true,
  });
  const indexData = [11, 17, 26];
  for (const b of indexData) {
    blocks[b] = Object.freeze({
      blockNumber: b,
      isAllocated: true,
      role: 'DATA',
      fileId: 'index_file',
      fileName: 'file_index.dat',
      inodeNumber: 3,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'file_contig.dat',
      fileSizeBytes: 2800,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([1, 2, 3]),
      internalFragmentationBytes: 3 * 1024 - 2800,
      createdAt: 100,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'file_linked.dat',
      fileSizeBytes: 2800,
      blockCount: 3,
      allocationStrategy: 'LINKED',
      directBlocks: Object.freeze(linkedChain),
      internalFragmentationBytes: 3 * 1024 - 2800,
      createdAt: 110,
    }),
    3: Object.freeze({
      inodeNumber: 3,
      fileName: 'file_index.dat',
      fileSizeBytes: 2800,
      blockCount: 4, // 3 data + 1 index
      allocationStrategy: 'INDEXED',
      directBlocks: Object.freeze(indexData),
      indexBlock: 9,
      internalFragmentationBytes: 3 * 1024 - 2800,
      createdAt: 120,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'file_contig.dat', inodeNumber: 1, type: 'FILE', path: '/file_contig.dat' }),
    Object.freeze({ name: 'file_linked.dat', inodeNumber: 2, type: 'FILE', path: '/file_linked.dat' }),
    Object.freeze({ name: 'file_index.dat', inodeNumber: 3, type: 'FILE', path: '/file_index.dat' }),
  ];

  const freeCount = blocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: freeCount,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 7: Deletion & Block Reclamation
// ─────────────────────────────────────────────────────────────────────────────
function buildDeletionReuseDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File alpha.txt (0..2)
  for (let i = 0; i <= 2; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'alpha',
      fileName: 'alpha.txt',
      inodeNumber: 1,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File beta.log (3..6) -> Candidates to delete to observe block reuse!
  for (let i = 3; i <= 6; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'beta',
      fileName: 'beta.log',
      inodeNumber: 2,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File gamma.pdf (7..10)
  for (let i = 7; i <= 10; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'gamma',
      fileName: 'gamma.pdf',
      inodeNumber: 3,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'alpha.txt',
      fileSizeBytes: 2900,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([0, 1, 2]),
      internalFragmentationBytes: 3 * 1024 - 2900,
      createdAt: 100,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'beta.log',
      fileSizeBytes: 4000,
      blockCount: 4,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([3, 4, 5, 6]),
      internalFragmentationBytes: 4 * 1024 - 4000,
      createdAt: 110,
    }),
    3: Object.freeze({
      inodeNumber: 3,
      fileName: 'gamma.pdf',
      fileSizeBytes: 3800,
      blockCount: 4,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([7, 8, 9, 10]),
      internalFragmentationBytes: 4 * 1024 - 3800,
      createdAt: 120,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'alpha.txt', inodeNumber: 1, type: 'FILE', path: '/alpha.txt' }),
    Object.freeze({ name: 'beta.log', inodeNumber: 2, type: 'FILE', path: '/beta.log' }),
    Object.freeze({ name: 'gamma.pdf', inodeNumber: 3, type: 'FILE', path: '/gamma.pdf' }),
  ];

  const freeCount = blocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: freeCount,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 8: Hierarchical Inode Tree & Directory Structure
// Nested paths: /home/ohi/thesis.pdf, /home/ohi/oscope.txt, /system/config.ini
// ─────────────────────────────────────────────────────────────────────────────
function buildHierarchicalDisk(): FileSystemState {
  const blocks = createEmptyBlocks(DEFAULT_TOTAL_BLOCKS);

  // File /home/ohi/thesis.pdf (CONTIGUOUS: blocks 8, 9, 10)
  for (let i = 8; i <= 10; i++) {
    blocks[i] = Object.freeze({
      blockNumber: i,
      isAllocated: true,
      role: 'DATA',
      fileId: 'thesis',
      fileName: 'thesis.pdf',
      inodeNumber: 4,
      nextBlock: null,
      isIndexBlock: false,
    });
  }

  // File /home/ohi/oscope.txt (LINKED: blocks 14 -> 22 -> -1)
  blocks[14] = Object.freeze({
    blockNumber: 14,
    isAllocated: true,
    role: 'DATA',
    fileId: 'oscope',
    fileName: 'oscope.txt',
    inodeNumber: 5,
    nextBlock: 22,
    isIndexBlock: false,
  });
  blocks[22] = Object.freeze({
    blockNumber: 22,
    isAllocated: true,
    role: 'DATA',
    fileId: 'oscope',
    fileName: 'oscope.txt',
    inodeNumber: 5,
    nextBlock: -1,
    isIndexBlock: false,
  });

  // File /system/config.ini (CONTIGUOUS: block 2)
  blocks[2] = Object.freeze({
    blockNumber: 2,
    isAllocated: true,
    role: 'DATA',
    fileId: 'config',
    fileName: 'config.ini',
    inodeNumber: 6,
    nextBlock: null,
    isIndexBlock: false,
  });

  const inodes: Record<number, Inode> = {
    1: Object.freeze({
      inodeNumber: 1,
      fileName: 'home',
      fileSizeBytes: 0,
      blockCount: 0,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([]),
      internalFragmentationBytes: 0,
      createdAt: 10,
    }),
    2: Object.freeze({
      inodeNumber: 2,
      fileName: 'system',
      fileSizeBytes: 0,
      blockCount: 0,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([]),
      internalFragmentationBytes: 0,
      createdAt: 10,
    }),
    3: Object.freeze({
      inodeNumber: 3,
      fileName: 'ohi',
      fileSizeBytes: 0,
      blockCount: 0,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([]),
      internalFragmentationBytes: 0,
      createdAt: 20,
    }),
    4: Object.freeze({
      inodeNumber: 4,
      fileName: 'thesis.pdf',
      fileSizeBytes: 2500,
      blockCount: 3,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([8, 9, 10]),
      internalFragmentationBytes: 3 * 1024 - 2500,
      createdAt: 30,
    }),
    5: Object.freeze({
      inodeNumber: 5,
      fileName: 'oscope.txt',
      fileSizeBytes: 1800,
      blockCount: 2,
      allocationStrategy: 'LINKED',
      directBlocks: Object.freeze([14, 22]),
      internalFragmentationBytes: 2 * 1024 - 1800,
      createdAt: 40,
    }),
    6: Object.freeze({
      inodeNumber: 6,
      fileName: 'config.ini',
      fileSizeBytes: 512,
      blockCount: 1,
      allocationStrategy: 'CONTIGUOUS',
      directBlocks: Object.freeze([2]),
      internalFragmentationBytes: 1024 - 512,
      createdAt: 50,
    }),
  };

  const directoryEntries: DirectoryEntry[] = [
    Object.freeze({ name: 'home', inodeNumber: 1, type: 'DIRECTORY', path: '/home' }),
    Object.freeze({ name: 'system', inodeNumber: 2, type: 'DIRECTORY', path: '/system' }),
    Object.freeze({ name: 'ohi', inodeNumber: 3, type: 'DIRECTORY', path: '/home/ohi' }),
    Object.freeze({ name: 'thesis.pdf', inodeNumber: 4, type: 'FILE', path: '/home/ohi/thesis.pdf' }),
    Object.freeze({ name: 'oscope.txt', inodeNumber: 5, type: 'FILE', path: '/home/ohi/oscope.txt' }),
    Object.freeze({ name: 'config.ini', inodeNumber: 6, type: 'FILE', path: '/system/config.ini' }),
  ];

  const freeCount = blocks.filter((b) => !b.isAllocated).length;

  return Object.freeze({
    totalBlocks: DEFAULT_TOTAL_BLOCKS,
    blockSizeBytes: DEFAULT_BLOCK_SIZE,
    freeBlocksCount: freeCount,
    diskBlocks: Object.freeze(blocks),
    inodes: Object.freeze(inodes),
    directoryEntries: Object.freeze(directoryEntries),
    currentDirectory: '/home/ohi',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED PRESETS REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const FILESYSTEM_PRESETS: readonly FileSystemPreset[] = Object.freeze([
  {
    id: 'empty_disk',
    name: '1. Empty Disk (Baseline)',
    subtitle: 'Unallocated clean disk ready for initial file creation',
    description:
      'All 32 disk blocks are in the free pool. Best for demonstrating initial contiguous or linked block placement without fragmentation.',
    academicFocus: 'Basic file creation, Inode allocation, and directory entry binding.',
    state: buildEmptyDisk(),
    recommendedFileName: 'project.c',
    recommendedSizeBytes: 2048,
    recommendedStrategy: 'CONTIGUOUS',
  },
  {
    id: 'contiguous_layout',
    name: '2. Contiguous File Layout',
    subtitle: 'Adjacent consecutive blocks per file',
    description:
      'Demonstrates adjacent block placement. Files kernel.sys [0..3], boot.img [4..7], and readme.txt [12..14] occupy consecutive extents.',
    academicFocus: 'Fast sequential & random disk access via direct base-plus-offset calculation.',
    state: buildContiguousDisk(),
    recommendedFileName: 'notes.txt',
    recommendedSizeBytes: 1500,
    recommendedStrategy: 'CONTIGUOUS',
  },
  {
    id: 'external_fragmentation',
    name: '3. External Fragmentation Showcase',
    subtitle: 'Sufficient total free space, but no contiguous run',
    description:
      'Classic OS failure mode: 7 total free blocks exist on disk, but the largest contiguous free run is only 2 blocks. Requesting a 4-block contiguous file FAILS completely!',
    academicFocus: 'Contiguous allocation vulnerability to external fragmentation.',
    state: buildExternalFragmentationDisk(),
    recommendedFileName: 'video_clip.mp4',
    recommendedSizeBytes: 4000,
    recommendedStrategy: 'CONTIGUOUS',
  },
  {
    id: 'linked_allocation',
    name: '4. Linked Non-Contiguous Allocation',
    subtitle: 'Scattered blocks connected by pointers',
    description:
      'Files report.docx and data.bin occupy scattered non-contiguous disk blocks linked via pointer chains (e.g., 2 -> 9 -> 17 -> 24 -> EOF). No external fragmentation.',
    academicFocus: 'Zero external fragmentation at the cost of sequential pointer traversal.',
    state: buildLinkedDisk(),
    recommendedFileName: 'stream.log',
    recommendedSizeBytes: 3000,
    recommendedStrategy: 'LINKED',
  },
  {
    id: 'indexed_allocation',
    name: '5. Indexed Allocation with Index Block',
    subtitle: 'Dedicated index block storing pointers',
    description:
      'File database.db uses Index Block #6 to point to data blocks [1, 8, 14, 22]. File archive.tar uses Index Block #19 to point to [4, 11, 27]. Accounts for index block overhead.',
    academicFocus: 'Direct access without external fragmentation, balanced against index-block overhead.',
    state: buildIndexedDisk(),
    recommendedFileName: 'dataset.csv',
    recommendedSizeBytes: 3200,
    recommendedStrategy: 'INDEXED',
  },
  {
    id: 'strategy_comparison',
    name: '6. Cross-Strategy Workload Comparison',
    subtitle: 'Identical 2800-byte file across Contiguous, Linked, & Indexed',
    description:
      'Direct comparison of three identical workloads (2800 bytes -> 3 data blocks) allocated using Contiguous, Linked, and Indexed strategies side-by-side.',
    academicFocus: 'Comparative analysis of block overhead, direct vs sequential access cost, and pointer storage.',
    state: buildStrategyComparisonDisk(),
    recommendedFileName: 'test_sample.dat',
    recommendedSizeBytes: 2800,
    recommendedStrategy: 'INDEXED',
  },
  {
    id: 'deletion_reuse',
    name: '7. Deletion & Block Reclamation',
    subtitle: 'Freeing blocks and reusing storage holes',
    description:
      'Delete beta.log (blocks 3..6) to observe immediate reclamation into the free pool, then allocate a new file into the vacated space.',
    academicFocus: 'Block reclamation, Inode cleanup, and storage reuse cycles.',
    state: buildDeletionReuseDisk(),
    recommendedFileName: 'new_entry.txt',
    recommendedSizeBytes: 3500,
    recommendedStrategy: 'CONTIGUOUS',
  },
  {
    id: 'hierarchical_tree',
    name: '8. Hierarchical Inode & Directory Tree',
    subtitle: 'Educational Unix-like directory navigation and Inode binding',
    description:
      'Features nested directories (/home/ohi, /system) with mixed-strategy files (thesis.pdf, oscope.txt, config.ini). Demonstrates synchronization between Directory Tree, Inode Table, and Virtual Disk.',
    academicFocus: 'VFS directory entry traversal, Inode mapping, and multi-file disk representation.',
    state: buildHierarchicalDisk(),
    recommendedFileName: 'paper_v2.pdf',
    recommendedSizeBytes: 2200,
    recommendedStrategy: 'CONTIGUOUS',
  },
]);
