/**
 * OScope — File Allocation Preview Engine
 * Pure, non-mutating preview calculating candidate blocks, fragmentation, and potential allocation blocks.
 */

import type {
  FileSystemState,
  FileSpecification,
  AllocationStrategy,
  AllocationPreview,
} from '../../models/filesystem';
import { analyzeFreeRuns } from './disk';

/**
 * Previews file allocation without mutating the filesystem state.
 */
export function previewAllocation(
  state: FileSystemState,
  spec: FileSpecification,
  strategy: AllocationStrategy,
  maxPointersPerIndex = 16
): AllocationPreview {
  const { fileName, sizeBytes } = spec;

  if (!fileName || fileName.trim().length === 0) {
    return {
      fileName: fileName || 'unnamed',
      fileSizeBytes: sizeBytes || 0,
      strategy,
      dataBlocksNeeded: 0,
      totalBlocksNeeded: 0,
      canAllocate: false,
      candidateBlocks: [],
      internalFragmentationBytes: 0,
      externalFragmentationBlocking: false,
      reason: 'File name must not be empty.',
    };
  }

  const dataBlocksNeeded = Math.max(1, Math.ceil((sizeBytes || 0) / state.blockSizeBytes));
  const totalBlocksNeeded = strategy === 'INDEXED' ? dataBlocksNeeded + 1 : dataBlocksNeeded;

  const allocatedBytes = dataBlocksNeeded * state.blockSizeBytes;
  const internalFragmentationBytes = Math.max(0, allocatedBytes - (sizeBytes || 0));

  const analysis = analyzeFreeRuns(state.diskBlocks);

  if (strategy === 'CONTIGUOUS') {
    const suitableRun = analysis.runs.find((r) => r.length >= dataBlocksNeeded);
    if (!suitableRun) {
      const isBlockedByFrag = analysis.totalFreeBlocks >= dataBlocksNeeded;
      return {
        fileName,
        fileSizeBytes: sizeBytes,
        strategy,
        dataBlocksNeeded,
        totalBlocksNeeded,
        canAllocate: false,
        candidateBlocks: [],
        internalFragmentationBytes,
        externalFragmentationBlocking: isBlockedByFrag,
        reason: isBlockedByFrag
          ? `External Fragmentation: ${dataBlocksNeeded} consecutive blocks needed, but largest free run is only ${analysis.largestFreeRun}. Total free blocks (${analysis.totalFreeBlocks}) is sufficient, but storage is fragmented.`
          : `Insufficient disk space: requires ${dataBlocksNeeded} blocks, only ${analysis.totalFreeBlocks} free.`,
      };
    }

    const candidates = suitableRun.blocks.slice(0, dataBlocksNeeded);
    return {
      fileName,
      fileSizeBytes: sizeBytes,
      strategy,
      dataBlocksNeeded,
      totalBlocksNeeded,
      canAllocate: true,
      candidateBlocks: candidates,
      internalFragmentationBytes,
      externalFragmentationBlocking: false,
      reason: `First-Fit candidate: consecutive blocks [${candidates.join(', ')}]. Internal fragmentation: ${internalFragmentationBytes} bytes.`,
    };
  }

  if (strategy === 'LINKED') {
    if (analysis.totalFreeBlocks < dataBlocksNeeded) {
      return {
        fileName,
        fileSizeBytes: sizeBytes,
        strategy,
        dataBlocksNeeded,
        totalBlocksNeeded,
        canAllocate: false,
        candidateBlocks: [],
        internalFragmentationBytes,
        externalFragmentationBlocking: false,
        reason: `Insufficient disk space: requires ${dataBlocksNeeded} blocks, only ${analysis.totalFreeBlocks} free.`,
      };
    }

    const candidates = analysis.freeBlocks.slice(0, dataBlocksNeeded);
    return {
      fileName,
      fileSizeBytes: sizeBytes,
      strategy,
      dataBlocksNeeded,
      totalBlocksNeeded,
      canAllocate: true,
      candidateBlocks: candidates,
      internalFragmentationBytes,
      externalFragmentationBlocking: false,
      reason: `Linked candidate: blocks [${candidates.join(', ')}] linked sequentially. External fragmentation is not a barrier.`,
    };
  }

  if (strategy === 'INDEXED') {
    if (dataBlocksNeeded > maxPointersPerIndex) {
      return {
        fileName,
        fileSizeBytes: sizeBytes,
        strategy,
        dataBlocksNeeded,
        totalBlocksNeeded,
        canAllocate: false,
        candidateBlocks: [],
        internalFragmentationBytes,
        externalFragmentationBlocking: false,
        reason: `Index block capacity exceeded: file needs ${dataBlocksNeeded} data pointers, max capacity is ${maxPointersPerIndex}.`,
      };
    }

    if (analysis.totalFreeBlocks < totalBlocksNeeded) {
      return {
        fileName,
        fileSizeBytes: sizeBytes,
        strategy,
        dataBlocksNeeded,
        totalBlocksNeeded,
        canAllocate: false,
        candidateBlocks: [],
        internalFragmentationBytes,
        externalFragmentationBlocking: false,
        reason: `Insufficient disk space: requires ${totalBlocksNeeded} blocks (${dataBlocksNeeded} data + 1 index block), only ${analysis.totalFreeBlocks} free.`,
      };
    }

    const candidateIndex = analysis.freeBlocks[0];
    const candidateData = analysis.freeBlocks.slice(1, totalBlocksNeeded);
    return {
      fileName,
      fileSizeBytes: sizeBytes,
      strategy,
      dataBlocksNeeded,
      totalBlocksNeeded,
      canAllocate: true,
      candidateBlocks: candidateData,
      candidateIndexBlock: candidateIndex,
      internalFragmentationBytes,
      externalFragmentationBlocking: false,
      reason: `Indexed candidate: Index block #${candidateIndex} pointing to data blocks [${candidateData.join(', ')}].`,
    };
  }

  return {
    fileName,
    fileSizeBytes: sizeBytes,
    strategy,
    dataBlocksNeeded,
    totalBlocksNeeded,
    canAllocate: false,
    candidateBlocks: [],
    internalFragmentationBytes: 0,
    externalFragmentationBlocking: false,
    reason: 'Unknown strategy',
  };
}
