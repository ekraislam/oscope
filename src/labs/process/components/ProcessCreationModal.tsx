import React, { useState } from 'react';
import type { ProcessInput } from '../../../core/models/process';
import { Button, Badge } from '../../../components/common';
import { X, Plus, AlertCircle } from 'lucide-react';

interface ProcessCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: ProcessInput) => { success: boolean; errors?: readonly string[] };
}

export const ProcessCreationModal: React.FC<ProcessCreationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [pid, setPid] = useState('');
  const [name, setName] = useState('');
  const [arrivalTime, setArrivalTime] = useState('0');
  const [burstTime, setBurstTime] = useState('5');
  const [priority, setPriority] = useState('1');
  const [hasIO, setHasIO] = useState(false);
  const [ioStartTime, setIoStartTime] = useState('2');
  const [ioDuration, setIoDuration] = useState('3');
  const [ioDevice, setIoDevice] = useState('Disk Storage');
  const [errors, setErrors] = useState<readonly string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const parsedArrival = parseInt(arrivalTime, 10);
    const parsedBurst = parseInt(burstTime, 10);
    const parsedPriority = parseInt(priority, 10);

    const input: ProcessInput = {
      pid: pid.trim(),
      name: name.trim().length > 0 ? name.trim() : undefined,
      arrivalTime: isNaN(parsedArrival) ? -1 : parsedArrival,
      burstTime: isNaN(parsedBurst) ? -1 : parsedBurst,
      priority: isNaN(parsedPriority) ? 0 : parsedPriority,
      ioBursts: hasIO
        ? [
            {
              startAtCPUTime: parseInt(ioStartTime, 10) || 0,
              duration: parseInt(ioDuration, 10) || 1,
              device: ioDevice.trim() || 'I/O Device',
            },
          ]
        : undefined,
    };

    const result = onCreate(input);
    if (result.success) {
      // Reset form fields
      setPid('');
      setName('');
      setArrivalTime('0');
      setBurstTime('5');
      setPriority('1');
      setHasIO(false);
      setErrors([]);
      onClose();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subdued)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Plus size={18} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              INITIALIZE NEW PROCESS
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Validation Errors Box */}
          {errors.length > 0 && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-danger-subtle)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-danger)' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Validation Error:</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                PID *
              </label>
              <input
                type="text"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                placeholder="e.g. P1"
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Process Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Web Browser"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Arrival Time (ms)
              </label>
              <input
                type="number"
                min="0"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                CPU Burst (ms) *
              </label>
              <input
                type="number"
                min="1"
                value={burstTime}
                onChange={(e) => setBurstTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Priority
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subdued)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>

          {/* I/O Burst Checkbox & Options */}
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-subdued)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.8125rem' }}>
              <input
                type="checkbox"
                checked={hasIO}
                onChange={(e) => setHasIO(e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Configure I/O Burst Profile
              </span>
              <Badge variant="outline" size="sm">
                Optional
              </Badge>
            </label>

            {hasIO && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    Trigger at CPU Time:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ioStartTime}
                    onChange={(e) => setIoStartTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    Wait Duration (ms):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ioDuration}
                    onChange={(e) => setIoDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    Device:
                  </label>
                  <input
                    type="text"
                    value={ioDevice}
                    onChange={(e) => setIoDevice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.75rem',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" icon={<Plus size={16} />}>
              Create Process (PCB)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
