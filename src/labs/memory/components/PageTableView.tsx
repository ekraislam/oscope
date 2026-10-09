import React from 'react';
import type { PageTableState } from '../../../core/algorithms/memory';
import { Card, Badge } from '../../../components/common';
import { Table } from 'lucide-react';

interface PageTableViewProps {
  pageTable: PageTableState;
  activePageNumber: number | null;
}

export const PageTableView: React.FC<PageTableViewProps> = ({
  pageTable,
  activePageNumber,
}) => {
  const validCount = pageTable.entries.filter((e) => e.isValid).length;

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Table size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              AUTHORITATIVE PAGE TABLE
            </span>
            <Badge variant="outline" size="sm">
              {validCount}/{pageTable.numPages} Resident
            </Badge>
          </div>
          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            1:1 Virtual Mapping
          </span>
        </div>
      }
      padding="none"
      variant="default"
    >
      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-surface-subdued)',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              <th style={{ padding: '6px 12px' }}>Page #</th>
              <th style={{ padding: '6px 12px' }}>Frame #</th>
              <th style={{ padding: '6px 12px' }}>Valid Bit</th>
              <th style={{ padding: '6px 12px' }}>Dirty (M)</th>
              <th style={{ padding: '6px 12px' }}>Ref (R)</th>
            </tr>
          </thead>
          <tbody>
            {pageTable.entries.map((entry) => {
              const isActive = activePageNumber === entry.pageNumber;

              return (
                <tr
                  key={entry.pageNumber}
                  style={{
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: isActive
                      ? 'rgba(6, 182, 212, 0.12)'
                      : entry.isValid
                      ? 'rgba(16, 185, 129, 0.03)'
                      : 'transparent',
                    fontFamily: 'var(--font-mono)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td style={{ padding: '6px 12px', fontWeight: 700, color: isActive ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    Page {entry.pageNumber}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    {entry.isValid && entry.frameNumber !== null ? (
                      <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                        Frame {entry.frameNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <span
                      style={{
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        backgroundColor: entry.isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: entry.isValid ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    >
                      {entry.isValid ? 'VALID' : 'INVALID'}
                    </span>
                  </td>
                  <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)' }}>
                    {entry.isDirty ? '1' : '0'}
                  </td>
                  <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)' }}>
                    {entry.referenceBit ? '1' : '0'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
