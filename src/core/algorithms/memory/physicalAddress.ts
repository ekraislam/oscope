/**
 * OScope — Physical Address Resolution Engine
 * Pure mathematical calculation of physical memory addresses from frame numbers and offsets.
 */

import type { MemoryConfiguration, PhysicalAddress } from '../../models/memory';

/**
 * Calculates the exact physical address from a resolved frame number and offset.
 * physicalAddress = frameNumber * pageSizeBytes + offset
 */
export function calculatePhysicalAddress(
  frameNumber: number,
  offset: number,
  config: MemoryConfiguration
): PhysicalAddress {
  if (frameNumber < 0 || !Number.isInteger(frameNumber)) {
    throw new Error(`PhysicalAddressError: Frame number must be a non-negative integer, received: ${frameNumber}`);
  }

  if (frameNumber >= config.frameCount) {
    throw new Error(
      `PhysicalAddressError: Frame number ${frameNumber} exceeds configured physical frame count (${config.frameCount})`
    );
  }

  if (offset < 0 || offset >= config.pageSizeBytes) {
    throw new Error(
      `PhysicalAddressError: Offset ${offset} is outside valid frame boundary [0, ${config.pageSizeBytes - 1}]`
    );
  }

  const rawAddress = frameNumber * config.pageSizeBytes + offset;

  if (rawAddress >= config.totalMemoryBytes) {
    throw new Error(
      `PhysicalAddressError: Computed physical address (${rawAddress}) exceeds physical memory limit (${config.totalMemoryBytes} B)`
    );
  }

  const physicalAddressBits = Math.round(Math.log2(config.totalMemoryBytes));
  const binaryString = rawAddress.toString(2).padStart(physicalAddressBits, '0');

  return Object.freeze({
    rawAddress,
    frameNumber,
    offset,
    binaryString,
  });
}
