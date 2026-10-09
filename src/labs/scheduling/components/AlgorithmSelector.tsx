import React from 'react';
import type { SchedulerType, SchedulingOptions } from '../../../core/models';
import { Card, Badge } from '../../../components/common';
import { Cpu, Sliders, ShieldAlert } from 'lucide-react';

interface AlgorithmSelectorProps {
  selectedAlgorithm: SchedulerType;
  options: SchedulingOptions;
  onSelectAlgorithm: (algo: SchedulerType) => void;
  onUpdateQuantum: (quantum: number) => void;
  onUpdateContextSwitchCost: (cost: number) => void;
  onUpdatePriorityType: (type: 'LOWER_NUMBER_HIGHER_PRIORITY' | 'HIGHER_NUMBER_HIGHER_PRIORITY') => void;
}

interface AlgorithmMeta {
  type: SchedulerType;
  label: string;
  shortLabel: string;
  preemptive: boolean;
  tagline: string;
  starvationRisk: boolean;
}

const ALGORITHMS: readonly AlgorithmMeta[] = [
  {
    type: 'FCFS',
    label: 'First-Come, First-Served',
    shortLabel: 'FCFS',
    preemptive: false,
    tagline: 'Executes processes strictly in arrival order until completion. Prone to convoy effect.',
    starvationRisk: false,
  },
  {
    type: 'SJF_NON_PREEMPTIVE',
    label: 'Shortest Job First (NP)',
    shortLabel: 'SJF',
    preemptive: false,
    tagline: 'Dispatches eligible process with minimal burst time. Provably minimal waiting time.',
    starvationRisk: true,
  },
  {
    type: 'SRTF_PREEMPTIVE',
    label: 'Shortest Remaining Time First',
    shortLabel: 'SRTF',
    preemptive: true,
    tagline: 'Preempts running process if a newly arrived job has shorter remaining duration.',
    starvationRisk: true,
  },
  {
    type: 'PRIORITY_NON_PREEMPTIVE',
    label: 'Priority (Non-Preemptive)',
    shortLabel: 'Priority (NP)',
    preemptive: false,
    tagline: 'Dispatches highest-priority ready job to completion without interruption.',
    starvationRisk: true,
  },
  {
    type: 'PRIORITY_PREEMPTIVE',
    label: 'Priority (Preemptive)',
    shortLabel: 'Priority (P)',
    preemptive: true,
    tagline: 'Immediately interrupts active job when a higher-priority process arrives.',
    starvationRisk: true,
  },
  {
    type: 'ROUND_ROBIN',
    label: 'Round Robin',
    shortLabel: 'Round Robin',
    preemptive: true,
    tagline: 'Slices CPU execution into fixed time quanta with FIFO ready queue cycling.',
    starvationRisk: false,
  },
];

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  options,
  onSelectAlgorithm,
  onUpdateQuantum,
  onUpdateContextSwitchCost,
  onUpdatePriorityType,
}) => {
  const current = ALGORITHMS.find((a) => a.type === selectedAlgorithm) || ALGORITHMS[0];

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Cpu size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
              SCHEDULING ALGORITHM SELECTOR
            </span>
          </div>
          <Badge variant={current.preemptive ? 'warning' : 'info'} size="md">
            {current.preemptive ? 'Preemptive' : 'Non-Preemptive'}
          </Badge>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Algorithm Buttons Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 'var(--space-2)',
          }}
        >
          {ALGORITHMS.map((algo) => {
            const isSelected = selectedAlgorithm === algo.type;
            return (
              <button
                key={algo.type}
                onClick={() => onSelectAlgorithm(algo.type)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 14px',
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.14)' : 'var(--color-surface)',
                  border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 10px rgba(6, 182, 212, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                    }}
                  >
                    {algo.shortLabel}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: algo.preemptive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: algo.preemptive ? 'var(--color-warning)' : 'var(--color-info)',
                    }}
                  >
                    {algo.preemptive ? 'P' : 'NP'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {algo.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Algorithm Tagline */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-surface-subdued)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-text)' }}>{current.label}:</strong> {current.tagline}
          </span>
          {current.starvationRisk && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-warning)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <ShieldAlert size={15} />
              <span>Potential Starvation Vulnerability</span>
            </div>
          )}
        </div>

        {/* Dynamic Simulation Options Sub-Panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sliders size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              CONFIGURABLE PARAMETERS:
            </span>
          </div>

          {/* Time Quantum (Round Robin only) */}
          {selectedAlgorithm === 'ROUND_ROBIN' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label
                htmlFor="rr-quantum-input"
                style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                Time Quantum (q):
              </label>
              <input
                id="rr-quantum-input"
                type="number"
                min={1}
                max={50}
                value={options.quantum || 2}
                onChange={(e) => onUpdateQuantum(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '68px',
                  padding: '6px 8px',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-accent)',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>ms</span>
            </div>
          )}

          {/* Context Switch Overhead Cost */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label
              htmlFor="cs-cost-input"
              style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
            >
              Context Switch Cost:
            </label>
            <input
              id="cs-cost-input"
              type="number"
              min={0}
              max={10}
              value={options.contextSwitchCost ?? 0}
              onChange={(e) => onUpdateContextSwitchCost(Math.max(0, Number(e.target.value)))}
              style={{
                width: '64px',
                padding: '6px 8px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                fontWeight: 700,
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>ms</span>
          </div>

          {/* Priority Convention (Priority NP or P only) */}
          {(selectedAlgorithm === 'PRIORITY_NON_PREEMPTIVE' || selectedAlgorithm === 'PRIORITY_PREEMPTIVE') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label
                htmlFor="priority-convention-select"
                style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              >
                Convention:
              </label>
              <select
                id="priority-convention-select"
                value={options.priorityType || 'LOWER_NUMBER_HIGHER_PRIORITY'}
                onChange={(e) =>
                  onUpdatePriorityType(e.target.value as 'LOWER_NUMBER_HIGHER_PRIORITY' | 'HIGHER_NUMBER_HIGHER_PRIORITY')
                }
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              >
                <option value="LOWER_NUMBER_HIGHER_PRIORITY">Lower # = Higher Priority (Unix/POSIX)</option>
                <option value="HIGHER_NUMBER_HIGHER_PRIORITY">Higher # = Higher Priority (Real-time)</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
