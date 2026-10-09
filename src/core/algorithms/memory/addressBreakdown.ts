/**
 * OScope — Address Breakdown Engine
 * Pure mathematical bit-level decomposition of virtual addresses into page numbers and offsets.
 */

import type { MemoryConfiguration, AddressBreakdownResult, VirtualAddress } from '../../models/memory';
import { validateVirtualAddress } from '../../utils/validation';

/**
 * Decomposes a virtual address into its binary bit-split, page number, and offset.
 * Strictly enforces power-of-two arithmetic without floating point approximations.
 */
export function breakdownVirtualAddress(
  virtualAddress: number,
  config: MemoryConfiguration
): AddressBreakdownResult {
  const totalBits = config.virtualAddressBits ?? 16;
  const maxAddressSpace = config.virtualMemoryBytes ?? Math.pow(2, totalBits);

  const validation = validateVirtualAddress(virtualAddress, maxAddressSpace);
  if (!validation.valid) {
    throw new Error(`AddressBreakdownError: ${validation.errors.join('; ')}`);
  }

  const pageSize = config.pageSizeBytes;
  if (pageSize <= 0 || (pageSize & (pageSize - 1)) !== 0) {
    throw new Error(`AddressBreakdownError: Page size (${pageSize} B) must be a positive power of 2.`);
  }

  const offsetBitCount = Math.round(Math.log2(pageSize));
  const pageBitCount = Math.max(0, totalBits - offsetBitCount);

  // Bitwise decomposition for integer safety
  const pageNumber = Math.floor(virtualAddress / pageSize);
  const offset = virtualAddress % pageSize;

  const fullBinary = virtualAddress.toString(2).padStart(totalBits, '0');
  const pageBits = pageNumber.toString(2).padStart(pageBitCount, '0');
  const offsetBits = offset.toString(2).padStart(offsetBitCount, '0');

  const hexPadding = Math.max(4, Math.ceil(totalBits / 4));
  const hexString = '0x' + virtualAddress.toString(16).toUpperCase().padStart(hexPadding, '0');

  return Object.freeze({
    virtualAddress,
    hexString,
    binaryString: fullBinary,
    pageNumber,
    offset,
    pageBits,
    offsetBits,
    totalBits,
    pageBitCount,
    offsetBitCount,
  });
}

/**
 * Creates a domain VirtualAddress object from a numerical virtual address and memory configuration.
 */
export function createVirtualAddress(
  rawAddress: number,
  config: MemoryConfiguration
): VirtualAddress {
  const breakdown = breakdownVirtualAddress(rawAddress, config);
  return Object.freeze({
    rawAddress,
    pageNumber: breakdown.pageNumber,
    offset: breakdown.offset,
    binaryString: breakdown.binaryString,
  });
}
