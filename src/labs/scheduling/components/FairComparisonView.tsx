import React from 'react';
import type { SchedulingComparisonResult, SchedulerType } from '../../../core/algorithms/scheduling';
import { Card, Badge, Button } from '../../../components/common';
import { Scale, Award, AlertTriangle, Play, Info } from 'lucide-react';

interface FairComparisonViewProps {
  comparison: SchedulingComparisonResult;
  selectedAlgorithm: SchedulerType;
  onSelectAlgorithm: (algo: SchedulerType) => void;
}

export const FairComparisonView: React.FC<FairComparisonViewProps> = ({
  comparison,
  selectedAlgorithm,
  onSelectAlgorithm,
}) => {
  const { rows, bestMetrics, options, fairnessNotice, workload } = comparison;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Fairness & Configuration Notice */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Scale size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              CONTROLLED ACADEMIC COMPARISON
            </span>
            <Badge variant="outline" size="md">
              Workload: {workload.length} Processes
            </Badge>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {fairnessNotice}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: 'var(--space-2)',
              marginTop: 'var(--space-1)',
              flexWrap: 'wrap',
            }}
          >
            <span>
              Configured RR Quantum: <strong style={{ color: 'var(--color-text)' }}>{options.quantum ?? 2} ms</strong>
            </span>
            <span>
              Context Switch Overhead: <strong style={{ color: 'var(--color-text)' }}>{options.contextSwitchCost ?? 0} ms</strong>
            </span>
            <span>
              Priority Rule:{' '}
              <strong style={{ color: 'var(--color-text)' }}>
                {options.priorityType === 'HIGHER_NUMBER_HIGHER_PRIORITY'
                  ? 'Higher # = Higher Priority'
                  : 'Lower # = Higher Priority'}
              </strong>
            </span>
          </div>
        </div>
      </Card>

      {/* "Best Metric on this Workload" Summary Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Lowest Waiting Time */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Lowest Avg Waiting Time
            </span>
            <Award size={16} color="var(--color-accent)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
            {bestMetrics.lowestWaitingTime.value.toFixed(2)} ms
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Achieved by: <strong style={{ color: 'var(--color-text)' }}>{bestMetrics.lowestWaitingTime.algorithmName}</strong>
          </div>
        </div>

        {/* Lowest Turnaround Time */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Lowest Avg Turnaround
            </span>
            <Award size={16} color="var(--color-info)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-info)' }}>
            {bestMetrics.lowestTurnaroundTime.value.toFixed(2)} ms
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Achieved by: <strong style={{ color: 'var(--color-text)' }}>{bestMetrics.lowestTurnaroundTime.algorithmName}</strong>
          </div>
        </div>

        {/* Lowest Response Time */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Lowest Avg Response Time
            </span>
            <Award size={16} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
            {bestMetrics.lowestResponseTime.value.toFixed(2)} ms
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Achieved by: <strong style={{ color: 'var(--color-text)' }}>{bestMetrics.lowestResponseTime.algorithmName}</strong>
          </div>
        </div>

        {/* Highest CPU Utilization */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Highest CPU Utilization
            </span>
            <Award size={16} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>
            {bestMetrics.highestUtilization.value.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Achieved by: <strong style={{ color: 'var(--color-text)' }}>{bestMetrics.highestUtilization.algorithmName}</strong>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              SCHEDULING ALGORITHM PERFORMANCE MATRIX
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              *Best on this workload indicated with highlight
            </span>
          </div>
        }
        padding="none"
        variant="default"
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-subdued)',
                  borderBottom: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th style={{ padding: '10px 14px' }}>Algorithm</th>
                <th style={{ padding: '10px 14px' }}>Type</th>
                <th style={{ padding: '10px 14px' }}>Avg WT</th>
                <th style={{ padding: '10px 14px' }}>Avg TAT</th>
                <th style={{ padding: '10px 14px' }}>Avg RT</th>
                <th style={{ padding: '10px 14px' }}>CPU Util</th>
                <th style={{ padding: '10px 14px' }}>Throughput</th>
                <th style={{ padding: '10px 14px' }}>CS Count</th>
                <th style={{ padding: '10px 14px' }}>Makespan</th>
                <th style={{ padding: '10px 14px' }}>Starvation Risk</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selectedAlgorithm === row.id;
                const isBestWT = Math.abs(row.averageWaitingTime - bestMetrics.lowestWaitingTime.value) < 0.001;
                const isBestTAT = Math.abs(row.averageTurnaroundTime - bestMetrics.lowestTurnaroundTime.value) < 0.001;
                const isBestRT = Math.abs(row.averageResponseTime - bestMetrics.lowestResponseTime.value) < 0.001;
                const isBestUtil = Math.abs(row.cpuUtilization - bestMetrics.highestUtilization.value) < 0.001;

                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      fontFamily: 'var(--font-mono)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Name */}
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                      <span style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }}>
                        {row.name}
                      </span>
                    </td>

                    {/* Preemptive? */}
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: row.isPreemptive ? 'rgba(245, 158, 11, 0.18)' : 'rgba(59, 130, 246, 0.18)',
                          color: row.isPreemptive ? 'var(--color-warning)' : 'var(--color-info)',
                        }}
                      >
                        {row.isPreemptive ? 'Preemptive' : 'Non-Preemptive'}
                      </span>
                    </td>

                    {/* Avg WT */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: isBestWT ? 'var(--color-accent)' : 'inherit', fontWeight: isBestWT ? 700 : 500 }}>
                        {row.averageWaitingTime.toFixed(2)} ms
                      </span>
                      {isBestWT && (
                        <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'var(--color-accent)' }}>★</span>
                      )}
                    </td>

                    {/* Avg TAT */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: isBestTAT ? 'var(--color-info)' : 'inherit', fontWeight: isBestTAT ? 700 : 500 }}>
                        {row.averageTurnaroundTime.toFixed(2)} ms
                      </span>
                      {isBestTAT && (
                        <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'var(--color-info)' }}>★</span>
                      )}
                    </td>

                    {/* Avg RT */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: isBestRT ? 'var(--color-success)' : 'inherit', fontWeight: isBestRT ? 700 : 500 }}>
                        {row.averageResponseTime.toFixed(2)} ms
                      </span>
                      {isBestRT && (
                        <span style={{ marginLeft: '4px', fontSize: '0.75rem', color: 'var(--color-success)' }}>★</span>
                      )}
                    </td>

                    {/* CPU Util */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: isBestUtil ? 'var(--color-warning)' : 'inherit', fontWeight: isBestUtil ? 700 : 500 }}>
                        {row.cpuUtilization.toFixed(1)}%
                      </span>
                    </td>

                    {/* Throughput */}
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      {row.throughput.toFixed(3)}
                    </td>

                    {/* CS Count */}
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      {row.contextSwitches}
                    </td>

                    {/* Makespan */}
                    <td style={{ padding: '10px 14px' }}>
                      {row.totalMakespan} ms
                    </td>

                    {/* Starvation Risk */}
                    <td style={{ padding: '10px 14px' }}>
                      {row.starvationRisk === 'NONE' ? (
                        <span style={{ color: 'var(--color-success)', fontSize: '0.8125rem', fontWeight: 600 }}>None</span>
                      ) : row.starvationRisk === 'POSSIBLE' ? (
                        <span style={{ color: 'var(--color-warning)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> Possible
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-error)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> High Risk
                        </span>
                      )}
                    </td>

                    {/* Action: Inspect */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <Button
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        icon={<Play size={13} />}
                        onClick={() => onSelectAlgorithm(row.id)}
                      >
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Academic Takeaway Note */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface-subdued)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)',
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        <Info size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--color-text)' }}>Academic Takeaway:</strong> There is no single globally
          &ldquo;best&rdquo; CPU scheduling algorithm. Schedulers represent deliberate engineering trade-offs: SJF/SRTF
          mathematically minimizes waiting time at the expense of starvation vulnerability; Round Robin optimizes interactive
          response and fairness at the cost of context switch overhead; FCFS eliminates scheduling overhead but suffers from
          the convoy effect.
        </div>
      </div>
    </div>
  );
};
