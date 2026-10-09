/**
 * Pure OScope Telemetry & Number Formatting Utilities
 */

/**
 * Formats a virtual simulation time in milliseconds with fixed padding.
 * @param ms Simulation time in milliseconds
 * @param padLength Zero-padding length (default: 4)
 * @returns Formatted time string (e.g., "0042 ms")
 */
export function formatSimulationTime(ms: number, padLength: number = 4): string {
  if (ms < 0) {
    return '0000 ms';
  }
  const integerPart = Math.floor(ms);
  const padded = integerPart.toString().padStart(padLength, '0');
  return `${padded} ms`;
}

/**
 * Formats byte counts into human-readable binary prefixes (B, KB, MB, GB).
 * Follows IEC binary prefix standards (1 KB = 1024 B).
 */
export function formatByteSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const digitGroup = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, digitGroup);
  
  if (digitGroup === 0) {
    return `${Math.floor(value)} B`;
  }
  return `${value.toFixed(1)} ${units[digitGroup]}`;
}

/**
 * Formats a numerical memory address into a standard hex string with 0x prefix.
 * @param address Integer memory address
 * @param padLength Length of hex digits (default: 4, e.g. 0x00FF)
 */
export function formatHexAddress(address: number, padLength: number = 4): string {
  const safeAddress = Math.max(0, Math.floor(address));
  const hex = safeAddress.toString(16).toUpperCase().padStart(padLength, '0');
  return `0x${hex}`;
}

/**
 * Calculates CPU Utilization percentage with mathematical bounds [0.00, 100.00].
 * @param activeTime Time spent actively executing bursts
 * @param totalTime Total makespan time
 */
export function calculateCPUUtilization(activeTime: number, totalTime: number): number {
  if (totalTime <= 0 || activeTime <= 0) {
    return 0;
  }
  const ratio = (activeTime / totalTime) * 100;
  const bounded = Math.min(100, Math.max(0, ratio));
  return Math.round(bounded * 100) / 100;
}
