/**
 * OScope — File System & Storage Allocation Domain Models
 * Represents disk blocks, Inodes, directory trees, allocation strategies,
 * access traces, and consistency reports.
 */

export type AllocationStrategy = 'CONTIGUOUS' | 'LINKED' | 'INDEXED';

export type DiskBlockRole = 'FREE' | 'DATA' | 'INDEX';

export interface DiskBlock {
  readonly blockNumber: number;
  readonly isAllocated: boolean;
  readonly role: DiskBlockRole;
  readonly fileId: string | null;
  readonly fileName: string | null;
  readonly inodeNumber: number | null;
  readonly nextBlock: number | null; // For linked allocation (-1 or null for EOF)
  readonly isIndexBlock: boolean;    // For indexed allocation
  readonly dataSnippet?: string;
}

export interface Inode {
  readonly inodeNumber: number;
  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly blockCount: number;
  readonly allocationStrategy: AllocationStrategy;
  readonly directBlocks: readonly number[]; // Pointers to allocated disk data blocks
  readonly indexBlock?: number;             // Pointer to index block (for INDEXED strategy)
  readonly internalFragmentationBytes: number;
  readonly createdAt: number;
}

export interface DirectoryEntry {
  readonly name: string;
  readonly inodeNumber: number;
  readonly type: 'FILE' | 'DIRECTORY';
  readonly path: string; // Full virtual path e.g. "/home" or "/home/thesis.pdf"
}

export interface FileSystemState {
  readonly totalBlocks: number;
  readonly blockSizeBytes: number;
  readonly freeBlocksCount: number;
  readonly diskBlocks: readonly DiskBlock[];
  readonly inodes: Readonly<Record<number, Inode>>;
  readonly directoryEntries: readonly DirectoryEntry[];
  readonly currentDirectory: string; // e.g. "/" or "/home"
}

export interface FileSpecification {
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly strategy?: AllocationStrategy;
  readonly directoryPath?: string;
}

export interface FreeRun {
  readonly startBlock: number;
  readonly length: number;
  readonly blocks: readonly number[];
}

export interface FreeSpaceAnalysis {
  readonly totalFreeBlocks: number;
  readonly freeBlocks: readonly number[];
  readonly runs: readonly FreeRun[];
  readonly largestFreeRun: number;
}

export interface FileAllocationResult {
  readonly success: boolean;
  readonly fileName: string;
  readonly strategy: AllocationStrategy;
  readonly allocatedBlockNumbers: readonly number[];
  readonly indexBlockNumber?: number;
  readonly updatedFileSystemState: FileSystemState;
  readonly fragmentation: {
    readonly internalBytes: number;
    readonly externalFreeBlocks: number;
    readonly largestFreeRun: number;
  };
  readonly reason: string;
}

export interface AllocationPreview {
  readonly fileName: string;
  readonly fileSizeBytes: number;
  readonly strategy: AllocationStrategy;
  readonly dataBlocksNeeded: number;
  readonly totalBlocksNeeded: number; // data + index if applicable
  readonly canAllocate: boolean;
  readonly candidateBlocks: readonly number[];
  readonly candidateIndexBlock?: number;
  readonly internalFragmentationBytes: number;
  readonly externalFragmentationBlocking: boolean;
  readonly reason: string;
}

export interface BlockAccessStep {
  readonly stepNumber: number;
  readonly physicalBlockNumber: number;
  readonly role: 'DATA' | 'INDEX' | 'POINTER_TRAVERSAL';
  readonly explanation: string;
}

export interface BlockAccessResult {
  readonly fileName: string;
  readonly logicalBlockIndex: number;
  readonly physicalBlockNumber: number;
  readonly strategy: AllocationStrategy;
  readonly totalSteps: number;
  readonly steps: readonly BlockAccessStep[];
  readonly explanation: string;
}

export interface ConsistencyCheckItem {
  readonly name: string;
  readonly passed: boolean;
  readonly details: string;
}

export interface FileSystemConsistencyReport {
  readonly isConsistent: boolean;
  readonly checks: readonly ConsistencyCheckItem[];
  readonly errors: readonly string[];
}
