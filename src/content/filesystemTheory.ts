/**
 * OScope — File System & Storage Allocation Theory
 * Academic knowledge base covering file metadata, directory structures, inode models,
 * allocation strategies (Contiguous, Linked, Indexed), and storage fragmentation.
 */

import type { TheoryTopic, AlgorithmGuide } from './types';

export const FILESYSTEM_THEORY_TOPICS: readonly TheoryTopic[] = [
  {
    id: 'fs-file-and-directory',
    title: 'Files, Directories, and Metadata Abstractions',
    subsystem: 'FILESYSTEM',
    shortDefinition:
      'The foundational secondary storage abstractions: a File is a contiguous logical address space of user data; a Directory is a symbol table mapping human-readable names to file descriptors; Metadata encapsulates operational file attributes.',
    explanation:
      'The Operating System abstracts physical non-volatile storage media (magnetic platters, flash SSDs) into logical files. A file represents an arbitrary sequence of bytes or records with persistent lifetime beyond process termination. A directory provides organizational hierarchy, mapping file names to unique system identifiers (such as Inode numbers). File metadata encompasses administrative properties maintained by the kernel: file size, ownership, access permissions, creation/modification timestamps, and pointers to the physical disk blocks where data resides.',
    keyPoints: [
      'File: Named contiguous logical byte stream stored persistently on secondary media.',
      'Directory: Special file or data structure that maps human-readable path strings to low-level internal file identifiers (inumbers).',
      'Metadata: Information ABOUT the file (size, timestamps, permissions, block pointers) separated from the raw file content.',
      'Directory entry typically stores only the filename and inode reference, keeping the directory table compact and fast to traverse.'
    ],
    practicalExample:
      'In a Unix-style filesystem, directory `/home/user` contains a record mapping filename `report.txt` to inode number 142. Inode 142 contains file metadata and points to disk blocks 45, 46, and 50.',
    commonMisconception:
      "A file's directory entry does not contain the actual file contents or all physical block lists. The directory entry simply maps the name string to an inode index.",
    theoryVsImplementation: {
      generalTheory:
        'Modern file systems (ext4, XFS, APFS, NTFS) organize directory structures using B-trees, hash trees (dir_index), or extent trees for fast path resolution.',
      oscopeImplementation:
        'OScope models a flat-to-hierarchical directory catalog containing file records with typed attributes, status indicators, and direct associations with simulated inodes.'
    },
    relatedTopics: ['fs-inode-architecture', 'fs-allocation-methods', 'fs-fragmentation'],
    labRoute: '/filesystem'
  },
  {
    id: 'fs-inode-architecture',
    title: 'The Inode Architecture & Block Reference Model',
    subsystem: 'FILESYSTEM',
    shortDefinition:
      'An Index Node (Inode) is a fixed-size on-disk data structure storing complete file metadata and an array of pointers directing to the physical blocks containing the file contents.',
    explanation:
      'Pioneered in Unix, the Inode (index node) separates a file identification and attributes from its directory name. When an application opens a file by path name, the operating system walks the directory tree to resolve the inode number, reads the inode into memory, and caches it in an Inode Table. The inode contains: file type, file size in bytes, allocated block count, permissions, user/group IDs, timestamps (atime, mtime, ctime), and a pointer structure. In traditional Unix, an inode contains direct block pointers, single-indirect pointers, double-indirect pointers, and triple-indirect pointers.',
    keyPoints: [
      'Inode contains all file metadata EXCEPT the human-readable filename (filenames live in directory entries).',
      'Direct Pointers: Store block addresses pointing directly to user data blocks (fast access for small files).',
      'Indirect Pointers: Store block addresses pointing to index blocks that contain further data block addresses (allows scaling to large files).',
      'The educational inode model provides a simplified, transparent representation of pointer mapping without full multi-level B-tree complexity.'
    ],
    practicalExample:
      'In OScope, an Inode maintains a configured direct pointer capacity (e.g., 4 or 8 pointers) and an optional index pointer. A small file uses direct pointers immediately; larger files allocate a dedicated Index Block.',
    commonMisconception:
      'MYTH: An inode contains the filename. REALITY: Filenames are stored inside directory files; an inode only knows its own inumber and metadata.',
    theoryVsImplementation: {
      generalTheory:
        'Production filesystems (ext4) store 12 direct pointers, 1 single indirect, 1 double indirect, and 1 triple indirect pointer, or use continuous extent trees (struct ext4_extent).',
      oscopeImplementation:
        'OScope simulates a clean academic Inode model with explicit direct pointer slots and an index block pointer, visually demonstrating pointer-to-block resolution.'
    },
    relatedTopics: ['fs-file-and-directory', 'fs-allocation-methods'],
    labRoute: '/filesystem'
  },
  {
    id: 'fs-allocation-methods',
    title: 'Storage Allocation Strategies: Contiguous vs. Linked vs. Indexed',
    subsystem: 'FILESYSTEM',
    shortDefinition:
      'The three classic strategies used by an operating system to allocate disk blocks to files, balancing access speed, storage fragmentation, and pointer overhead.',
    explanation:
      'When creating or expanding a file, the OS must choose which physical blocks on the storage device to allocate: (1) Contiguous Allocation: Each file occupies a set of contiguous physical blocks on disk. Defined by starting block address and length. Best direct access performance; severe external fragmentation; files cannot grow without reallocation. (2) Linked Allocation: Each file is a linked list of disk blocks; blocks may be scattered anywhere on disk. Each block contains a pointer to the next block. Zero external fragmentation; terrible direct access performance (must follow pointers sequentially); pointer loss destroys remaining file data. (3) Indexed Allocation: Brings all block pointers together into an Index Block. Supports fast direct access without external fragmentation; incurs index block overhead for small files.',
    keyPoints: [
      'Contiguous: Superb sequential and direct access (head seek minimized); suffers from External Fragmentation and file growth limitations.',
      'Linked: Eliminates external fragmentation; poor random access (O(N) seeks); reliability risk if a pointer corrupts.',
      'Indexed: Solves external fragmentation while supporting fast O(1) direct access by centralizing pointers inside an index block.',
      'Allocation choice dictates how the OS translates logical file offset `L` to physical disk block address `B`.'
    ],
    practicalExample:
      'Contiguous file starting at block 10 with length 4 occupies blocks [10, 11, 12, 13]. Linked file might occupy [4, 19, 2, 8] with 4 -> 19 -> 2 -> 8. Indexed file allocates index block 7, which stores [4, 19, 2, 8].',
    commonMisconception:
      'Assuming contiguous allocation is obsolete. High-performance media, embedded systems, read-only CD-ROMs (ISO 9660), and streaming buffers still use contiguous extents for optimal sequential I/O.',
    theoryVsImplementation: {
      generalTheory:
        'Modern file systems combine extent-based allocation (contiguous spans) with B-trees (NTFS, ext4, XFS) to blend direct access speed with fragmentation resistance.',
      oscopeImplementation:
        'OScope lets the user toggle between Contiguous, Linked, and Indexed modes on the same virtual disk grid, observing immediate layout and fragmentation consequences.'
    },
    relatedTopics: ['fs-fragmentation', 'fs-inode-architecture'],
    labRoute: '/filesystem'
  },
  {
    id: 'fs-fragmentation',
    title: 'Storage Fragmentation: Internal vs. External',
    subsystem: 'FILESYSTEM',
    shortDefinition:
      'The wasted or inaccessible storage resulting from allocation granularity (internal fragmentation) or scattered free-space distribution (external fragmentation).',
    explanation:
      'Storage fragmentation represents inefficiency in secondary storage utilization: Internal Fragmentation occurs when allocated storage space is larger than the data stored within it. Because files are allocated in whole block increments (e.g., 512 B, 4 KiB), the final block of a file is almost never completely filled. External Fragmentation occurs when total free space across the disk is sufficient to satisfy a file creation request, but the free space is fragmented into scattered individual runs such that no single contiguous run is large enough to fulfill the contiguous allocation request.',
    keyPoints: [
      'Internal Fragmentation: Unused space INSIDE an allocated block. Formula: Waste = (BlockSize - (FileSize mod BlockSize)) mod BlockSize.',
      'External Fragmentation: Free space OUTSIDE allocated blocks broken into small non-contiguous extents.',
      'Contiguous allocation suffers heavily from external fragmentation; linked and indexed allocation completely avoid external fragmentation.',
      'CRITICAL DISTINCTION: Total free space is NOT external fragmentation. External fragmentation is the inability to satisfy a contiguous request despite having sufficient aggregate free blocks.'
    ],
    practicalExample:
      'Given Block Size = 512 bytes: A file of size 600 bytes requires ceil(600 / 512) = 2 blocks (1024 bytes). Internal fragmentation in block 2 is 1024 - 600 = 424 bytes. For external fragmentation: Disk has 10 free blocks total, but the largest contiguous free run is 3 blocks. A request for 4 contiguous blocks fails!',
    commonMisconception:
      'MYTH: "External fragmentation means the disk is out of space." REALITY: The disk may have plentiful free blocks; external fragmentation simply means they are not consecutive, which only blocks contiguous allocations.',
    theoryVsImplementation: {
      generalTheory:
        'Filesystems perform offline or online defragmentation (rearranging blocks into contiguous extents) or use extent trees and pre-allocation policies to mitigate fragmentation.',
      oscopeImplementation:
        'OScope calculates exact internal wasted bytes per file, computes largest contiguous free run, and visually color-codes free, allocated, fragmented, and index blocks.'
    },
    relatedTopics: ['fs-allocation-methods', 'fs-file-and-directory'],
    labRoute: '/filesystem'
  }
];

export const FILE_ALLOCATION_STRATEGIES: readonly AlgorithmGuide[] = [
  {
    id: 'alloc-contiguous',
    name: 'Contiguous Storage Allocation',
    subsystem: 'FILESYSTEM',
    preemptive: false,
    definition:
      'An allocation policy where each file is assigned a single linear sequence of adjacent physical blocks on the storage medium.',
    mechanism:
      'File is specified by starting block address `b` and length in blocks `n`. Block `i` of the file (for 0 <= i < n) is directly located at physical block `b + i`.',
    selectionRule:
      'First-Fit or Best-Fit search across the disk free-space bitmap for a contiguous free run of length >= required blocks.',
    advantages: [
      'Optimal sequential I/O performance: Minimal disk head movement or seek latency across adjacent tracks.',
      'Extremely fast direct access: Logical block `i` translates instantly to physical block `b + i` via simple addition without reading metadata pointers.',
      'Minimal metadata footprint: Directory entry needs to store only starting block number and block count.'
    ],
    disadvantages: [
      'Severe External Fragmentation: As files are created and deleted, free disk space becomes fragmented into unusable small holes.',
      'File Growth Problem: A file cannot expand past its initial reservation if the adjacent physical block is already occupied, requiring expensive relocation.',
      'Requires advance knowledge of final file size during allocation.'
    ],
    complexityNote:
      'Direct access lookup is O(1) arithmetic. Free space search is O(B) where B is the total number of blocks in the disk bitmap.',
    starvationNote:
      'A request for a large contiguous extent may wait indefinitely if active allocations continuously fragment free space into runs smaller than the request.',
    bestSuitedWorkload:
      'Read-only media (CD-ROMs, DVDs), game installation assets, static firmware images, or write-once high-throughput video streaming files.',
    commonMisconceptions: [
      'Believing contiguous allocation is impossible to defragment. Disks can be defragmented by repacking files into contiguous extents at the cost of heavy I/O.',
      'Assuming modern OS never use contiguous extents. Ext4 and NTFS use extents (contiguous runs) as their core building blocks.'
    ],
    labRoute: '/filesystem'
  },
  {
    id: 'alloc-linked',
    name: 'Linked List Storage Allocation',
    subsystem: 'FILESYSTEM',
    preemptive: false,
    definition:
      'An allocation policy where each file is represented as a linked list of disk blocks that can be scattered arbitrarily across the storage volume.',
    mechanism:
      'Each disk block reserves a few bytes (e.g., 4 or 8 bytes) at its end to store the physical block number of the next block in the chain. Directory points to the first and last blocks.',
    selectionRule:
      'Allocate any free block from the free-space list whenever a file needs another block, linking the previous block pointer to the newly allocated block.',
    advantages: [
      'Completely eliminates External Fragmentation: Any available free block anywhere on disk can be immediately assigned.',
      'Trivial File Expansion: A file can grow dynamically as long as any free blocks exist on the disk; no file relocation is ever required.',
      'Simple metadata: Directory entry requires only starting block address (and optionally ending block address).'
    ],
    disadvantages: [
      'Extremely poor Direct Access: To read logical block `i`, the OS must read blocks 0, 1, ..., i-1 sequentially to follow pointers, incurring massive head seek latency.',
      'Storage Overhead: Each block loses storage capacity (e.g., 4 bytes out of 512 bytes) to store the pointer, making block sizes non-power-of-two for data.',
      'Catastrophic Reliability Risk: If a single disk sector in the middle of the chain corrupts or loses its pointer, all remaining blocks in the file are permanently lost.'
    ],
    complexityNote:
      'Sequential access is O(1) per block forward; Direct random access to block `i` is O(i) disk I/O operations.',
    starvationNote:
      'Zero starvation for block allocation as long as at least 1 free block exists on the disk volume.',
    bestSuitedWorkload:
      'Purely sequential access workloads (e.g., log files, spoolers, audio streams) where random seeking is never performed.',
    commonMisconceptions: [
      'Confusing Linked Allocation with FAT (File Allocation Table). In pure linked allocation, pointers are embedded inside the data blocks themselves; FAT pulls all pointers out into an in-memory table.',
      'Assuming linked allocation causes external fragmentation. Linked allocation completely eliminates external fragmentation.'
    ],
    labRoute: '/filesystem'
  },
  {
    id: 'alloc-indexed',
    name: 'Indexed Storage Allocation',
    subsystem: 'FILESYSTEM',
    preemptive: false,
    definition:
      'An allocation policy that consolidates all pointers for a file into a dedicated disk block called the Index Block, enabling fast direct access without external fragmentation.',
    mechanism:
      'The file directory entry points to an Index Block. The `i`-th entry in the Index Block points directly to the `i`-th physical data block of the file. Scattered free blocks are allocated arbitrarily, but all pointers reside in one central array.',
    selectionRule:
      'Allocate one free block as the Index Block, then allocate `n` arbitrary free blocks and record their block addresses in the index array.',
    advantages: [
      'Supports fast Direct Random Access: The address of logical block `i` is read directly from index entry `i` with only 1 index block lookup (O(1)).',
      'Completely avoids External Fragmentation: Data blocks may be allocated anywhere on the storage disk without contiguous layout constraints.',
      'Enables dynamic file growth by simply adding new block pointers to empty slots in the index block.'
    ],
    disadvantages: [
      'Index Block Pointer Overhead: Even a tiny 10-byte file requires allocating a full index block in addition to its data block, wasting an entire block on pointer metadata.',
      'File Size Ceiling: A single index block can only store a finite number of pointers (e.g., a 4 KiB block with 4-byte pointers holds at most 1024 pointers = 4 MiB max file).',
      'Requires multi-level indexing (indirect, double-indirect blocks) or linked index schemes to accommodate very large files.'
    ],
    complexityNote:
      'Direct access requires 1 index read + 1 data read = O(1) disk I/O operations. Space overhead is 1 index block per file minimum.',
    starvationNote:
      'Allocation requires at least 2 free blocks (1 index block + 1 data block) for a new non-empty file creation.',
    bestSuitedWorkload:
      'General-purpose operating system files requiring a balanced combination of dynamic growth, sequential access, and high-frequency random reads/writes (databases, executables).',
    commonMisconceptions: [
      'Thinking indexed allocation suffers from external fragmentation. Like linked allocation, it can use any scattered free blocks on the disk.',
      'Ignoring the index block overhead for small files. Small files suffer significant space inefficiency due to underutilized index blocks.'
    ],
    labRoute: '/filesystem'
  }
];
