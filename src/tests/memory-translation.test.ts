import { describe, it, expect } from 'vitest';
import type { MemoryConfiguration } from '../core/models/memory';
import {
  breakdownVirtualAddress,
  calculatePhysicalAddress,
  createTLB,
  lookupTLB,
  insertTLB,
  invalidateTLBEntry,
  createPageTable,
  createPhysicalMemory,
  lookupPageTable,
  findLowestFreeFrame,
  mapPageToFrame,
  unmapPage,
  translateVirtualAddress,
} from '../core/algorithms/memory';

describe('Memory Address Translation & TLB Engine', () => {
  const standardConfig: MemoryConfiguration = {
    pageSizeBytes: 4096, // 4KB -> 12 offset bits
    totalMemoryBytes: 65536, // 64KB -> 16 physical frames
    frameCount: 16,
    tlbSize: 4,
    virtualAddressBits: 16,
    virtualMemoryBytes: 65536,
  };

  describe('Address Breakdown Engine', () => {
    it('decomposes virtual addresses mathematically into page number and offset', () => {
      // 0x2A3F = 10815. Page = 10815 / 4096 = 2. Offset = 10815 % 4096 = 2623 (0xA3F)
      const res = breakdownVirtualAddress(0x2A3F, standardConfig);

      expect(res.virtualAddress).toBe(10815);
      expect(res.pageNumber).toBe(2);
      expect(res.offset).toBe(2623);
      expect(res.offsetBitCount).toBe(12);
      expect(res.pageBitCount).toBe(4);
      expect(res.hexString).toBe('0x2A3F');
      expect(res.offsetBits).toBe((2623).toString(2).padStart(12, '0'));
      expect(res.pageBits).toBe((2).toString(2).padStart(4, '0'));
    });

    it('correctly handles boundary address 0 (page 0, offset 0)', () => {
      const res = breakdownVirtualAddress(0, standardConfig);
      expect(res.pageNumber).toBe(0);
      expect(res.offset).toBe(0);
      expect(res.binaryString).toBe('0000000000000000');
    });

    it('correctly handles maximum address boundary', () => {
      const maxAddr = 65535; // 0xFFFF -> Page 15, Offset 4095
      const res = breakdownVirtualAddress(maxAddr, standardConfig);
      expect(res.pageNumber).toBe(15);
      expect(res.offset).toBe(4095);
    });

    it('rejects addresses outside the configured virtual address space', () => {
      expect(() => breakdownVirtualAddress(65536, standardConfig)).toThrow(
        /exceeds maximum address space/
      );
      expect(() => breakdownVirtualAddress(-1, standardConfig)).toThrow(
        /non-negative integer/
      );
    });

    it('rejects non-power-of-two page sizes', () => {
      const invalidConfig: MemoryConfiguration = {
        ...standardConfig,
        pageSizeBytes: 3000,
      };
      expect(() => breakdownVirtualAddress(1000, invalidConfig)).toThrow(
        /must be a positive power of 2/
      );
    });
  });

  describe('Physical Address Calculation', () => {
    it('calculates physical address as frameNumber * pageSize + offset', () => {
      // Frame 3, Offset 2623 in 4KB pages -> 3 * 4096 + 2623 = 12288 + 2623 = 14911 (0x3A3F)
      const phys = calculatePhysicalAddress(3, 2623, standardConfig);
      expect(phys.rawAddress).toBe(14911);
      expect(phys.frameNumber).toBe(3);
      expect(phys.offset).toBe(2623);
    });

    it('rejects frame numbers exceeding physical memory frame count', () => {
      expect(() => calculatePhysicalAddress(16, 100, standardConfig)).toThrow(
        /exceeds configured physical frame count/
      );
    });

    it('rejects offsets outside valid page/frame boundary', () => {
      expect(() => calculatePhysicalAddress(2, 4096, standardConfig)).toThrow(
        /outside valid frame boundary/
      );
      expect(() => calculatePhysicalAddress(2, -1, standardConfig)).toThrow(
        /outside valid frame boundary/
      );
    });
  });

  describe('TLB Associative Cache Operations', () => {
    it('returns miss on an empty TLB', () => {
      const tlb = createTLB(4);
      const res = lookupTLB(tlb, 5, 1);
      expect(res.hit).toBe(false);
      expect(res.entry).toBeNull();
    });

    it('returns hit after insertion and updates lastUsedTime', () => {
      let tlb = createTLB(4);
      const inserted = insertTLB(tlb, 5, 2, 1);
      tlb = inserted.updatedTLB;

      const lookup = lookupTLB(tlb, 5, 10);
      expect(lookup.hit).toBe(true);
      expect(lookup.entry?.frameNumber).toBe(2);
      expect(lookup.entry?.lastUsedTime).toBe(10);
    });

    it('implements LRU eviction when TLB capacity is exceeded', () => {
      // TLB capacity = 2
      let tlb = createTLB(2);

      // Insert Page 1 at t=1, Page 2 at t=2
      tlb = insertTLB(tlb, 1, 10, 1).updatedTLB;
      tlb = insertTLB(tlb, 2, 20, 2).updatedTLB;

      // Access Page 1 at t=5 (Page 1 is now more recently used than Page 2)
      tlb = lookupTLB(tlb, 1, 5).updatedTLB;

      // Insert Page 3 at t=6 -> Should evict Page 2 (LRU)!
      const insert3 = insertTLB(tlb, 3, 30, 6);
      tlb = insert3.updatedTLB;

      expect(insert3.evictedEntry?.pageNumber).toBe(2);

      // Verify Page 1 and Page 3 are in TLB, Page 2 is evicted
      expect(lookupTLB(tlb, 1, 7).hit).toBe(true);
      expect(lookupTLB(tlb, 3, 7).hit).toBe(true);
      expect(lookupTLB(tlb, 2, 7).hit).toBe(false);
    });

    it('correctly invalidates a specific entry', () => {
      let tlb = createTLB(4);
      tlb = insertTLB(tlb, 7, 3, 1).updatedTLB;
      expect(lookupTLB(tlb, 7, 2).hit).toBe(true);

      tlb = invalidateTLBEntry(tlb, 7);
      expect(lookupTLB(tlb, 7, 3).hit).toBe(false);
    });
  });

  describe('Page Table & Free-Frame Allocation', () => {
    it('creates page table with correct validity and mapping states', () => {
      const pt = createPageTable(4, [{ page: 1, frame: 2 }]);
      expect(pt.entries[0].isValid).toBe(false);
      expect(pt.entries[1].isValid).toBe(true);
      expect(pt.entries[1].frameNumber).toBe(2);

      const lookupValid = lookupPageTable(pt, 1, 10);
      expect(lookupValid.isValid).toBe(true);
      expect(lookupValid.entry?.frameNumber).toBe(2);

      const lookupInvalid = lookupPageTable(pt, 0, 10);
      expect(lookupInvalid.isValid).toBe(false);
    });

    it('maps a page to a free frame cleanly', () => {
      let pt = createPageTable(4);
      let mem = createPhysicalMemory(4);

      const mapRes = mapPageToFrame(pt, mem, 2, 3, 5);
      pt = mapRes.updatedPageTable;
      mem = mapRes.updatedMemory;

      expect(pt.entries[2].isValid).toBe(true);
      expect(pt.entries[2].frameNumber).toBe(3);
      expect(mem.frames[3].isOccupied).toBe(true);
      expect(mem.frames[3].allocatedPage).toBe(2);
    });

    it('allocates the lowest-numbered free frame deterministically', () => {
      // Frame 0 is occupied, Frame 1 is free, Frame 2 is occupied
      const mem = createPhysicalMemory(4, [
        { frame: 0, page: 5 },
        { frame: 2, page: 6 },
      ]);

      const free = findLowestFreeFrame(mem);
      expect(free).toBe(1);
    });

    it('unmaps a page and marks its frame as free', () => {
      let pt = createPageTable(4, [{ page: 1, frame: 2 }]);
      let mem = createPhysicalMemory(4, [{ frame: 2, page: 1 }]);

      const unmapRes = unmapPage(pt, mem, 1);
      pt = unmapRes.updatedPageTable;
      mem = unmapRes.updatedMemory;

      expect(pt.entries[1].isValid).toBe(false);
      expect(pt.entries[1].frameNumber).toBeNull();
      expect(mem.frames[2].isOccupied).toBe(false);
    });
  });

  describe('Section 52: Mandatory Stale-TLB Safety Test', () => {
    it('prevents stale TLB hits after page eviction', () => {
      // 1. Page 5 is mapped to Frame 1 (loaded at time 1)
      let pt = createPageTable(16, [
        { page: 0, frame: 0 },
        { page: 5, frame: 1 },
      ]);
      let mem = createPhysicalMemory(2, [
        { frame: 0, page: 0, loadedAt: 5 },
        { frame: 1, page: 5, loadedAt: 1 },
      ]);
      let tlb = createTLB(4);

      // 2. Page 5 enters TLB
      const tlbInsert = insertTLB(tlb, 5, 1, 1);
      tlb = tlbInsert.updatedTLB;
      expect(lookupTLB(tlb, 5, 2).hit).toBe(true);

      // 3. New access occurs for Page 8. Physical memory is full (Frame 0 & 1 occupied).
      // Page 5 is evicted to make room for Page 8 in Frame 1 (since Page 5 loaded at t=1 is older than Page 0 loaded at t=5).
      const translation = translateVirtualAddress(
        8 * 4096 + 10,
        {
          config: standardConfig,
          tlb,
          pageTable: pt,
          physicalMemory: mem,
          currentTime: 10,
        },
        'FIFO'
      );

      tlb = translation.updatedTLB;
      pt = translation.updatedPageTable;
      mem = translation.updatedPhysicalMemory;

      // Page 8 is now resident in Frame 1
      expect(translation.result.resolvedFrameNumber).toBe(1);
      expect(translation.result.evictedPage).toBe(5); // Page 5 was evicted

      // 5. Subsequent access to Page 5 must NOT return Frame 1 from TLB!
      // The MMU translation pipeline automatically purged Page 5 from TLB upon eviction.
      const checkPage5 = lookupTLB(tlb, 5, 20);
      expect(checkPage5.hit).toBe(false);

      // Full translation pipeline access to Page 5 produces a TLB Miss & Page Fault (no stale hit)
      const accessPage5 = translateVirtualAddress(
        5 * 4096 + 10,
        {
          config: standardConfig,
          tlb,
          pageTable: pt,
          physicalMemory: mem,
          currentTime: 25,
        },
        'FIFO'
      );
      expect(accessPage5.result.isTLBHit).toBe(false);
      expect(accessPage5.result.isPageFault).toBe(true);
    });
  });

  describe('Section 51: Cross-Engine Translation Integration Test', () => {
    it('executes full pipeline: VA -> Breakdown -> TLB Miss -> PT Invalid -> Fault -> Allocation -> TLB Update -> PA', () => {
      const pt = createPageTable(16); // All invalid initially
      const mem = createPhysicalMemory(4); // All free initially
      const tlb = createTLB(4); // Empty TLB

      // Translate Virtual Address 0x1020 (Page 1, Offset 32)
      const exec1 = translateVirtualAddress(
        0x1020,
        {
          config: standardConfig,
          tlb,
          pageTable: pt,
          physicalMemory: mem,
          currentTime: 1,
        }
      );

      // 1. Should be TLB MISS and PAGE FAULT
      expect(exec1.result.isTLBHit).toBe(false);
      expect(exec1.result.isPageTableHit).toBe(false);
      expect(exec1.result.isPageFault).toBe(true);

      // 2. Free frame 0 allocated
      expect(exec1.result.resolvedFrameNumber).toBe(0);

      // 3. Physical address computed: Frame 0 * 4096 + 32 = 32 (0x20)
      expect(exec1.result.physicalAddress?.rawAddress).toBe(32);

      // 4. TLB was updated with Page 1 -> Frame 0
      const nextTLB = exec1.updatedTLB;
      const nextPT = exec1.updatedPageTable;
      const nextMem = exec1.updatedPhysicalMemory;

      // 5. SECOND ACCESS to 0x1020: MUST BE A TLB HIT!
      const exec2 = translateVirtualAddress(
        0x1020,
        {
          config: standardConfig,
          tlb: nextTLB,
          pageTable: nextPT,
          physicalMemory: nextMem,
          currentTime: 2,
        }
      );

      expect(exec2.result.isTLBHit).toBe(true);
      expect(exec2.result.isPageFault).toBe(false);
      expect(exec2.result.physicalAddress?.rawAddress).toBe(32);
    });
  });
});
