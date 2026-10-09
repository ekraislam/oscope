/**
 * OScope — File System & Storage Allocation Laboratory Zustand Store
 * Orchestrates deterministic virtual disk state, Inode management, directory tree,
 * contiguous/linked/indexed allocation previews, file lifecycle operations,
 * read access simulations, consistency audits, and educational telemetry.
 */

import { create } from 'zustand';
import type {
  FileSystemState,
  AllocationStrategy,
  FreeSpaceAnalysis,
  FileAllocationResult,
  AllocationPreview,
  BlockAccessResult,
  FileSystemConsistencyReport,
} from '../core/models/filesystem';
import {
  analyzeFreeRuns,
  createFile,
  deleteFile,
  createDirectory as coreCreateDirectory,
  previewAllocation,
  simulateBlockAccess,
  verifyFileSystemConsistency,
  FILESYSTEM_PRESETS,
} from '../core/algorithms/filesystem';
import {
  createSimulationEvent,
  type SimulationEvent,
} from '../core/models/simulation';

export type FileSystemTab =
  | 'explorer'
  | 'disk'
  | 'inode'
  | 'comparison'
  | 'access'
  | 'consistency'
  | 'theory';

export interface FileCreationForm {
  fileName: string;
  sizeBytes: number;
  strategy: AllocationStrategy;
  directoryPath: string;
}

export interface FileSystemStoreState {
  // Active Preset & Subsystem State
  activePresetId: string;
  state: FileSystemState;
  freeSpaceAnalysis: FreeSpaceAnalysis;
  consistencyReport: FileSystemConsistencyReport;

  // Navigation & Selection Synchronization
  currentDirectory: string;
  selectedBlockNumber: number | null;
  selectedInodeNumber: number | null;
  selectedFilePath: string | null;
  selectedStrategy: AllocationStrategy;

  // Active View Tab
  activeTab: FileSystemTab;

  // File Creation & Allocation Preview
  creationForm: FileCreationForm;
  preview: AllocationPreview | null;
  lastAllocationResult: FileAllocationResult | null;

  // Block Access Trace Simulation
  accessTargetFileName: string;
  accessLogicalBlockIndex: number;
  lastAccessResult: BlockAccessResult | null;

  // Telemetry & Educational Explanations
  simulationTime: number;
  simulationEvents: readonly SimulationEvent[];
  explanation: string | null;
  notification: { message: string; severity: 'success' | 'danger' | 'info' | 'warning' } | null;

  // Store Actions
  loadPreset: (presetId: string) => void;
  resetToPreset: () => void;
  setActiveTab: (tab: FileSystemTab) => void;
  setCurrentDirectory: (path: string) => void;

  // Selection Synchronizers
  selectBlock: (blockNumber: number | null) => void;
  selectInode: (inodeNumber: number | null) => void;
  selectFile: (path: string | null) => void;
  clearSelection: () => void;

  // Allocation Strategy Switcher
  setSelectedStrategy: (strategy: AllocationStrategy) => void;

  // File Creation Form & Actions
  updateCreationForm: (partial: Partial<FileCreationForm>) => void;
  executeFileCreation: () => boolean;
  executeFileDeletion: (path: string) => boolean;
  executeCreateDirectory: (parentPath: string, dirName: string) => boolean;

  // Educational Access Simulator
  setAccessTarget: (fileName: string, logicalBlockIndex: number) => void;
  executeAccessSimulation: () => void;

  // Consistency Audit
  runConsistencyAudit: () => void;

  // Educational Explanations
  generateExplanation: () => void;
  clearNotification: () => void;
}

// Initial Preset: Contiguous File Layout
const initialPreset = FILESYSTEM_PRESETS[1] ?? FILESYSTEM_PRESETS[0];
const initialFreeRuns = analyzeFreeRuns(initialPreset.state.diskBlocks);
const initialConsistency = verifyFileSystemConsistency(initialPreset.state);

const initialForm: FileCreationForm = {
  fileName: initialPreset.recommendedFileName ?? 'project.dat',
  sizeBytes: initialPreset.recommendedSizeBytes ?? 2048,
  strategy: initialPreset.recommendedStrategy ?? 'CONTIGUOUS',
  directoryPath: initialPreset.state.currentDirectory,
};

const initialPreview = previewAllocation(
  initialPreset.state,
  {
    fileName: initialForm.fileName,
    sizeBytes: initialForm.sizeBytes,
    directoryPath: initialForm.directoryPath,
  },
  initialForm.strategy
);

export const useFileSystemStore = create<FileSystemStoreState>((set, get) => ({
  activePresetId: initialPreset.id,
  state: initialPreset.state,
  freeSpaceAnalysis: initialFreeRuns,
  consistencyReport: initialConsistency,

  currentDirectory: initialPreset.state.currentDirectory,
  selectedBlockNumber: null,
  selectedInodeNumber: null,
  selectedFilePath: null,
  selectedStrategy: initialForm.strategy,

  activeTab: 'disk',

  creationForm: initialForm,
  preview: initialPreview,
  lastAllocationResult: null,

  accessTargetFileName: 'kernel.sys',
  accessLogicalBlockIndex: 2,
  lastAccessResult: null,

  simulationTime: 0,
  simulationEvents: [
    createSimulationEvent({
      timestamp: 0,
      type: 'CLOCK_TICK',
      sourceModule: 'FILESYSTEM',
      severity: 'INFO',
      description: `File System initialized with preset: "${initialPreset.name}". Total Blocks: ${initialPreset.state.totalBlocks}, Block Size: ${initialPreset.state.blockSizeBytes}B.`,
    }),
  ],
  explanation: null,
  notification: null,

  loadPreset: (presetId: string) => {
    const preset = FILESYSTEM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const analysis = analyzeFreeRuns(preset.state.diskBlocks);
    const consistency = verifyFileSystemConsistency(preset.state);

    const newForm: FileCreationForm = {
      fileName: preset.recommendedFileName ?? 'sample.txt',
      sizeBytes: preset.recommendedSizeBytes ?? 2048,
      strategy: preset.recommendedStrategy ?? 'CONTIGUOUS',
      directoryPath: preset.state.currentDirectory,
    };

    const newPreview = previewAllocation(
      preset.state,
      {
        fileName: newForm.fileName,
        sizeBytes: newForm.sizeBytes,
        directoryPath: newForm.directoryPath,
      },
      newForm.strategy
    );

    // Pick first file if available for access demo
    const firstFile = preset.state.directoryEntries.find((e) => e.type === 'FILE');

    set((state) => ({
      activePresetId: preset.id,
      state: preset.state,
      freeSpaceAnalysis: analysis,
      consistencyReport: consistency,
      currentDirectory: preset.state.currentDirectory,
      selectedBlockNumber: null,
      selectedInodeNumber: null,
      selectedFilePath: null,
      selectedStrategy: newForm.strategy,
      creationForm: newForm,
      preview: newPreview,
      lastAllocationResult: null,
      accessTargetFileName: firstFile ? firstFile.name : '',
      accessLogicalBlockIndex: 0,
      lastAccessResult: null,
      explanation: null,
      notification: {
        message: `Loaded preset: ${preset.name}`,
        severity: 'info',
      },
      simulationEvents: [
        createSimulationEvent({
          timestamp: state.simulationTime + 1,
          type: 'CLOCK_TICK',
          sourceModule: 'FILESYSTEM',
          severity: 'INFO',
          description: `Loaded preset "${preset.name}". ${preset.description}`,
        }),
        ...state.simulationEvents.slice(0, 49),
      ],
      simulationTime: state.simulationTime + 1,
    }));
  },

  resetToPreset: () => {
    const { activePresetId, loadPreset } = get();
    loadPreset(activePresetId);
  },

  setActiveTab: (tab: FileSystemTab) => {
    set({ activeTab: tab });
  },

  setCurrentDirectory: (path: string) => {
    set((s) => {
      const updatedState = Object.freeze({ ...s.state, currentDirectory: path });
      const updatedForm = { ...s.creationForm, directoryPath: path };
      const newPreview = previewAllocation(
        updatedState,
        {
          fileName: updatedForm.fileName,
          sizeBytes: updatedForm.sizeBytes,
          directoryPath: updatedForm.directoryPath,
        },
        updatedForm.strategy
      );

      return {
        currentDirectory: path,
        state: updatedState,
        creationForm: updatedForm,
        preview: newPreview,
      };
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SYNCHRONIZED SELECTION ENGINE
  // Block <-> File <-> Inode <-> Directory Entry
  // ─────────────────────────────────────────────────────────────────────────
  selectBlock: (blockNumber: number | null) => {
    if (blockNumber === null) {
      set({ selectedBlockNumber: null });
      return;
    }

    const { state } = get();
    const block = state.diskBlocks.find((b) => b.blockNumber === blockNumber);

    if (!block || !block.isAllocated || block.inodeNumber === null) {
      // Free block clicked
      set({
        selectedBlockNumber: blockNumber,
        selectedInodeNumber: null,
        selectedFilePath: null,
        explanation: `Block #${blockNumber} is currently FREE in the storage pool. No Inode or directory entry points to it.`,
      });
      return;
    }

    // Allocated block clicked -> synchronize to owning Inode and Directory Entry
    const inode = state.inodes[block.inodeNumber];
    const entry = state.directoryEntries.find((e) => e.inodeNumber === block.inodeNumber);

    let explanation = `Block #${blockNumber} is owned by file "${block.fileName}" (Inode #${block.inodeNumber}). Role: ${block.role}.`;
    if (block.role === 'INDEX') {
      explanation += ` This is a dedicated INDEX BLOCK containing pointers to data blocks.`;
    } else if (inode && inode.allocationStrategy === 'LINKED') {
      explanation += ` Linked allocation pointer: ${block.nextBlock === -1 ? 'EOF' : `-> Block #${block.nextBlock}`}.`;
    } else if (inode && inode.allocationStrategy === 'CONTIGUOUS') {
      const offset = inode.directBlocks.indexOf(blockNumber);
      explanation += ` Contiguous allocation: Logical Offset ${offset} (Base block ${inode.directBlocks[0]}).`;
    }

    set({
      selectedBlockNumber: blockNumber,
      selectedInodeNumber: block.inodeNumber,
      selectedFilePath: entry ? entry.path : null,
      selectedStrategy: inode ? inode.allocationStrategy : get().selectedStrategy,
      accessTargetFileName: block.fileName ?? get().accessTargetFileName,
      explanation,
    });
  },

  selectInode: (inodeNumber: number | null) => {
    if (inodeNumber === null) {
      set({ selectedInodeNumber: null });
      return;
    }

    const { state } = get();
    const inode = state.inodes[inodeNumber];
    if (!inode) {
      set({ selectedInodeNumber: null });
      return;
    }

    const entry = state.directoryEntries.find((e) => e.inodeNumber === inodeNumber);
    const primaryBlock = inode.directBlocks.length > 0 ? inode.directBlocks[0] : null;

    let explanation = `Inode #${inodeNumber}: File "${inode.fileName}" (${inode.fileSizeBytes} bytes, ${inode.blockCount} blocks). Strategy: ${inode.allocationStrategy}.`;
    if (inode.allocationStrategy === 'INDEXED') {
      explanation += ` Index Block #${inode.indexBlock} holds pointers to blocks [${inode.directBlocks.join(', ')}].`;
    } else if (inode.allocationStrategy === 'LINKED') {
      explanation += ` Linked chain: ${inode.directBlocks.join(' -> ')} -> EOF.`;
    } else {
      explanation += ` Consecutive disk run [${inode.directBlocks.join(', ')}]. Internal fragmentation: ${inode.internalFragmentationBytes} bytes.`;
    }

    set({
      selectedInodeNumber: inodeNumber,
      selectedFilePath: entry ? entry.path : null,
      selectedBlockNumber: primaryBlock,
      selectedStrategy: inode.allocationStrategy,
      accessTargetFileName: inode.fileName,
      explanation,
    });
  },

  selectFile: (path: string | null) => {
    if (path === null) {
      set({ selectedFilePath: null });
      return;
    }

    const { state } = get();
    const entry = state.directoryEntries.find((e) => e.path === path);
    if (!entry) {
      set({ selectedFilePath: null });
      return;
    }

    if (entry.type === 'DIRECTORY') {
      set({
        selectedFilePath: path,
        currentDirectory: path,
        selectedInodeNumber: entry.inodeNumber,
        selectedBlockNumber: null,
        explanation: `Directory "${entry.name}" selected. Path: ${entry.path}.`,
      });
      return;
    }

    // Synchronize to Inode and Disk Blocks
    const inode = state.inodes[entry.inodeNumber];
    const primaryBlock = inode && inode.directBlocks.length > 0 ? inode.directBlocks[0] : null;

    let explanation = `File "${entry.name}" selected. Inode #${entry.inodeNumber}.`;
    if (inode) {
      explanation += ` Stored via ${inode.allocationStrategy} allocation across ${inode.blockCount} block(s).`;
    }

    set({
      selectedFilePath: path,
      selectedInodeNumber: entry.inodeNumber,
      selectedBlockNumber: primaryBlock,
      selectedStrategy: inode ? inode.allocationStrategy : get().selectedStrategy,
      accessTargetFileName: entry.name,
      explanation,
    });
  },

  clearSelection: () => {
    set({
      selectedBlockNumber: null,
      selectedInodeNumber: null,
      selectedFilePath: null,
      explanation: null,
    });
  },

  setSelectedStrategy: (strategy: AllocationStrategy) => {
    set((s) => {
      const updatedForm = { ...s.creationForm, strategy };
      const newPreview = previewAllocation(
        s.state,
        {
          fileName: updatedForm.fileName,
          sizeBytes: updatedForm.sizeBytes,
          directoryPath: updatedForm.directoryPath,
        },
        strategy
      );

      return {
        selectedStrategy: strategy,
        creationForm: updatedForm,
        preview: newPreview,
      };
    });
  },

  updateCreationForm: (partial: Partial<FileCreationForm>) => {
    set((s) => {
      const updatedForm = { ...s.creationForm, ...partial };
      const newPreview = previewAllocation(
        s.state,
        {
          fileName: updatedForm.fileName,
          sizeBytes: updatedForm.sizeBytes,
          directoryPath: updatedForm.directoryPath,
        },
        updatedForm.strategy
      );

      return {
        creationForm: updatedForm,
        selectedStrategy: updatedForm.strategy,
        preview: newPreview,
      };
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FILE CREATION DISPATCHER
  // ─────────────────────────────────────────────────────────────────────────
  executeFileCreation: (): boolean => {
    const { state, creationForm, simulationTime, simulationEvents } = get();

    if (!creationForm.fileName.trim()) {
      set({
        notification: { message: 'File creation failed: Filename cannot be empty.', severity: 'danger' },
      });
      return false;
    }

    if (creationForm.sizeBytes < 0) {
      set({
        notification: { message: 'File creation failed: Size cannot be negative.', severity: 'danger' },
      });
      return false;
    }

    const result = createFile(
      state,
      {
        fileName: creationForm.fileName.trim(),
        sizeBytes: creationForm.sizeBytes,
        directoryPath: creationForm.directoryPath,
      },
      creationForm.strategy,
      simulationTime + 1
    );

    if (!result.success) {
      const failEvent = createSimulationEvent({
        timestamp: simulationTime + 1,
        type: 'ALLOCATION_FAILED',
        sourceModule: 'FILESYSTEM',
        severity: 'ERROR',
        description: `Allocation Failed: ${result.reason}`,
        details: {
          strategy: creationForm.strategy,
          fileName: creationForm.fileName,
          requestedBytes: creationForm.sizeBytes,
        },
      });

      set({
        lastAllocationResult: result,
        notification: { message: result.reason, severity: 'danger' },
        simulationEvents: [failEvent, ...simulationEvents.slice(0, 49)],
        simulationTime: simulationTime + 1,
        explanation: result.reason,
      });
      return false;
    }

    // Success! Update disk, free space analysis, consistency report, and emit events
    const updatedState = result.updatedFileSystemState;
    const analysis = analyzeFreeRuns(updatedState.diskBlocks);
    const consistency = verifyFileSystemConsistency(updatedState);

    // Identify created Inode
    const createdEntry = updatedState.directoryEntries.find(
      (e) => e.name === creationForm.fileName.trim() && e.path.startsWith(creationForm.directoryPath)
    );
    const inodeNum = createdEntry?.inodeNumber;

    const events: SimulationEvent[] = [
      createSimulationEvent({
        timestamp: simulationTime + 1,
        type: 'FILE_CREATED',
        sourceModule: 'FILESYSTEM',
        severity: 'SUCCESS',
        description: `File "${result.fileName}" created successfully via ${result.strategy} allocation.`,
        details: {
          fileName: result.fileName,
          strategy: result.strategy,
          blocks: result.allocatedBlockNumbers,
          indexBlock: result.indexBlockNumber,
        },
      }),
      createSimulationEvent({
        timestamp: simulationTime + 1,
        type: 'DISK_BLOCK_ALLOCATED',
        sourceModule: 'FILESYSTEM',
        severity: 'INFO',
        description: `Allocated disk blocks: [${result.allocatedBlockNumbers.join(', ')}]${
          result.indexBlockNumber !== undefined ? ` + Index Block #${result.indexBlockNumber}` : ''
        }.`,
      }),
    ];

    if (inodeNum !== undefined) {
      events.push(
        createSimulationEvent({
          timestamp: simulationTime + 1,
          type: 'INODE_CREATED',
          sourceModule: 'FILESYSTEM',
          severity: 'INFO',
          description: `Inode #${inodeNum} mapped to file "${result.fileName}".`,
        })
      );
    }

    const nextForm: FileCreationForm = {
      ...creationForm,
      fileName: `file_${Object.keys(updatedState.inodes).length + 1}.txt`,
    };

    const nextPreview = previewAllocation(
      updatedState,
      {
        fileName: nextForm.fileName,
        sizeBytes: nextForm.sizeBytes,
        directoryPath: nextForm.directoryPath,
      },
      nextForm.strategy
    );

    set({
      state: updatedState,
      freeSpaceAnalysis: analysis,
      consistencyReport: consistency,
      lastAllocationResult: result,
      creationForm: nextForm,
      preview: nextPreview,
      selectedFilePath: createdEntry ? createdEntry.path : null,
      selectedInodeNumber: inodeNum ?? null,
      selectedBlockNumber: result.allocatedBlockNumbers[0] ?? null,
      accessTargetFileName: result.fileName,
      notification: {
        message: `Successfully allocated "${result.fileName}" across ${result.allocatedBlockNumbers.length} blocks!`,
        severity: 'success',
      },
      simulationEvents: [...events, ...simulationEvents.slice(0, 47)],
      simulationTime: simulationTime + 1,
      explanation: `Successfully allocated "${result.fileName}" using ${result.strategy} placement. Blocks: [${result.allocatedBlockNumbers.join(', ')}]. Internal fragmentation: ${result.fragmentation.internalBytes} bytes.`,
    });

    return true;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FILE DELETION & BLOCK RECLAMATION
  // ─────────────────────────────────────────────────────────────────────────
  executeFileDeletion: (path: string): boolean => {
    const { state, simulationTime, simulationEvents, creationForm } = get();

    const result = deleteFile(state, path);
    if (!result.success) {
      set({
        notification: { message: result.reason, severity: 'danger' },
      });
      return false;
    }

    const updatedState = result.updatedState;
    const analysis = analyzeFreeRuns(updatedState.diskBlocks);
    const consistency = verifyFileSystemConsistency(updatedState);

    const events: SimulationEvent[] = [
      createSimulationEvent({
        timestamp: simulationTime + 1,
        type: 'FILE_DELETED',
        sourceModule: 'FILESYSTEM',
        severity: 'WARN',
        description: `File "${path}" deleted from directory tree.`,
      }),
      createSimulationEvent({
        timestamp: simulationTime + 1,
        type: 'DISK_BLOCK_DEALLOCATED',
        sourceModule: 'FILESYSTEM',
        severity: 'INFO',
        description: `Reclaimed ${result.freedBlocks.length} disk blocks: [${result.freedBlocks.join(', ')}] back to free storage pool.`,
      }),
    ];

    const nextPreview = previewAllocation(
      updatedState,
      {
        fileName: creationForm.fileName,
        sizeBytes: creationForm.sizeBytes,
        directoryPath: creationForm.directoryPath,
      },
      creationForm.strategy
    );

    set({
      state: updatedState,
      freeSpaceAnalysis: analysis,
      consistencyReport: consistency,
      preview: nextPreview,
      selectedFilePath: null,
      selectedInodeNumber: null,
      selectedBlockNumber: null,
      notification: {
        message: `Deleted file. Reclaimed ${result.freedBlocks.length} blocks [${result.freedBlocks.join(', ')}].`,
        severity: 'info',
      },
      simulationEvents: [...events, ...simulationEvents.slice(0, 48)],
      simulationTime: simulationTime + 1,
      explanation: result.reason,
    });

    return true;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DIRECTORY CREATION
  // ─────────────────────────────────────────────────────────────────────────
  executeCreateDirectory: (parentPath: string, dirName: string): boolean => {
    const { state, simulationTime, simulationEvents } = get();

    const result = coreCreateDirectory(state, parentPath, dirName);
    if (!result.success) {
      set({
        notification: { message: result.reason, severity: 'danger' },
      });
      return false;
    }

    const updatedState = result.updatedState;
    const consistency = verifyFileSystemConsistency(updatedState);

    const dirEvent = createSimulationEvent({
      timestamp: simulationTime + 1,
      type: 'DIRECTORY_CREATED',
      sourceModule: 'FILESYSTEM',
      severity: 'SUCCESS',
      description: result.reason,
    });

    set({
      state: updatedState,
      consistencyReport: consistency,
      notification: { message: result.reason, severity: 'success' },
      simulationEvents: [dirEvent, ...simulationEvents.slice(0, 49)],
      simulationTime: simulationTime + 1,
      explanation: result.reason,
    });

    return true;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // READ ACCESS TRACE SIMULATOR
  // ─────────────────────────────────────────────────────────────────────────
  setAccessTarget: (fileName: string, logicalBlockIndex: number) => {
    set({
      accessTargetFileName: fileName,
      accessLogicalBlockIndex: Math.max(0, logicalBlockIndex),
    });
  },

  executeAccessSimulation: () => {
    const { state, accessTargetFileName, accessLogicalBlockIndex, simulationTime, simulationEvents } = get();

    const result = simulateBlockAccess(state, accessTargetFileName, accessLogicalBlockIndex);

    const event = createSimulationEvent({
      timestamp: simulationTime + 1,
      type: 'FILE_ACCESSED',
      sourceModule: 'FILESYSTEM',
      severity: 'INFO',
      description: `Read Access: "${accessTargetFileName}" logical block #${accessLogicalBlockIndex} -> Physical Block #${result.physicalBlockNumber} via ${result.strategy} in ${result.totalSteps} step(s).`,
      details: {
        fileName: accessTargetFileName,
        logicalBlockIndex: accessLogicalBlockIndex,
        physicalBlockNumber: result.physicalBlockNumber,
        strategy: result.strategy,
        totalSteps: result.totalSteps,
      },
    });

    set({
      lastAccessResult: result,
      selectedBlockNumber: result.physicalBlockNumber,
      notification: {
        message: `Resolved access: Logical #${accessLogicalBlockIndex} -> Physical #${result.physicalBlockNumber} (${result.totalSteps} step${result.totalSteps > 1 ? 's' : ''})`,
        severity: 'info',
      },
      simulationEvents: [event, ...simulationEvents.slice(0, 49)],
      simulationTime: simulationTime + 1,
      explanation: result.explanation,
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONSISTENCY AUDITOR
  // ─────────────────────────────────────────────────────────────────────────
  runConsistencyAudit: () => {
    const { state } = get();
    const report = verifyFileSystemConsistency(state);
    set({
      consistencyReport: report,
      notification: {
        message: report.isConsistent
          ? 'File system audit PASSED: All 6 structural invariants satisfied.'
          : `File system audit DETECTED ${report.errors.length} inconsistency error(s).`,
        severity: report.isConsistent ? 'success' : 'danger',
      },
    });
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EDUCATIONAL EXPLANATIONS
  // ─────────────────────────────────────────────────────────────────────────
  generateExplanation: () => {
    const { state, selectedInodeNumber, selectedBlockNumber } = get();

    if (selectedInodeNumber !== null) {
      const inode = state.inodes[selectedInodeNumber];
      if (inode) {
        let text = `[EDUCATIONAL EXPLANATION — INODE #${inode.inodeNumber}]\n\n`;
        text += `File: "${inode.fileName}" (${inode.fileSizeBytes} bytes, occupying ${inode.blockCount} disk block(s)).\n`;
        text += `Strategy: ${inode.allocationStrategy}\n\n`;

        if (inode.allocationStrategy === 'CONTIGUOUS') {
          text += `Why these blocks? Contiguous allocation requires all blocks to form a single continuous extent. The allocator scanned the disk and reserved blocks [${inode.directBlocks.join(', ')}]. Sequential access has minimum seek time, and random access is calculated by: Physical = Base (${inode.directBlocks[0]}) + Logical Offset. However, if consecutive free space is fragmented, future allocations may fail even if total capacity exists.`;
        } else if (inode.allocationStrategy === 'LINKED') {
          text += `Why these blocks? Linked allocation allows blocks to be scattered non-contiguously anywhere on disk. Each block stores a physical pointer to the next block: ${inode.directBlocks.join(' -> ')} -> EOF (-1). This completely eliminates external fragmentation. However, direct access requires traversing pointer hops from the beginning.`;
        } else if (inode.allocationStrategy === 'INDEXED') {
          text += `Why these blocks? Indexed allocation uses a dedicated Index Block (#${inode.indexBlock}) which contains an array of direct pointers to data blocks [${inode.directBlocks.join(', ')}]. This provides fast direct access without requiring contiguous placement, but costs 1 extra block of metadata overhead.`;
        }
        set({ explanation: text });
        return;
      }
    }

    if (selectedBlockNumber !== null) {
      const block = state.diskBlocks.find((b) => b.blockNumber === selectedBlockNumber);
      if (block) {
        if (!block.isAllocated) {
          set({
            explanation: `[EDUCATIONAL EXPLANATION — FREE BLOCK #${selectedBlockNumber}]\n\nBlock #${selectedBlockNumber} is unallocated. It is available in the free storage pool for future file writes.`,
          });
        } else {
          set({
            explanation: `[EDUCATIONAL EXPLANATION — ALLOCATED BLOCK #${selectedBlockNumber}]\n\nBlock #${selectedBlockNumber} is currently allocated to "${block.fileName}" (Inode #${block.inodeNumber}). Role: ${block.role}.`,
          });
        }
        return;
      }
    }

    set({
      explanation: `Select a file, Inode, or disk block to view an educational breakdown of its storage allocation, layout, and pointers.`,
    });
  },

  clearNotification: () => set({ notification: null }),
}));
