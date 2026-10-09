import { describe, it, expect } from 'vitest';
import type { ProcessInput } from '../core/models';
import {
  compareAllSchedulers,
  SCHEDULING_PRESETS,
  runFCFS,
  runSJFNonPreemptive,
  runSRTFPreemptive,
  runPriorityPreemptive,
  runRoundRobin,
} from '../core/algorithms/scheduling';

describe('Scheduling Comparison Engine & Presets', () => {
  const testWorkload: ProcessInput[] = [
    { pid: 'P1', name: 'Task 1', arrivalTime: 0, burstTime: 8, priority: 3 },
    { pid: 'P2', name: 'Task 2', arrivalTime: 1, burstTime: 4, priority: 1 },
    { pid: 'P3', name: 'Task 3', arrivalTime: 2, burstTime: 2, priority: 2 },
  ];

  it('runs all 6 algorithms on the identical workload and returns comparison matrix', () => {
    const comparison = compareAllSchedulers(testWorkload, { quantum: 2, contextSwitchCost: 0 });

    expect(comparison.rows).toHaveLength(6);
    const algoIds = comparison.rows.map((r) => r.id);
    expect(algoIds).toEqual([
      'FCFS',
      'SJF_NON_PREEMPTIVE',
      'SRTF_PREEMPTIVE',
      'PRIORITY_NON_PREEMPTIVE',
      'PRIORITY_PREEMPTIVE',
      'ROUND_ROBIN',
    ]);

    // Check best metrics are identified
    expect(comparison.bestMetrics.lowestWaitingTime.value).toBeGreaterThanOrEqual(0);
    expect(comparison.bestMetrics.lowestTurnaroundTime.value).toBeGreaterThanOrEqual(0);
    expect(comparison.bestMetrics.lowestResponseTime.value).toBeGreaterThanOrEqual(0);
    expect(comparison.bestMetrics.highestUtilization.value).toBeGreaterThan(0);

    // Starvation risk flags
    const srtfRow = comparison.rows.find((r) => r.id === 'SRTF_PREEMPTIVE');
    expect(srtfRow?.starvationRisk).toBe('HIGH');

    const rrRow = comparison.rows.find((r) => r.id === 'ROUND_ROBIN');
    expect(rrRow?.starvationRisk).toBe('NONE');
  });

  describe('Academic Workload Presets Validation', () => {
    it('contains all 7 curated educational presets', () => {
      expect(SCHEDULING_PRESETS).toHaveLength(7);
      const presetIds = SCHEDULING_PRESETS.map((p) => p.id);
      expect(presetIds).toContain('convoy_fcfs');
      expect(presetIds).toContain('sjf_minimal_wait');
      expect(presetIds).toContain('srtf_preemption');
      expect(presetIds).toContain('round_robin_fairness');
      expect(presetIds).toContain('priority_starvation');
      expect(presetIds).toContain('idle_gaps');
      expect(presetIds).toContain('tie_breaking_deterministic');
    });

    it('successfully executes every preset against its recommended algorithm', () => {
      for (const preset of SCHEDULING_PRESETS) {
        let result;
        const options = preset.recommendedOptions;

        switch (preset.recommendedAlgorithm) {
          case 'FCFS':
            result = runFCFS(preset.processes, options);
            break;
          case 'SJF_NON_PREEMPTIVE':
            result = runSJFNonPreemptive(preset.processes, options);
            break;
          case 'SRTF_PREEMPTIVE':
            result = runSRTFPreemptive(preset.processes, options);
            break;
          case 'PRIORITY_PREEMPTIVE':
            result = runPriorityPreemptive(preset.processes, options);
            break;
          case 'ROUND_ROBIN':
            result = runRoundRobin(preset.processes, options);
            break;
          default:
            result = runFCFS(preset.processes, options);
        }

        expect(result.gantt.length).toBeGreaterThan(0);
        expect(result.metrics.totalTime).toBeGreaterThan(0);
        expect(result.stepSnapshots.length).toBeGreaterThan(0);
      }
    });

    it('successfully executes compareAllSchedulers for every preset without errors', () => {
      for (const preset of SCHEDULING_PRESETS) {
        const comparison = compareAllSchedulers(preset.processes, preset.recommendedOptions);
        expect(comparison.rows).toHaveLength(6);
        expect(comparison.bestMetrics).toBeDefined();
      }
    });
  });
});
