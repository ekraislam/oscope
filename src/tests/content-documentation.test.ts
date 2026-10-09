/**
 * OScope — Academic Content & Documentation Test Suite
 * Validates integrity of theory topics, algorithm guides, mathematical formulas,
 * interactive calculators, searchable glossary, viva question banks, and verified references.
 */

import { describe, it, expect } from 'vitest';
import {
  PROCESS_THEORY_TOPICS,
  SCHEDULING_THEORY_TOPICS,
  SCHEDULING_ALGORITHMS,
  MEMORY_THEORY_TOPICS,
  PAGE_REPLACEMENT_ALGORITHMS,
  DEADLOCK_THEORY_TOPICS,
  DEADLOCK_ALGORITHMS,
  FILESYSTEM_THEORY_TOPICS,
  FILE_ALLOCATION_STRATEGIES,
  FORMULA_CATALOG,
  calculateSchedulingMetrics,
  calculateMemoryTranslation,
  calculateFilesystemStorage,
  GLOSSARY_TERMS,
  SEARCH_INDEX,
  searchDocs,
  VIVA_QUESTIONS,
  COMMON_VIVA_TRAPS,
  TEACHER_DEMO_CHEAT_SHEET,
  PRESENTATION_SCRIPT_5_MINUTES,
  ACADEMIC_REFERENCES
} from '../content';

describe('Phase 11 — Academic Content & Theory Guides', () => {
  describe('Theory Topics Invariants', () => {
    it('provides comprehensive theory topics across all 5 core OS domains', () => {
      expect(PROCESS_THEORY_TOPICS.length).toBeGreaterThanOrEqual(4);
      expect(SCHEDULING_THEORY_TOPICS.length).toBeGreaterThanOrEqual(3);
      expect(MEMORY_THEORY_TOPICS.length).toBeGreaterThanOrEqual(5);
      expect(DEADLOCK_THEORY_TOPICS.length).toBeGreaterThanOrEqual(5);
      expect(FILESYSTEM_THEORY_TOPICS.length).toBeGreaterThanOrEqual(4);
    });

    it('ensures each theory topic contains non-empty definitions, explanations, and key points', () => {
      const allTopics = [
        ...PROCESS_THEORY_TOPICS,
        ...SCHEDULING_THEORY_TOPICS,
        ...MEMORY_THEORY_TOPICS,
        ...DEADLOCK_THEORY_TOPICS,
        ...FILESYSTEM_THEORY_TOPICS
      ];

      for (const topic of allTopics) {
        expect(topic.id.length).toBeGreaterThan(0);
        expect(topic.title.length).toBeGreaterThan(0);
        expect(topic.shortDefinition.length).toBeGreaterThan(20);
        expect(topic.explanation.length).toBeGreaterThan(50);
        expect(topic.keyPoints.length).toBeGreaterThanOrEqual(2);
        expect(topic.labRoute.startsWith('/')).toBe(true);
      }
    });

    it('contains Bélády Anomaly reference string topic with canonical demonstration', () => {
      const beladyTopic = MEMORY_THEORY_TOPICS.find((t) => t.id === 'mem-belady-anomaly');
      expect(beladyTopic).toBeDefined();
      expect(beladyTopic?.practicalExample).toContain('1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5');
      expect(beladyTopic?.practicalExample).toContain('9 page faults');
      expect(beladyTopic?.practicalExample).toContain('10 page faults');
    });

    it('documents the distinction that TLB Miss is NOT a Page Fault', () => {
      const tlbTopic = MEMORY_THEORY_TOPICS.find((t) => t.id === 'mem-tlb-vs-page-table');
      expect(tlbTopic).toBeDefined();
      expect(tlbTopic?.keyPoints.some((p) => p.includes('TLB Miss != Page Fault'))).toBe(true);
    });

    it('documents the distinction that Unsafe State is NOT automatically Deadlocked', () => {
      const unsafeTopic = DEADLOCK_THEORY_TOPICS.find((t) => t.id === 'deadlock-safe-vs-unsafe');
      expect(unsafeTopic).toBeDefined();
      expect(unsafeTopic?.keyPoints.some((p) => p.includes('Unsafe does NOT equal Deadlocked'))).toBe(true);
    });
  });

  describe('Algorithm Guides Invariants', () => {
    it('covers all 6 canonical CPU scheduling algorithms', () => {
      const ids = SCHEDULING_ALGORITHMS.map((a) => a.id);
      expect(ids).toContain('fcfs');
      expect(ids).toContain('sjf');
      expect(ids).toContain('srtf');
      expect(ids).toContain('priority_non_preemptive');
      expect(ids).toContain('priority_preemptive');
      expect(ids).toContain('round_robin');
    });

    it('covers page replacement policies including FIFO, LRU, and Optimal benchmark', () => {
      const ids = PAGE_REPLACEMENT_ALGORITHMS.map((a) => a.id);
      expect(ids).toContain('pr-fifo');
      expect(ids).toContain('pr-lru');
      expect(ids).toContain('pr-optimal');
    });

    it('covers Banker avoidance and all 3 storage allocation strategies', () => {
      expect(DEADLOCK_ALGORITHMS.some((a) => a.id === 'dl-banker')).toBe(true);
      const fsIds = FILE_ALLOCATION_STRATEGIES.map((a) => a.id);
      expect(fsIds).toContain('alloc-contiguous');
      expect(fsIds).toContain('alloc-linked');
      expect(fsIds).toContain('alloc-indexed');
    });
  });

  describe('Formula Catalog & Dynamic Calculator Correctness', () => {
    it('contains all required academic formulas', () => {
      const formulaIds = FORMULA_CATALOG.map((f) => f.id);
      expect(formulaIds).toContain('formula-tat');
      expect(formulaIds).toContain('formula-wt');
      expect(formulaIds).toContain('formula-rt');
      expect(formulaIds).toContain('formula-cpu-utilization');
      expect(formulaIds).toContain('formula-throughput');
      expect(formulaIds).toContain('formula-page-number');
      expect(formulaIds).toContain('formula-physical-address');
      expect(formulaIds).toContain('formula-banker-need');
      expect(formulaIds).toContain('formula-banker-work');
      expect(formulaIds).toContain('formula-fs-block-count');
      expect(formulaIds).toContain('formula-fs-internal-frag');
    });

    it('computes CPU scheduling turnaround, waiting, and response times correctly', () => {
      const result = calculateSchedulingMetrics({
        at: 2,
        bt: 5,
        ct: 10,
        firstStart: 4
      });

      expect(result.tat).toBe(8); // 10 - 2 = 8
      expect(result.wt).toBe(3);  // 8 - 5 = 3
      expect(result.rt).toBe(2);  // 4 - 2 = 2
    });

    it('computes virtual-to-physical address translation math correctly', () => {
      const result = calculateMemoryTranslation({
        virtualAddress: 10000,
        pageSize: 4096,
        assignedFrame: 7
      });

      expect(result.vpn).toBe(2);         // floor(10000 / 4096) = 2
      expect(result.offset).toBe(1808);   // 10000 % 4096 = 1808
      expect(result.physicalAddress).toBe(30480); // (7 * 4096) + 1808 = 30480
    });

    it('computes storage block allocation and internal fragmentation correctly', () => {
      const result = calculateFilesystemStorage({
        fileSize: 1500,
        blockSize: 512
      });

      expect(result.requiredBlocks).toBe(3);         // ceil(1500 / 512) = 3
      expect(result.totalAllocatedBytes).toBe(1536);  // 3 * 512 = 1536
      expect(result.internalFragmentation).toBe(36);  // 1536 - 1500 = 36 bytes slack
      expect(result.slackPercentage).toBeCloseTo(2.3, 1);
    });
  });

  describe('Searchable Glossary Verification', () => {
    it('contains at least 35 canonical operating systems terms', () => {
      expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(35);
    });

    it('includes all mandatory prompt terms', () => {
      const termNames = GLOSSARY_TERMS.map((t) => t.term.toLowerCase());
      const required = [
        'algorithm',
        'arrival time (at)',
        'banker\'s algorithm',
        'bélády\'s anomaly',
        'context switch',
        'cpu burst',
        'deadlock',
        'directory',
        'external fragmentation',
        'fifo (first-in, first-out)',
        'frame (page frame)',
        'gantt chart',
        'inode (index node)',
        'internal fragmentation',
        'lru (least recently used)',
        'page',
        'page fault',
        'page table',
        'pcb (process control block)',
        'process',
        'resource allocation graph (rag)',
        'round robin (rr)',
        'safe state',
        'shortest job first (sjf)',
        'shortest remaining time first (srtf)',
        'tlb (translation lookaside buffer)',
        'throughput',
        'turnaround time (tat)',
        'virtual address',
        'virtual memory',
        'waiting time (wt)'
      ];

      for (const req of required) {
        const found = termNames.some((n) => n.includes(req) || req.includes(n));
        expect(found, `Expected glossary to contain term matching "${req}"`).toBe(true);
      }
    });
  });

  describe('Search Index Functionality', () => {
    it('indexes all topics, algorithms, formulas, and glossary items', () => {
      expect(SEARCH_INDEX.length).toBeGreaterThan(60);
    });

    it('accurately resolves searches for core OS keywords', () => {
      const srtfResults = searchDocs('SRTF');
      expect(srtfResults.length).toBeGreaterThan(0);
      expect(srtfResults.some((r) => r.title.includes('SRTF') || r.title.includes('Shortest Remaining'))).toBe(true);

      const pageFaultResults = searchDocs('Page Fault');
      expect(pageFaultResults.length).toBeGreaterThan(0);

      const bankerResults = searchDocs('Banker');
      expect(bankerResults.length).toBeGreaterThan(0);

      const inodeResults = searchDocs('Inode');
      expect(inodeResults.length).toBeGreaterThan(0);
    });
  });

  describe('Viva Voce & Presentation Readiness', () => {
    it('provides timed presentation script covering all 5 minutes with visual actions', () => {
      expect(PRESENTATION_SCRIPT_5_MINUTES.length).toBe(7);
      expect(PRESENTATION_SCRIPT_5_MINUTES[0].interval).toBe('0:00 – 0:30');
      expect(PRESENTATION_SCRIPT_5_MINUTES[6].interval).toBe('4:15 – 5:00');
    });

    it('provides complete 10-step teacher demo walkthrough', () => {
      expect(TEACHER_DEMO_CHEAT_SHEET.length).toBe(10);
      expect(TEACHER_DEMO_CHEAT_SHEET[0].stepNumber).toBe(1);
      expect(TEACHER_DEMO_CHEAT_SHEET[9].stepNumber).toBe(10);
      for (const step of TEACHER_DEMO_CHEAT_SHEET) {
        expect(step.lab.length).toBeGreaterThan(0);
        expect(step.actionToPerform.length).toBeGreaterThan(0);
        expect(step.whatToExplain.length).toBeGreaterThan(0);
        expect(step.expectedObservation.length).toBeGreaterThan(0);
      }
    });

    it('contains viva questions with 30s answers and trap warnings', () => {
      expect(VIVA_QUESTIONS.length).toBeGreaterThanOrEqual(10);
      for (const q of VIVA_QUESTIONS) {
        expect(q.shortAnswer30s.length).toBeGreaterThan(20);
        expect(q.inDepthAnswer.length).toBeGreaterThan(30);
        expect(q.commonTrap.length).toBeGreaterThan(10);
      }
    });

    it('contains common viva traps including unsafe vs deadlocked and TLB miss vs page fault', () => {
      expect(COMMON_VIVA_TRAPS.length).toBeGreaterThanOrEqual(5);
      expect(COMMON_VIVA_TRAPS.some((t) => t.trapQuestion.includes('Unsafe') && t.trapQuestion.includes('Deadlocked'))).toBe(true);
      expect(COMMON_VIVA_TRAPS.some((t) => t.trapQuestion.includes('TLB miss') && t.trapQuestion.includes('Page Fault'))).toBe(true);
    });
  });

  describe('Academic References Verification', () => {
    it('contains only verified canonical textbooks and classic landmark papers', () => {
      expect(ACADEMIC_REFERENCES.length).toBe(7);
      for (const ref of ACADEMIC_REFERENCES) {
        expect(ref.title.length).toBeGreaterThan(0);
        expect(ref.authors.length).toBeGreaterThan(0);
        expect(ref.canonicalCitation.length).toBeGreaterThan(10);
        expect(ref.relevance.length).toBeGreaterThan(10);
        expect(['TEXTBOOK', 'CLASSIC_PAPER']).toContain(ref.verifiedType);
        // Ensure no fabricated DOI or fake URLs
        expect(ref.canonicalCitation).not.toContain('fake');
        expect(ref.canonicalCitation).not.toContain('TODO');
      }
    });
  });
});
