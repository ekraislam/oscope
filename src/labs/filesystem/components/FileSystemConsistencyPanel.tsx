/**
 * OScope — File System Structural Consistency Auditor Component
 * Validates and audits essential operating system storage invariants:
 * directory-to-inode bindings, block mutual exclusivity, free space symmetry,
 * linked chain looplessness, and index block integrity.
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCcw, AlertOctagon } from 'lucide-react';
import { Card, Badge, Button } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';

export const FileSystemConsistencyPanel: React.FC = () => {
  const consistencyReport = useFileSystemStore((s) => s.consistencyReport);
  const runConsistencyAudit = useFileSystemStore((s) => s.runConsistencyAudit);

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {consistencyReport.isConsistent ? (
              <ShieldCheck size={18} color="#22c55e" />
            ) : (
              <ShieldAlert size={18} color="#ef4444" />
            )}
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                Storage Invariant Consistency Auditor
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Formal verification of file system structural integrity and block ownership invariants.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Badge variant={consistencyReport.isConsistent ? 'success' : 'danger'}>
              {consistencyReport.isConsistent ? 'SYSTEM CONSISTENT' : 'CORRUPTION DETECTED'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={12} />}
              onClick={runConsistencyAudit}
            >
              Re-audit
            </Button>
          </div>
        </div>

        {/* Audit Checks Table / List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {consistencyReport.checks.map((chk, idx) => (
            <div
              key={chk.name}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: chk.passed ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${chk.passed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.4)'}`,
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                {chk.passed ? (
                  <CheckCircle2 size={16} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                ) : (
                  <XCircle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    Invariant #{idx + 1}: {chk.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {chk.details}
                  </div>
                </div>
              </div>

              <Badge variant={chk.passed ? 'success' : 'danger'}>
                {chk.passed ? 'PASS' : 'FAIL'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Errors list if any corruption detected */}
        {consistencyReport.errors.length > 0 && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5' }}>
              <AlertOctagon size={16} color="#ef4444" />
              <strong style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                CORRUPTION VIOLATIONS ({consistencyReport.errors.length}):
              </strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: '#fecaca' }}>
              {consistencyReport.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
