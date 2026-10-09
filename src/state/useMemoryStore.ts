/**
 * OScope — Memory Management & Paging Laboratory Zustand Store
 * Orchestrates address translation pipelines, hardware TLB caches, page tables,
 * physical frames, and page replacement simulations.
 */

import { create } from 'zustand';
import type {
  MemoryConfiguration,
  AddressTranslationResult,
  ReplacementAlgorithm,
  ReplacementResult,
} from '../core/models/memory';
import {
  type TLBState,
  type PageTableState,
  type PhysicalMemoryState,
  createTLB,
  createPageTable,
  createPhysicalMemory,
  translateVirtualAddress,
  runFIFOReplacement,
  runLRUReplacement,
  runOptimalReplacement,
  compareReplacementAlgorithms,
  type PageReplacementComparisonResult,
  MEMORY_PRESETS,
} from '../core/algorithms/memory';
import { validateMemoryConfig, validateReferenceString, validateVirtualAddress } from '../core/utils/validation';

export interface MemoryStoreState {
  // Configuration
  config: MemoryConfiguration;

  // Address Translation Observatory state
  virtualAddressInput: number;
  tlb: TLBState;
  pageTable: PageTableState;
  physicalMemory: PhysicalMemoryState;
  translationResult: AddressTranslationResult | null;
  translationEvents: readonly string[];
  simulationTime: number;

  // Page Replacement Laboratory state
  referenceString: number[];
  selectedReplacementAlgorithm: ReplacementAlgorithm;
  replacementFrameCount: number;
  replacementResult: ReplacementResult | null;
  comparisonResult: PageReplacementComparisonResult | null;

  // Step-by-step playback state
  currentPlaybackStep: number;
  isPlaying: boolean;
  activeTab: 'translation' | 'replacement' | 'comparison' | 'theory';
  activePresetId: string;

  // Actions
  setVirtualAddressInput: (address: number) => { success: boolean; error?: string };
  runTranslation: () => void;
  resetTranslationState: () => void;
  updateMemoryConfig: (updated: Partial<MemoryConfiguration>) => { success: boolean; error?: string };

  setReplacementAlgorithm: (algo: ReplacementAlgorithm) => void;
  setReferenceString: (refString: number[]) => { success: boolean; error?: string };
  setReplacementFrameCount: (frames: number) => void;
  runPageReplacement: () => void;
  runComparison: () => void;

  loadPreset: (presetId: string) => void;
  goToPlaybackStep: (step: number) => void;
  stepForward: () => void;
  stepBack: () => void;
  resetPlayback: () => void;
  setActiveTab: (tab: 'translation' | 'replacement' | 'comparison' | 'theory') => void;
}

export const useMemoryStore = create<MemoryStoreState>((set, get) => {
  // Default hardware configuration: 4KB pages, 16KB RAM (4 frames), 4-entry TLB, 16-bit address space
  const initialConfig: MemoryConfiguration = {
    pageSizeBytes: 4096,
    totalMemoryBytes: 16384,
    frameCount: 4,
    tlbSize: 4,
    virtualAddressBits: 16,
    virtualMemoryBytes: 65536,
  };

  // Initial Page Table (16 pages): Page 0 -> Frame 1, Page 2 -> Frame 3 mapped
  const initialPageTable = createPageTable(16, [
    { page: 0, frame: 1 },
    { page: 2, frame: 3 },
  ]);

  // Initial Physical Memory (4 frames): Frame 1 = Page 0, Frame 3 = Page 2
  const initialPhysicalMemory = createPhysicalMemory(4, [
    { frame: 1, page: 0 },
    { frame: 3, page: 2 },
  ]);

  // Initial TLB: Preload Page 2 -> Frame 3 to demonstrate TLB hit
  let initialTLB = createTLB(4);
  initialTLB = Object.freeze({
    capacity: 4,
    entries: Object.freeze([{ pageNumber: 2, frameNumber: 3, lastUsedTime: 0 }]),
  });

  const initialVirtualAddress = 0x2A3F; // Page 2, Offset 0xA3F (2623)

  // Initial reference string for page replacement (Silberschatz classic)
  const initialRefString = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
  const initialFrameCount = 3;
  const initialReplacementResult = runFIFOReplacement(initialRefString, initialFrameCount);

  // Compute initial translation
  const initialTranslationOutput = translateVirtualAddress(
    initialVirtualAddress,
    {
      config: initialConfig,
      tlb: initialTLB,
      pageTable: initialPageTable,
      physicalMemory: initialPhysicalMemory,
      currentTime: 1,
    }
  );

  return {
    config: initialConfig,
    virtualAddressInput: initialVirtualAddress,
    tlb: initialTranslationOutput.updatedTLB,
    pageTable: initialTranslationOutput.updatedPageTable,
    physicalMemory: initialTranslationOutput.updatedPhysicalMemory,
    translationResult: initialTranslationOutput.result,
    translationEvents: initialTranslationOutput.generatedEvents,
    simulationTime: 1,

    referenceString: initialRefString,
    selectedReplacementAlgorithm: 'FIFO',
    replacementFrameCount: initialFrameCount,
    replacementResult: initialReplacementResult,
    comparisonResult: null,

    currentPlaybackStep: 0,
    isPlaying: false,
    activeTab: 'translation',
    activePresetId: '',

    setVirtualAddressInput: (address: number) => {
      const state = get();
      const maxSpace = state.config.virtualMemoryBytes ?? 65536;
      const validation = validateVirtualAddress(address, maxSpace);
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] };
      }

      set({ virtualAddressInput: address });
      get().runTranslation();
      return { success: true };
    },

    runTranslation: () => {
      const state = get();
      const nextTime = state.simulationTime + 1;

      const output = translateVirtualAddress(
        state.virtualAddressInput,
        {
          config: state.config,
          tlb: state.tlb,
          pageTable: state.pageTable,
          physicalMemory: state.physicalMemory,
          currentTime: nextTime,
        },
        state.selectedReplacementAlgorithm === 'LRU' ? 'LRU' : 'FIFO'
      );

      set({
        translationResult: output.result,
        tlb: output.updatedTLB,
        pageTable: output.updatedPageTable,
        physicalMemory: output.updatedPhysicalMemory,
        translationEvents: [...state.translationEvents, ...output.generatedEvents],
        simulationTime: nextTime,
      });
    },

    resetTranslationState: () => {
      const state = get();
      const numPages = Math.round(
        (state.config.virtualMemoryBytes ?? 65536) / state.config.pageSizeBytes
      );
      const cleanPT = createPageTable(numPages);
      const cleanMem = createPhysicalMemory(state.config.frameCount);
      const cleanTLB = createTLB(state.config.tlbSize);

      set({
        tlb: cleanTLB,
        pageTable: cleanPT,
        physicalMemory: cleanMem,
        translationResult: null,
        translationEvents: [],
        simulationTime: 0,
      });
    },

    updateMemoryConfig: (updated) => {
      const state = get();
      const merged: MemoryConfiguration = {
        ...state.config,
        ...updated,
      };

      const validation = validateMemoryConfig(merged);
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] };
      }

      const numPages = Math.round(
        (merged.virtualMemoryBytes ?? 65536) / merged.pageSizeBytes
      );
      const cleanPT = createPageTable(numPages);
      const cleanMem = createPhysicalMemory(merged.frameCount);
      const cleanTLB = createTLB(merged.tlbSize);

      set({
        config: merged,
        pageTable: cleanPT,
        physicalMemory: cleanMem,
        tlb: cleanTLB,
        translationResult: null,
        translationEvents: [],
      });

      return { success: true };
    },

    setReplacementAlgorithm: (algo) => {
      set({ selectedReplacementAlgorithm: algo });
      get().runPageReplacement();
    },

    setReferenceString: (refString) => {
      const validation = validateReferenceString(refString);
      if (!validation.valid) {
        return { success: false, error: validation.errors[0] };
      }

      set({ referenceString: [...refString], currentPlaybackStep: 0 });
      get().runPageReplacement();
      if (get().activeTab === 'comparison') {
        get().runComparison();
      }
      return { success: true };
    },

    setReplacementFrameCount: (frames) => {
      if (frames <= 0) return;
      set({ replacementFrameCount: frames, currentPlaybackStep: 0 });
      get().runPageReplacement();
      if (get().activeTab === 'comparison') {
        get().runComparison();
      }
    },

    runPageReplacement: () => {
      const state = get();
      if (state.referenceString.length === 0) {
        set({ replacementResult: null });
        return;
      }

      let res: ReplacementResult;
      switch (state.selectedReplacementAlgorithm) {
        case 'FIFO':
          res = runFIFOReplacement(state.referenceString, state.replacementFrameCount);
          break;
        case 'LRU':
          res = runLRUReplacement(state.referenceString, state.replacementFrameCount);
          break;
        case 'OPTIMAL':
          res = runOptimalReplacement(state.referenceString, state.replacementFrameCount);
          break;
      }

      set({ replacementResult: res });
    },

    runComparison: () => {
      const state = get();
      if (state.referenceString.length === 0) return;
      const comp = compareReplacementAlgorithms(state.referenceString, state.replacementFrameCount);
      set({ comparisonResult: comp });
    },

    loadPreset: (presetId) => {
      const preset = MEMORY_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      if (preset.category === 'TRANSLATION') {
        const mergedConfig = { ...get().config, ...preset.config };
        const numPages = Math.round(
          (mergedConfig.virtualMemoryBytes ?? 65536) / mergedConfig.pageSizeBytes
        );

        let initialPT = createPageTable(numPages);
        let initialMem = createPhysicalMemory(mergedConfig.frameCount);
        let initialTLB = createTLB(mergedConfig.tlbSize);

        if (preset.id === 'tlb_hit_demo') {
          // Preset 2: Preload Page 3 -> Frame 7 in both PT and TLB
          initialPT = createPageTable(numPages, [{ page: 3, frame: 7 }]);
          initialMem = createPhysicalMemory(mergedConfig.frameCount, [{ frame: 7, page: 3 }]);
          initialTLB = Object.freeze({
            capacity: mergedConfig.tlbSize,
            entries: Object.freeze([{ pageNumber: 3, frameNumber: 7, lastUsedTime: 0 }]),
          });
        } else if (preset.id === 'tlb_miss_valid_pt') {
          // Preset 3: Preload Page 2 -> Frame 4 in PT only (empty TLB)
          initialPT = createPageTable(numPages, [{ page: 2, frame: 4 }]);
          initialMem = createPhysicalMemory(mergedConfig.frameCount, [{ frame: 4, page: 2 }]);
          initialTLB = createTLB(mergedConfig.tlbSize);
        }

        const vAddr = preset.virtualAddress ?? 0x1000;
        const translationOutput = translateVirtualAddress(vAddr, {
          config: mergedConfig,
          tlb: initialTLB,
          pageTable: initialPT,
          physicalMemory: initialMem,
          currentTime: 1,
        });

        set({
          config: mergedConfig,
          virtualAddressInput: vAddr,
          tlb: translationOutput.updatedTLB,
          pageTable: translationOutput.updatedPageTable,
          physicalMemory: translationOutput.updatedPhysicalMemory,
          translationResult: translationOutput.result,
          translationEvents: translationOutput.generatedEvents,
          activeTab: 'translation',
          activePresetId: preset.id,
        });
      } else {
        // REPLACEMENT or ANOMALY preset
        const refStr = preset.referenceString ? [...preset.referenceString] : get().referenceString;
        const fCount = preset.frameCount ?? 3;
        const algo = preset.recommendedAlgorithm ?? 'FIFO';

        set({
          referenceString: refStr,
          replacementFrameCount: fCount,
          selectedReplacementAlgorithm: algo,
          currentPlaybackStep: 0,
          activeTab: preset.id === 'multi_algo_comparison' ? 'comparison' : 'replacement',
          activePresetId: preset.id,
        });

        get().runPageReplacement();
        if (preset.id === 'multi_algo_comparison') {
          get().runComparison();
        }
      }
    },

    goToPlaybackStep: (step) => {
      const res = get().replacementResult;
      if (!res || res.steps.length === 0) return;
      const clamped = Math.max(0, Math.min(step, res.steps.length - 1));
      set({ currentPlaybackStep: clamped });
    },

    stepForward: () => {
      const state = get();
      if (!state.replacementResult) return;
      const maxStep = state.replacementResult.steps.length - 1;
      if (state.currentPlaybackStep < maxStep) {
        set({ currentPlaybackStep: state.currentPlaybackStep + 1 });
      }
    },

    stepBack: () => {
      const state = get();
      if (state.currentPlaybackStep > 0) {
        set({ currentPlaybackStep: state.currentPlaybackStep - 1 });
      }
    },

    resetPlayback: () => {
      set({ currentPlaybackStep: 0, isPlaying: false });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
      if (tab === 'comparison') {
        get().runComparison();
      }
    },
  };
});
