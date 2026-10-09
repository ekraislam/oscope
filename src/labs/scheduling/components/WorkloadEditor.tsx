import React, { useState } from 'react';
import type { ProcessInput } from '../../../core/models';
import { Card, Button, Badge } from '../../../components/common';
import { SCHEDULING_PRESETS } from '../../../core/algorithms/scheduling';
import { Plus, Trash2, Edit3, Check, X, BookOpen, AlertCircle } from 'lucide-react';

interface WorkloadEditorProps {
  workload: readonly ProcessInput[];
  onAddProcess: (process: ProcessInput) => { success: boolean; error?: string };
  onUpdateProcess: (pid: string, updated: Partial<ProcessInput>) => { success: boolean; error?: string };
  onRemoveProcess: (pid: string) => void;
  onClearWorkload: () => void;
  onLoadPreset: (presetId: string) => void;
  selectedPid: string | null;
  onSelectProcess?: (pid: string) => void;
}

export const WorkloadEditor: React.FC<WorkloadEditorProps> = ({
  workload,
  onAddProcess,
  onUpdateProcess,
  onRemoveProcess,
  onClearWorkload,
  onLoadPreset,
  selectedPid,
  onSelectProcess,
}) => {
  // New process form state
  const [newPid, setNewPid] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newArrival, setNewArrival] = useState<number>(0);
  const [newBurst, setNewBurst] = useState<number>(4);
  const [newPriority, setNewPriority] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit in-place state
  const [editingPid, setEditingPid] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editArrival, setEditArrival] = useState<number>(0);
  const [editBurst, setEditBurst] = useState<number>(1);
  const [editPriority, setEditPriority] = useState<number>(1);

  // Active preset metadata
  const [activePresetId, setActivePresetId] = useState<string>('');

  const handleStartEdit = (p: ProcessInput) => {
    setEditingPid(p.pid);
    setEditName(p.name ?? '');
    setEditArrival(p.arrivalTime);
    setEditBurst(p.burstTime);
    setEditPriority(p.priority ?? 1);
  };

  const handleSaveEdit = (pid: string) => {
    const res = onUpdateProcess(pid, {
      name: editName.trim() || `Process ${pid}`,
      arrivalTime: Number(editArrival),
      burstTime: Number(editBurst),
      priority: Number(editPriority),
    });
    if (res.success) {
      setEditingPid(null);
      setFormError(null);
    } else {
      setFormError(res.error || 'Failed to update process');
    }
  };

  const handleCancelEdit = () => {
    setEditingPid(null);
    setFormError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = newPid.trim().toUpperCase() || `P${workload.length + 1}`;
    const name = newName.trim() || `Task ${pid}`;
    const res = onAddProcess({
      pid,
      name,
      arrivalTime: Math.max(0, Number(newArrival)),
      burstTime: Math.max(0, Number(newBurst)),
      priority: Math.max(0, Number(newPriority)),
    });

    if (res.success) {
      setNewPid('');
      setNewName('');
      setNewArrival(0);
      setNewBurst(4);
      setNewPriority(1);
      setFormError(null);
    } else {
      setFormError(res.error || 'Invalid process input');
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActivePresetId(val);
    if (val) {
      onLoadPreset(val);
    }
  };

  const activePreset = SCHEDULING_PRESETS.find((p) => p.id === activePresetId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Preset Selector Banner */}
      <Card padding="md" variant="subdued">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <BookOpen size={18} color="var(--color-accent)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ACADEMIC WORKLOAD PRESETS
              </span>
            </div>
            <select
              value={activePresetId}
              onChange={handlePresetChange}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                minWidth: '280px',
              }}
            >
              <option value="">Select an educational scenario...</option>
              {SCHEDULING_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {activePreset && (
            <div
              style={{
                marginTop: 'var(--space-2)',
                padding: '12px 16px',
                backgroundColor: 'rgba(6, 182, 212, 0.06)',
                borderLeft: '4px solid var(--color-accent)',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <strong style={{ color: 'var(--color-accent)' }}>Concept:</strong>
                <span>{activePreset.expectedConcept}</span>
              </div>
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong>Purpose:</strong> {activePreset.purpose}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                <strong>Key Observation:</strong> {activePreset.interestingBehavior}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Workload Table */}
      <Card
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                WORKLOAD PROCESSES
              </span>
              <Badge variant="outline" size="md">
                {workload.length} Total
              </Badge>
            </div>
            {workload.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={onClearWorkload}
              >
                Clear All
              </Button>
            )}
          </div>
        }
        padding="none"
        variant="default"
      >
        {workload.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Workload is empty. Add processes below or select an academic preset scenario above.
          </div>
        ) : (
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
                  <th style={{ padding: '10px 14px' }}>Arrival Time (ms)</th>
                  <th style={{ padding: '10px 14px' }}>Burst Time (ms)</th>
                  <th style={{ padding: '10px 14px' }}>Priority</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workload.map((p) => {
                  const isEditing = editingPid === p.pid;
                  const isSelected = selectedPid === p.pid;

                  return (
                    <tr
                      key={p.pid}
                      onClick={() => onSelectProcess?.(p.pid)}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isSelected
                          ? 'rgba(6, 182, 212, 0.08)'
                          : isEditing
                          ? 'rgba(245, 158, 11, 0.05)'
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* PID */}
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        <span style={{ color: 'var(--color-accent)' }}>{p.pid}</span>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '10px 14px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              border: '1.5px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text)',
                              padding: '4px 8px',
                              fontSize: '0.875rem',
                              width: '130px',
                            }}
                          />
                        ) : (
                          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{p.name}</span>
                        )}
                      </td>

                      {/* Arrival Time */}
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editArrival}
                            onChange={(e) => setEditArrival(Number(e.target.value))}
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              border: '1.5px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text)',
                              padding: '4px 8px',
                              fontSize: '0.875rem',
                              width: '65px',
                            }}
                          />
                        ) : (
                          <span>{p.arrivalTime}</span>
                        )}
                      </td>

                      {/* Burst Time */}
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editBurst}
                            onChange={(e) => setEditBurst(Number(e.target.value))}
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              border: '1.5px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text)',
                              padding: '4px 8px',
                              fontSize: '0.875rem',
                              width: '65px',
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: 700 }}>{p.burstTime}</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editPriority}
                            onChange={(e) => setEditPriority(Number(e.target.value))}
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              border: '1.5px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text)',
                              padding: '4px 8px',
                              fontSize: '0.875rem',
                              width: '55px',
                            }}
                          />
                        ) : (
                          <span>{p.priority ?? 1}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(p.pid)}
                                title="Save changes"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-success)',
                                  cursor: 'pointer',
                                  padding: '3px',
                                }}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                title="Cancel edit"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-text-muted)',
                                  cursor: 'pointer',
                                  padding: '3px',
                                }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(p)}
                                title="Edit process"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-text-secondary)',
                                  cursor: 'pointer',
                                  padding: '3px',
                                }}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => onRemoveProcess(p.pid)}
                                title="Remove process"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-error)',
                                  cursor: 'pointer',
                                  padding: '3px',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Process Sub-Bar */}
        <form
          onSubmit={handleAddSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface-subdued)',
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              PID
            </span>
            <input
              type="text"
              placeholder={`P${workload.length + 1}`}
              value={newPid}
              onChange={(e) => setNewPid(e.target.value)}
              style={{
                width: '75px',
                padding: '6px 8px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Name
            </span>
            <input
              type="text"
              placeholder="Task Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: '140px',
                padding: '6px 8px',
                fontSize: '0.875rem',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Arrival (AT)
            </span>
            <input
              type="number"
              min={0}
              value={newArrival}
              onChange={(e) => setNewArrival(Number(e.target.value))}
              style={{
                width: '80px',
                padding: '6px 8px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Burst (BT)
            </span>
            <input
              type="number"
              min={0}
              value={newBurst}
              onChange={(e) => setNewBurst(Number(e.target.value))}
              style={{
                width: '80px',
                padding: '6px 8px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Priority
            </span>
            <input
              type="number"
              min={0}
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value))}
              style={{
                width: '70px',
                padding: '6px 8px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
            >
              Add Process
            </Button>
          </div>
        </form>

        {formError && (
          <div
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderTop: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <AlertCircle size={14} />
            <span>{formError}</span>
          </div>
        )}
      </Card>
    </div>
  );
};
