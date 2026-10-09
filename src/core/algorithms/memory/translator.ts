/**
 * OScope — Address Translation Observatory Simulation Engine
 * Executes the complete hardware/software translation pipeline:
 * Virtual Address → Bit Breakdown → TLB Lookup → Page Table Lookup → Page Fault Handling → Physical Address
 */

import type {
  MemoryConfiguration,
  AddressTranslationResult,
  PageTableEntry,
  TLBEntry,
} from '../../models/memory';
import { breakdownVirtualAddress, createVirtualAddress } from './addressBreakdown';
import { calculatePhysicalAddress } from './physicalAddress';
import { type TLBState, lookupTLB, insertTLB, invalidateTLBEntry } from './tlb';
import {
  type PageTableState,
  type PhysicalMemoryState,
  lookupPageTable,
  findLowestFreeFrame,
  mapPageToFrame,
  unmapPage,
} from './pageTable';

export interface TranslationContext {
  readonly config: MemoryConfiguration;
  readonly tlb: TLBState;
  readonly pageTable: PageTableState;
  readonly physicalMemory: PhysicalMemoryState;
  readonly currentTime: number;
}

export interface TranslationExecutionOutput {
  readonly result: AddressTranslationResult;
  readonly updatedTLB: TLBState;
  readonly updatedPageTable: PageTableState;
  readonly updatedPhysicalMemory: PhysicalMemoryState;
  readonly generatedEvents: readonly string[];
}

/**
 * Translates a virtual address to a physical address through the full TLB + Page Table pipeline.
 * Guarantees Stale-TLB safety on page fault replacement.
 */
export function translateVirtualAddress(
  virtualAddressNum: number,
  context: TranslationContext,
  replacementPolicy: 'FIFO' | 'LRU' = 'FIFO'
): TranslationExecutionOutput {
  const { config, currentTime } = context;
  let currentTLB = context.tlb;
  let currentPT = context.pageTable;
  let currentMem = context.physicalMemory;

  const events: string[] = [];
  const stepsTaken: string[] = [];

  // Step 1: Address breakdown
  const breakdown = breakdownVirtualAddress(virtualAddressNum, config);
  const vAddr = createVirtualAddress(virtualAddressNum, config);
  const { pageNumber, offset, hexString } = breakdown;

  events.push(`[t=${currentTime}] ADDRESS_RECEIVED: Virtual address ${hexString} (${virtualAddressNum})`);
  stepsTaken.push(
    `Decoded virtual address ${hexString}: Page Number = ${pageNumber} (bits: ${breakdown.pageBits}), Offset = ${offset} (bits: ${breakdown.offsetBits}).`
  );

  // Step 2: TLB Lookup
  const tlbCheck = lookupTLB(currentTLB, pageNumber, currentTime);
  currentTLB = tlbCheck.updatedTLB;

  let isTLBHit = false;
  let isPageTableHit = false;
  let isPageFault = false;
  let resolvedFrame: number | null = null;
  let hitTLBEntry: TLBEntry | null = null;
  let hitPTEntry: PageTableEntry | null = null;
  let evictedPage: number | null = null;

  if (tlbCheck.hit && tlbCheck.entry) {
    // === SCENARIO 1: TLB HIT ===
    isTLBHit = true;
    hitTLBEntry = tlbCheck.entry;
    resolvedFrame = tlbCheck.entry.frameNumber;

    events.push(`[t=${currentTime}] TLB_HIT: Page ${pageNumber} resolved to Frame ${resolvedFrame}`);
    stepsTaken.push(
      `TLB HIT: The translation for Page ${pageNumber} was found in the TLB cache. Resolved directly to Frame ${resolvedFrame} without a page-table walk.`
    );
  } else {
    // === SCENARIO 2: TLB MISS ===
    events.push(`[t=${currentTime}] TLB_MISS: Page ${pageNumber} not in TLB cache`);
    stepsTaken.push(
      `TLB MISS: Page ${pageNumber} was not present in the TLB. Proceeding to inspect the authoritative Page Table.`
    );

    // Consult Page Table
    const ptCheck = lookupPageTable(currentPT, pageNumber, currentTime);
    currentPT = ptCheck.updatedPageTable;

    if (ptCheck.isValid && ptCheck.entry && ptCheck.entry.frameNumber !== null) {
      // === SUB-SCENARIO 2A: PAGE TABLE HIT (VALID) ===
      isPageTableHit = true;
      hitPTEntry = ptCheck.entry;
      resolvedFrame = ptCheck.entry.frameNumber;

      events.push(`[t=${currentTime}] PAGE_TABLE_HIT: Page ${pageNumber} is valid in Frame ${resolvedFrame}`);
      stepsTaken.push(
        `PAGE TABLE HIT: Page Table Entry for Page ${pageNumber} is VALID, mapped to Frame ${resolvedFrame}.`
      );

      // Update TLB with this translation
      const tlbInsert = insertTLB(currentTLB, pageNumber, resolvedFrame, currentTime);
      currentTLB = tlbInsert.updatedTLB;
      events.push(`[t=${currentTime}] TLB_UPDATED: Loaded Page ${pageNumber} → Frame ${resolvedFrame} into TLB`);
      stepsTaken.push(`TLB cache updated with mapping Page ${pageNumber} → Frame ${resolvedFrame}.`);
    } else {
      // === SUB-SCENARIO 2B: PAGE FAULT (INVALID) ===
      isPageFault = true;
      events.push(`[t=${currentTime}] PAGE_FAULT: Page ${pageNumber} is NOT resident in physical memory`);
      stepsTaken.push(
        `PAGE FAULT: Page ${pageNumber} is not currently resident in physical RAM (Page Table entry is INVALID). Triggering OS Page Fault Handler.`
      );

      // Handle Page Fault:
      // A. Check for free frame
      const freeFrame = findLowestFreeFrame(currentMem);

      if (freeFrame !== null) {
        resolvedFrame = freeFrame;
        events.push(`[t=${currentTime}] FRAME_SELECTED: Free Frame ${freeFrame} allocated`);
        stepsTaken.push(
          `Allocated lowest-numbered free physical Frame ${freeFrame} to Page ${pageNumber}. No page eviction needed.`
        );
      } else {
        // B. All frames occupied -> Run Page Replacement algorithm to select victim
        let victimFrameIdx = 0;
        let victimPage = 0;

        if (replacementPolicy === 'LRU') {
          let minTime = Infinity;
          for (let i = 0; i < currentMem.frames.length; i++) {
            const f = currentMem.frames[i];
            if (f.lastAccessTime < minTime && f.allocatedPage !== null) {
              minTime = f.lastAccessTime;
              victimFrameIdx = i;
              victimPage = f.allocatedPage;
            }
          }
        } else {
          // FIFO: find resident frame with smallest loadedAtTime
          let minTime = Infinity;
          for (let i = 0; i < currentMem.frames.length; i++) {
            const f = currentMem.frames[i];
            if (f.loadedAtTime < minTime && f.allocatedPage !== null) {
              minTime = f.loadedAtTime;
              victimFrameIdx = i;
              victimPage = f.allocatedPage;
            }
          }
        }

        evictedPage = victimPage;
        resolvedFrame = victimFrameIdx;
        const unmapResult = unmapPage(currentPT, currentMem, victimPage);
        currentPT = unmapResult.updatedPageTable;
        currentMem = unmapResult.updatedMemory;

        // CRITICAL: Stale-TLB Safety Invalidation!
        currentTLB = invalidateTLBEntry(currentTLB, victimPage);

        events.push(
          `[t=${currentTime}] PAGE_EVICTED: Evicted Page ${victimPage} from Frame ${resolvedFrame} (${replacementPolicy})`
        );
        events.push(`[t=${currentTime}] TLB_INVALIDATED: Purged stale TLB entry for evicted Page ${victimPage}`);
        stepsTaken.push(
          `Physical memory full. ${replacementPolicy} selected Page ${victimPage} for eviction. Frame ${resolvedFrame} reclaimed. Purged stale TLB entry for Page ${victimPage}.`
        );
      }

      // Map newly referenced page to resolved frame
      const mapResult = mapPageToFrame(currentPT, currentMem, pageNumber, resolvedFrame, currentTime);
      currentPT = mapResult.updatedPageTable;
      currentMem = mapResult.updatedMemory;

      // Update TLB with new mapping
      const tlbInsert = insertTLB(currentTLB, pageNumber, resolvedFrame, currentTime);
      currentTLB = tlbInsert.updatedTLB;

      events.push(`[t=${currentTime}] PAGE_LOADED: Loaded Page ${pageNumber} into Frame ${resolvedFrame}`);
      events.push(`[t=${currentTime}] TLB_UPDATED: Page ${pageNumber} → Frame ${resolvedFrame}`);
      stepsTaken.push(
        `Loaded Page ${pageNumber} into Frame ${resolvedFrame}. Updated Page Table entry to VALID. Inserted mapping into TLB.`
      );
    }
  }

  // Step 3: Physical Address Resolution
  const physAddr =
    resolvedFrame !== null ? calculatePhysicalAddress(resolvedFrame, offset, config) : null;

  if (physAddr) {
    const physHex = '0x' + physAddr.rawAddress.toString(16).toUpperCase();
    events.push(`[t=${currentTime}] PHYSICAL_ADDRESS_RESOLVED: ${physHex} (${physAddr.rawAddress})`);
    stepsTaken.push(
      `Physical address computed: Frame ${resolvedFrame} × PageSize (${config.pageSizeBytes}) + Offset (${offset}) = ${physAddr.rawAddress} (${physHex}).`
    );
  }

  const result: AddressTranslationResult = Object.freeze({
    virtualAddress: vAddr,
    breakdown,
    pageNumber,
    offset,
    isTLBHit,
    isPageTableHit,
    isPageFault,
    resolvedFrameNumber: resolvedFrame,
    physicalAddress: physAddr,
    tlbEntry: hitTLBEntry,
    pageTableEntry: hitPTEntry,
    evictedPage,
    stepsTaken: Object.freeze(stepsTaken),
  });

  return Object.freeze({
    result,
    updatedTLB: currentTLB,
    updatedPageTable: currentPT,
    updatedPhysicalMemory: currentMem,
    generatedEvents: Object.freeze(events),
  });
}
