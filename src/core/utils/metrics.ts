/**
 * OScope — Academic Metric Formulas & Mathematical Utilities
 * Pure mathematical functions implementing standard Operating Systems formulas.
 */

/**
 * Turnaround Time = Completion Time - Arrival Time
 */
export function calculateTurnaroundTime(completionTime: number, arrivalTime: number): number {
  return Math.max(0, completionTime - arrivalTime);
}

/**
 * Waiting Time = Turnaround Time - Burst Time
 */
export function calculateWaitingTime(turnaroundTime: number, burstTime: number): number {
  return Math.max(0, turnaroundTime - burstTime);
}

/**
 * Response Time = First Scheduled Time - Arrival Time
 */
export function calculateResponseTime(firstStartTime: number, arrivalTime: number): number {
  return Math.max(0, firstStartTime - arrivalTime);
}

/**
 * CPU Utilization = (Active CPU Execution Time / Total Makespan) * 100
 * Mathematically bounded [0.00, 100.00]
 */
export function calculateCPUUtilizationPercentage(activeCPUTime: number, totalMakespan: number): number {
  if (totalMakespan <= 0 || activeCPUTime <= 0) return 0;
  const ratio = (activeCPUTime / totalMakespan) * 100;
  const bounded = Math.min(100, Math.max(0, ratio));
  return Math.round(bounded * 100) / 100;
}

/**
 * Throughput = Completed Processes / Total Makespan
 */
export function calculateThroughput(completedCount: number, totalMakespan: number): number {
  if (totalMakespan <= 0 || completedCount <= 0) return 0;
  const raw = completedCount / totalMakespan;
  return Math.round(raw * 10000) / 10000;
}

/**
 * Computes arithmetic mean of an array of numbers.
 * Returns 0 if empty.
 */
export function calculateAverage(values: readonly number[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / values.length;
  return Math.round(avg * 100) / 100;
}

/**
 * Deeply clones nested arrays and plain objects to guarantee state immutability.
 */
export function deepClone<T>(source: T): T {
  if (source === null || typeof source !== 'object') {
    return source;
  }
  if (Array.isArray(source)) {
    return source.map((item) => deepClone(item)) as unknown as T;
  }
  const clonedObj: Record<string, unknown> = {};
  for (const key of Object.keys(source as Record<string, unknown>)) {
    clonedObj[key] = deepClone((source as Record<string, unknown>)[key]);
  }
  return clonedObj as T;
}
