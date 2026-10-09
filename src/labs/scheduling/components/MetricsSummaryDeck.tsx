import React from 'react';
import type { SchedulingResult, ProcessInput } from '../../../core/models';
import { Card, Badge } from '../../../components/common';
import { BarChart3, TrendingUp, Clock, Shuffle, Zap, Layers } from 'lucide-react';

interface MetricsSummaryDeckProps {
  result: SchedulingResult;
  workload: readonly ProcessInput[];
  selectedPid: string | null;
  onSelectProcess?: (pid: string) => void;
}

export const MetricsSummaryDeck: React.FC<MetricsSummaryDeckProps> = ({
  result,
  workload,
  selectedPid,
  onSelectProcess,
}) => {
  const { metrics, processMetrics } = result;
  const processMetricsList = Object.values(processMetrics);

  // Map workload processes for name and priority
  const processMap = new Map(workload.map((p) => [p.pid, p]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Aggregate Metric Cards Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Average Waiting Time */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <Clock size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Avg Waiting Time
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              {metrics.averageWaitingTime.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>ms</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            TAT - BT
          </span>
        </div>

        {/* Average Turnaround Time */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <Zap size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Avg Turnaround
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-info)' }}>
              {metrics.averageTurnaroundTime.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>ms</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            CT - AT
          </span>
        </div>

        {/* Average Response Time */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <TrendingUp size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Avg Response
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {metrics.averageResponseTime.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>ms</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            First CPU - AT
          </span>
        </div>

        {/* CPU Utilization */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <BarChart3 size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              CPU Utilization
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>
              {metrics.cpuUtilization.toFixed(1)}%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Busy / Total Makespan
          </span>
        </div>

        {/* Throughput */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <Layers size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Throughput
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              {metrics.throughput.toFixed(3)}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>p/ms</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            N / Total Time
          </span>
        </div>

        {/* Context Switches */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
            <Shuffle size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Context Switches
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}>
              {metrics.contextSwitchCount}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>switches</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Process-to-process
          </span>
        </div>
      </div>

      {/* Per-Process Metrics Table */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                INDIVIDUAL PROCESS TIMING BREAKDOWN
              </span>
              <Badge variant="outline" size="md">
                {processMetricsList.length} Processes
              </Badge>
            </div>
            <div style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              Total Makespan: <strong style={{ color: 'var(--color-accent)' }}>{metrics.totalTime} ms</strong>
            </div>
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
                <th style={{ padding: '10px 14px' }}>PID</th>
                <th style={{ padding: '10px 14px' }}>Process Name</th>
                <th style={{ padding: '10px 14px' }}>Arrival (AT)</th>
                <th style={{ padding: '10px 14px' }}>Burst (BT)</th>
                <th style={{ padding: '10px 14px' }}>Priority</th>
                <th style={{ padding: '10px 14px' }}>Completion (CT)</th>
                <th style={{ padding: '10px 14px' }}>Turnaround (TAT)</th>
                <th style={{ padding: '10px 14px' }}>Waiting (WT)</th>
                <th style={{ padding: '10px 14px' }}>Response (RT)</th>
              </tr>
            </thead>
            <tbody>
              {processMetricsList.map((pm) => {
                const proc = processMap.get(pm.pid);
                const isSelected = selectedPid === pm.pid;

                return (
                  <tr
                    key={pm.pid}
                    onClick={() => onSelectProcess?.(pm.pid)}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {/* PID */}
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {pm.pid}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--color-text)' }}>
                      {proc?.name || `Process ${pm.pid}`}
                    </td>

                    {/* AT */}
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      {pm.arrivalTime} ms
                    </td>

                    {/* BT */}
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {pm.burstTime} ms
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                      {proc?.priority ?? 1}
                    </td>

                    {/* CT */}
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--color-text)' }}>
                      {pm.completionTime} ms
                    </td>

                    {/* TAT */}
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-info)' }}>
                      {pm.turnaroundTime} ms
                    </td>

                    {/* WT */}
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {pm.waitingTime} ms
                    </td>

                    {/* RT */}
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-success)' }}>
                      {pm.responseTime} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
