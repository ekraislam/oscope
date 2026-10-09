/**
 * OScope — Memory Management & Paging Domain Models
 * Explicit distinctions between virtual/physical addresses, page numbers, offsets, and frame numbers.
 */

export interface VirtualAddress {
  readonly rawAddress: number;
  readonly pageNumber: number;
  readonly offset: number;
  readonly binaryString: string;
}

export interface PhysicalAddress {
  readonly rawAddress: number;
  readonly frameNumber: number;
  readonly offset: number;
  readonly binaryString: string;
}

export interface PageTableEntry {
  readonly pageNumber: number;
  readonly frameNumber: number | null;
  readonly isValid: boolean;            // Valid / Invalid bit
  readonly isDirty: boolean;            // Modified bit
  readonly referenceBit: boolean;        // Used for Second-Chance / Clock
  readonly lastAccessedTime: number;    // Used for LRU simulation
}

export interface TLBEntry {
  readonly pageNumber: number;
  readonly frameNumber: number;
  readonly lastUsedTime: number;
}

export interface MemoryFrame {
  readonly frameNumber: number;
  readonly allocatedPage: number | null;
  readonly owningPid: string | null;
  readonly isOccupied: boolean;
  readonly loadedAtTime: number;
  readonly lastAccessTime: number;
}

export type ReplacementAlgorithm = 'FIFO' | 'LRU' | 'OPTIMAL';

export interface PageReference {
  readonly step: number;
  readonly pageNumber: number;
  readonly isHit: boolean;
  readonly tlbHit: boolean;
  readonly evictedPage: number | null;
  readonly allocatedFrame: number;
  readonly memoryFramesSnapshot: readonly (number | null)[];
}

export interface ReplacementResult {
  readonly algorithm: ReplacementAlgorithm;
  readonly referenceString: readonly number[];
  readonly frameCount: number;
  readonly steps: readonly PageReference[];
  readonly totalFaults: number;
  readonly totalHits: number;
  readonly faultRate: number; // percentage [0 - 100]%
  readonly hitRate: number;   // percentage [0 - 100]%
}

export interface MemoryConfiguration {
  readonly pageSizeBytes: number;
  readonly totalMemoryBytes: number;
  readonly frameCount: number;
  readonly tlbSize: number;
  readonly virtualAddressBits?: number;
  readonly virtualMemoryBytes?: number;
}

export interface AddressBreakdownResult {
  readonly virtualAddress: number;
  readonly hexString: string;
  readonly binaryString: string;
  readonly pageNumber: number;
  readonly offset: number;
  readonly pageBits: string;
  readonly offsetBits: string;
  readonly totalBits: number;
  readonly pageBitCount: number;
  readonly offsetBitCount: number;
}

export interface AddressTranslationResult {
  readonly virtualAddress: VirtualAddress;
  readonly breakdown: AddressBreakdownResult;
  readonly pageNumber: number;
  readonly offset: number;
  readonly isTLBHit: boolean;
  readonly isPageTableHit: boolean;
  readonly isPageFault: boolean;
  readonly resolvedFrameNumber: number | null;
  readonly physicalAddress: PhysicalAddress | null;
  readonly tlbEntry: TLBEntry | null;
  readonly pageTableEntry: PageTableEntry | null;
  readonly evictedPage: number | null;
  readonly stepsTaken: readonly string[];
}
