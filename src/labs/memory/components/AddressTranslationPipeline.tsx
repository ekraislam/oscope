import React, { useState } from 'react';
import type { AddressTranslationResult, MemoryConfiguration } from '../../../core/models/memory';
import { Card, Badge, Button } from '../../../components/common';
import { Binary, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, Cpu } from 'lucide-react';

interface AddressTranslationPipelineProps {
  config: MemoryConfiguration;
  virtualAddress: number;
  translationResult: AddressTranslationResult | null;
  onTranslateAddress: (address: number) => { success: boolean; error?: string };
  onReset: () => void;
}

export const AddressTranslationPipeline: React.FC<AddressTranslationPipelineProps> = ({
  config,
  virtualAddress,
  translationResult,
  onTranslateAddress,
  onReset,
}) => {
  const [inputVal, setInputVal] = useState<string>('0x' + virtualAddress.toString(16).toUpperCase());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = inputVal.trim();
    let parsed: number;

    if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
      parsed = parseInt(trimmed, 16);
    } else {
      parsed = parseInt(trimmed, 10);
    }

    if (isNaN(parsed) || parsed < 0) {
      setErrorMessage('Please enter a valid positive decimal or hex (0x...) address.');
      return;
    }

    const res = onTranslateAddress(parsed);
    if (!res.success) {
      setErrorMessage(res.error || 'Address out of valid address space.');
    }
  };

  const breakdown = translationResult?.breakdown;
  const isTLBHit = translationResult?.isTLBHit ?? false;
  const isPageTableHit = translationResult?.isPageTableHit ?? false;
  const physAddr = translationResult?.physicalAddress;

  return (
    <Card
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Binary size={16} color="var(--color-accent)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              ADDRESS TRANSLATION OBSERVATORY
            </span>
            <Badge variant="outline" size="sm">
              Page Size: {config.pageSizeBytes} B
            </Badge>
          </div>

          <Button variant="ghost" size="sm" icon={<RefreshCw size={12} />} onClick={onReset}>
            Reset MMU State
          </Button>
        </div>
      }
      padding="md"
      variant="default"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Virtual Address Input Bar */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-subdued)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <label
            htmlFor="va-input"
            style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}
          >
            Virtual Address:
          </label>
          <input
            id="va-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. 0x2A3F or 10815"
            style={{
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-accent)',
              fontWeight: 700,
              width: '140px',
            }}
          />

          <Button type="submit" variant="primary" size="sm" icon={<ArrowRight size={13} />}>
            Translate
          </Button>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Quick:
            </span>
            {[0x0A20, 0x1408, 0x2A3F, 0x3810].map((quickAddr) => (
              <button
                key={quickAddr}
                type="button"
                onClick={() => {
                  const hexStr = '0x' + quickAddr.toString(16).toUpperCase();
                  setInputVal(hexStr);
                  onTranslateAddress(quickAddr);
                }}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '3px',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                0x{quickAddr.toString(16).toUpperCase()}
              </button>
            ))}
          </div>
        </form>

        {errorMessage && (
          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-error)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 25: Binary Bit-Strip Visualizer */}
        {breakdown && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Binary Address Decomposition ({breakdown.totalBits}-Bit Virtual Address)
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                {breakdown.hexString} = {breakdown.virtualAddress}d
              </span>
            </div>

            {/* Split Bit Boxes */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'stretch' }}>
              {/* Page Number Box */}
              <div
                style={{
                  flex: breakdown.pageBitCount || 1,
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  <span>PAGE NUMBER (p)</span>
                  <span>{breakdown.pageBitCount} bits</span>
                </div>
                <div style={{ fontSize: '1.125rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text)' }}>
                  {breakdown.pageBits}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Decimal: <strong>{breakdown.pageNumber}</strong>
                </div>
              </div>

              {/* Offset Box */}
              <div
                style={{
                  flex: breakdown.offsetBitCount || 1,
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid var(--color-info)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-info)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  <span>OFFSET (d)</span>
                  <span>{breakdown.offsetBitCount} bits</span>
                </div>
                <div style={{ fontSize: '1.125rem', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text)' }}>
                  {breakdown.offsetBits}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Decimal: <strong>{breakdown.offset}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Translation Flow Pipeline (TLB -> Page Table -> Physical Address) */}
        {translationResult && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {/* Step 1: TLB Check */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: isTLBHit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: isTLBHit ? '1px solid var(--color-success)' : '1px solid var(--color-warning)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                  1. Hardware TLB Cache
                </span>
                <Badge variant={isTLBHit ? 'success' : 'warning'} size="sm">
                  {isTLBHit ? 'TLB HIT' : 'TLB MISS'}
                </Badge>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-text)', lineHeight: 1.4, marginTop: '4px' }}>
                {isTLBHit ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
                    <CheckCircle2 size={14} />
                    <span>
                      Page {translationResult.pageNumber} → Frame {translationResult.resolvedFrameNumber} (Found in TLB)
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Page {translationResult.pageNumber} not cached. Bypassing to main Page Table.
                  </span>
                )}
              </div>
            </div>

            {/* Step 2: Page Table Lookup */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: isTLBHit
                  ? 'var(--color-surface-subdued)'
                  : isPageTableHit
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
                border: isTLBHit
                  ? '1px solid var(--color-border-subtle)'
                  : isPageTableHit
                  ? '1px solid var(--color-info)'
                  : '1px solid var(--color-error)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                opacity: isTLBHit ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                  2. Page Table Walk
                </span>
                <Badge
                  variant={isTLBHit ? 'outline' : isPageTableHit ? 'info' : 'danger'}
                  size="sm"
                >
                  {isTLBHit ? 'BYPASSED' : isPageTableHit ? 'PAGE TABLE HIT' : 'PAGE FAULT'}
                </Badge>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-text)', lineHeight: 1.4, marginTop: '4px' }}>
                {isTLBHit ? (
                  <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Page table lookup was bypassed due to hardware TLB hit.
                  </span>
                ) : isPageTableHit ? (
                  <span style={{ color: 'var(--color-info)' }}>
                    Page Table Entry is VALID. Mapped to Frame {translationResult.resolvedFrameNumber}. Loaded into TLB.
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-error)' }}>
                    Page {translationResult.pageNumber} was NOT resident (INVALID). OS Page Fault handler allocated Frame{' '}
                    {translationResult.resolvedFrameNumber}.
                  </span>
                )}
              </div>
            </div>

            {/* Step 3: Physical Address Calculation */}
            <div
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid var(--color-accent)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
                  3. Physical Address (PA)
                </span>
                <Cpu size={14} color="var(--color-accent)" />
              </div>

              {physAddr ? (
                <div style={{ marginTop: '2px' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
                    0x{physAddr.rawAddress.toString(16).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Frame {physAddr.frameNumber} × {config.pageSizeBytes} + Offset {physAddr.offset} = {physAddr.rawAddress}
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  Unable to resolve address.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Translation Event Trace Log */}
        {translationResult && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-subdued)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
              TRANSLATION STEP LOG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {translationResult.stepsTaken.map((step, idx) => (
                <div key={idx} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                  <strong style={{ color: 'var(--color-accent)' }}>›</strong> {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
