/**
 * OScope — File Access Pattern Simulation Engine
 * Simulates sequential vs direct/random block access across Contiguous, Linked, and Indexed allocation.
 */

import type {
  FileSystemState,
  BlockAccessResult,
  BlockAccessStep,
} from '../../models/filesystem';

/**
 * Simulates accessing the k-th logical block of a file, tracing pointer hops and physical block resolution.
 */
export function simulateBlockAccess(
  state: FileSystemState,
  fileNameOrPath: string,
  logicalBlockIndex: number
): BlockAccessResult {
  const entry = state.directoryEntries.find(
    (e) => e.path === fileNameOrPath || e.name === fileNameOrPath || e.path === `/${fileNameOrPath}`
  );

  if (!entry) {
    throw new Error(`AccessError: File "${fileNameOrPath}" not found.`);
  }

  const inode = state.inodes[entry.inodeNumber];
  if (!inode) {
    throw new Error(`AccessError: Inode #${entry.inodeNumber} not found.`);
  }

  if (logicalBlockIndex < 0 || logicalBlockIndex >= inode.blockCount) {
    throw new Error(
      `AccessError: Logical block index ${logicalBlockIndex} out of bounds (file has ${inode.blockCount} blocks, indices 0..${inode.blockCount - 1}).`
    );
  }

  const steps: BlockAccessStep[] = [];
  let physicalBlockNumber = -1;
  let explanation = '';

  switch (inode.allocationStrategy) {
    case 'CONTIGUOUS': {
      // Contiguous: Direct address calculation (O(1))
      physicalBlockNumber = inode.directBlocks[logicalBlockIndex];
      steps.push({
        stepNumber: 1,
        physicalBlockNumber,
        role: 'DATA',
        explanation: `Direct Calculation: Physical Block = StartBlock (${inode.directBlocks[0]}) + Offset (${logicalBlockIndex}) = Block #${physicalBlockNumber}. Immediate O(1) random access.`,
      });
      explanation = `CONTIGUOUS ACCESS: Resolved in 1 direct step via base offset calculation (${inode.directBlocks[0]} + ${logicalBlockIndex} = #${physicalBlockNumber}). Contiguous allocation provides optimal direct/random access.`;
      break;
    }

    case 'LINKED': {
      // Linked: Must traverse pointer chain from block 0 to block k (O(k))
      let currBlock = inode.directBlocks[0];
      let stepNum = 1;

      for (let i = 0; i <= logicalBlockIndex; i++) {
        const isTarget = i === logicalBlockIndex;
        steps.push({
          stepNumber: stepNum++,
          physicalBlockNumber: currBlock,
          role: isTarget ? 'DATA' : 'POINTER_TRAVERSAL',
          explanation: isTarget
            ? `Target reached: Logical block ${logicalBlockIndex} resolved to Physical Block #${currBlock}.`
            : `Pointer Hop ${i + 1}: Inspected Block #${currBlock}, read nextBlock pointer to advance.`,
        });

        if (isTarget) {
          physicalBlockNumber = currBlock;
          break;
        }

        const blockData = state.diskBlocks[currBlock];
        if (blockData.nextBlock === null || blockData.nextBlock === -1) {
          throw new Error(`AccessError: Unexpected end of linked chain at step ${i}`);
        }
        currBlock = blockData.nextBlock;
      }

      explanation = `LINKED ACCESS: Required ${steps.length} sequential pointer hops to reach logical block ${logicalBlockIndex}. Linked allocation cannot jump directly to random blocks without traversing preceding pointers.`;
      break;
    }

    case 'INDEXED': {
      // Indexed: Step 1: Read index block, Step 2: Read target data block (O(1) with 1 indirection)
      const idxBlock = inode.indexBlock!;
      physicalBlockNumber = inode.directBlocks[logicalBlockIndex];

      steps.push({
        stepNumber: 1,
        physicalBlockNumber: idxBlock,
        role: 'INDEX',
        explanation: `Step 1 (Indirection): Consulted dedicated Index Block #${idxBlock} to read entry [${logicalBlockIndex}].`,
      });

      steps.push({
        stepNumber: 2,
        physicalBlockNumber,
        role: 'DATA',
        explanation: `Step 2 (Data): Accessed Physical Block #${physicalBlockNumber} referenced by pointer [${logicalBlockIndex}].`,
      });

      explanation = `INDEXED ACCESS: Resolved in exactly 2 steps (Index Block #${idxBlock} → Data Block #${physicalBlockNumber}). Provides direct random access without pointer traversal, with 1 level of index indirection.`;
      break;
    }
  }

  return Object.freeze({
    fileName: entry.name,
    logicalBlockIndex,
    physicalBlockNumber,
    strategy: inode.allocationStrategy,
    totalSteps: steps.length,
    steps: Object.freeze(steps),
    explanation,
  });
}
