import React from 'react';
import type { ProcessControlBlock } from '../../../core/models/process';
import { Button, Badge } from '../../../components/common';
import {
  Play,
  ArrowRight,
  Pause,
  HardDrive,
  CheckCircle2,
  FastForward,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TransitionControlDeckProps {
  selectedProcess: ProcessControlBlock | null;
  isRunningOccupied: boolean;
  onAdmit: (pid: string) => void;
  onDispatch: (pid: string) => void;
  onYield: (pid: string) => void;
  onBlock: (pid: string) => void;
  onUnblock: (pid: string) => void;
  onTerminate: (pid: string) => void;
  onExecuteTick: () => void;
  onReset: () => void;
  onLoadPresets: () => void;
}

export const TransitionControlDeck: React.FC<TransitionControlDeckProps> = ({
  selectedProcess,
  isRunningOccupied,
  onAdmit,
  onDispatch,
  onYield,
  onBlock,
  onUnblock,
  onTerminate,
  onExecuteTick,
  onReset,
  onLoadPresets,
}) => {
  const currentState = selectedProcess?.state ?? null;
  const pid = selectedProcess?.pid ?? null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Contextual Actions on Selected Process */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginRight: 'var(--space-2)',
          }}
        >
          {selectedProcess ? `Actions for ${selectedProcess.pid}:` : 'Select a process to act:'}
        </span>

        {/* State: NEW */}
        {currentState === 'NEW' && pid && (
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            onClick={() => onAdmit(pid)}
          >
            Admit to Ready Queue
          </Button>
        )}

        {/* State: READY */}
        {currentState === 'READY' && pid && (
          <Button
            variant="primary"
            size="md"
            icon={<Play size={16} />}
            disabled={isRunningOccupied}
            title={isRunningOccupied ? 'CPU currently occupied by another process' : 'Dispatch to CPU Core'}
            onClick={() => onDispatch(pid)}
          >
            Dispatch to CPU {isRunningOccupied ? '(CPU Busy)' : ''}
          </Button>
        )}

        {/* State: RUNNING */}
        {currentState === 'RUNNING' && pid && (
          <>
            <Button
              variant="primary"
              size="md"
              icon={<FastForward size={16} />}
              onClick={onExecuteTick}
            >
              Execute 1 Tick
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<Pause size={16} />}
              onClick={() => onYield(pid)}
            >
              Yield to Ready
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<HardDrive size={16} />}
              onClick={() => onBlock(pid)}
            >
              Block for I/O
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={<CheckCircle2 size={16} />}
              onClick={() => onTerminate(pid)}
            >
              Force Terminate
            </Button>
          </>
        )}

        {/* State: WAITING */}
        {currentState === 'WAITING' && pid && (
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            onClick={() => onUnblock(pid)}
          >
            Complete I/O → Ready
          </Button>
        )}

        {/* State: TERMINATED */}
        {currentState === 'TERMINATED' && (
          <Badge variant="outline" size="md">
            Process Terminated (Read-Only)
          </Badge>
        )}

        {!selectedProcess && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            None selected
          </span>
        )}
      </div>

      {/* Global Simulation Engine Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Button
          variant="secondary"
          size="md"
          icon={<FastForward size={16} />}
          onClick={onExecuteTick}
          title="Advances simulation clock by 1 tick and executes CPU/IO steps"
        >
          Step Clock (+1ms)
        </Button>
        <Button
          variant="outline"
          size="md"
          icon={<Sparkles size={16} />}
          onClick={onLoadPresets}
          title="Load standard mix of CPU & I/O bound processes"
        >
          Load Demo Preset
        </Button>
        <Button
          variant="ghost"
          size="md"
          icon={<RotateCcw size={16} />}
          onClick={onReset}
          title="Reset laboratory state and virtual clock"
        >
          Reset Lab
        </Button>
      </div>
    </div>
  );
};
