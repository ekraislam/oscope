/**
 * OScope — File System Consistency Checker
 * Pure audit engine verifying structural integrity across directory entries, Inodes, and disk blocks.
 */

import type {
  FileSystemState,
  FileSystemConsistencyReport,
  ConsistencyCheckItem,
} from '../../models/filesystem';
import { validateLinkedChain } from './linked';
import { validateIndexedPointers } from './indexed';

/**
 * Runs an exhaustive consistency audit on the virtual file system.
 */
export function verifyFileSystemConsistency(state: FileSystemState): FileSystemConsistencyReport {
  const checks: ConsistencyCheckItem[] = [];
  const errors: string[] = [];

  // Check 1: Directory -> Inode References
  let dirToInodePassed = true;
  for (const entry of state.directoryEntries) {
    if (!state.inodes[entry.inodeNumber]) {
      dirToInodePassed = false;
      errors.push(`Dangling Directory Entry: "${entry.path}" references non-existent Inode #${entry.inodeNumber}.`);
    }
  }
  checks.push({
    name: 'Directory → Inode Integrity',
    passed: dirToInodePassed,
    details: dirToInodePassed
      ? 'All directory entries point to valid Inode records.'
      : 'One or more directory entries reference non-existent Inodes.',
  });

  // Check 2: Inode -> Block References & Ownership
  let inodeToBlockPassed = true;
  const blockClaimants = new Map<number, number[]>(); // blockNumber -> inodeNumbers[]

  for (const inode of Object.values(state.inodes)) {
    // Check direct data blocks
    for (const bNum of inode.directBlocks) {
      if (bNum < 0 || bNum >= state.diskBlocks.length) {
        inodeToBlockPassed = false;
        errors.push(`Invalid Block Reference: Inode #${inode.inodeNumber} references out-of-bounds Block #${bNum}.`);
      } else {
        const claims = blockClaimants.get(bNum) ?? [];
        claims.push(inode.inodeNumber);
        blockClaimants.set(bNum, claims);

        const b = state.diskBlocks[bNum];
        if (!b.isAllocated) {
          inodeToBlockPassed = false;
          errors.push(`Block Allocation Mismatch: Inode #${inode.inodeNumber} references Block #${bNum}, but block is marked FREE.`);
        }
      }
    }

    // Check index block if INDEXED
    if (inode.allocationStrategy === 'INDEXED' && inode.indexBlock !== undefined) {
      const idxB = inode.indexBlock;
      if (idxB < 0 || idxB >= state.diskBlocks.length) {
        inodeToBlockPassed = false;
        errors.push(`Invalid Index Block Reference: Inode #${inode.inodeNumber} references out-of-bounds Index Block #${idxB}.`);
      } else {
        const claims = blockClaimants.get(idxB) ?? [];
        claims.push(inode.inodeNumber);
        blockClaimants.set(idxB, claims);

        const b = state.diskBlocks[idxB];
        if (!b.isAllocated || !b.isIndexBlock) {
          inodeToBlockPassed = false;
          errors.push(`Index Block Mismatch: Block #${idxB} referenced as Index Block by Inode #${inode.inodeNumber}, but is not marked INDEX.`);
        }
      }
    }
  }
  checks.push({
    name: 'Inode → Disk Block References',
    passed: inodeToBlockPassed,
    details: inodeToBlockPassed
      ? 'All Inode block pointers reference allocated, in-bounds disk blocks.'
      : 'One or more Inodes contain invalid or unallocated block references.',
  });

  // Check 3: No Block Ownership Conflicts (Double Allocation)
  let noConflictsPassed = true;
  for (const [bNum, claimants] of blockClaimants) {
    if (claimants.length > 1) {
      noConflictsPassed = false;
      errors.push(`Cross-Allocation Conflict: Block #${bNum} is claimed simultaneously by multiple Inodes: [${claimants.join(', ')}].`);
    }
  }
  checks.push({
    name: 'Cross-Allocation Conflict Check',
    passed: noConflictsPassed,
    details: noConflictsPassed
      ? 'No disk blocks are doubly allocated across multiple files.'
      : 'Cross-allocation detected: disk blocks shared across files without copy-on-write.',
  });

  // Check 4: Free-Block Accounting Tally
  const actualFreeBlocks = state.diskBlocks.filter((b) => !b.isAllocated).length;
  const freeTallyPassed = actualFreeBlocks === state.freeBlocksCount;
  if (!freeTallyPassed) {
    errors.push(`Free-Space Tally Mismatch: state.freeBlocksCount (${state.freeBlocksCount}) differs from actual free blocks (${actualFreeBlocks}).`);
  }
  checks.push({
    name: 'Free-Block Accounting Integrity',
    passed: freeTallyPassed,
    details: freeTallyPassed
      ? `Free blocks count accurately matches physical disk state (${actualFreeBlocks} free / ${state.totalBlocks} total).`
      : `Free space metadata mismatch (${state.freeBlocksCount} reported vs ${actualFreeBlocks} actual).`,
  });

  // Check 5: Linked Allocation Chain Traversal
  let linkedIntegrityPassed = true;
  for (const inode of Object.values(state.inodes)) {
    if (inode.allocationStrategy === 'LINKED' && inode.directBlocks.length > 0) {
      const chainCheck = validateLinkedChain(state.diskBlocks, inode.directBlocks[0], inode.blockCount);
      if (!chainCheck.valid) {
        linkedIntegrityPassed = false;
        errors.push(`Linked Chain Corruption: File "${inode.fileName}" (Inode #${inode.inodeNumber}): ${chainCheck.error}`);
      }
    }
  }
  checks.push({
    name: 'Linked Allocation Chain Integrity',
    passed: linkedIntegrityPassed,
    details: linkedIntegrityPassed
      ? 'All linked file chains are acyclic, complete, and properly terminated with EOF.'
      : 'Linked chain corruption or loops detected in file pointer structures.',
  });

  // Check 6: Indexed Allocation Pointer Integrity
  let indexedIntegrityPassed = true;
  for (const inode of Object.values(state.inodes)) {
    if (inode.allocationStrategy === 'INDEXED') {
      if (inode.indexBlock === undefined) {
        indexedIntegrityPassed = false;
        errors.push(`Missing Index Block: Inode #${inode.inodeNumber} uses INDEXED strategy but has no index block pointer.`);
      } else {
        const valid = validateIndexedPointers(state.diskBlocks, inode.indexBlock, inode.directBlocks);
        if (!valid) {
          indexedIntegrityPassed = false;
          errors.push(`Indexed Structure Corruption: Inode #${inode.inodeNumber} has invalid index block or data pointers.`);
        }
      }
    }
  }
  checks.push({
    name: 'Indexed Allocation Structure Integrity',
    passed: indexedIntegrityPassed,
    details: indexedIntegrityPassed
      ? 'All index blocks are dedicated, allocated, and point to valid data blocks.'
      : 'Corrupted indexed allocation structures detected.',
  });

  const isConsistent = errors.length === 0;

  return Object.freeze({
    isConsistent,
    checks: Object.freeze(checks),
    errors: Object.freeze(errors),
  });
}
