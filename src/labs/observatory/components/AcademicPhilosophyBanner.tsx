/**
 * OScope — Academic Philosophy & Simulation Transparency Banner
 * Clearly explains that all metrics are derived from deterministic simulation engines
 * and does not pretend to monitor the user's physical hardware.
 */

import { ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/common';

export const AcademicPhilosophyBanner: React.FC = () => {
  return (
    <Card padding="sm" variant="subdued">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <ShieldCheck size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>ACADEMIC OBSERVATION PRINCIPLE:</strong> OScope
          is an interactive Operating System simulation platform for computer science education. All displayed metrics
          (CPU utilization, page faults, banker safety, disk blocks) are derived strictly from pure mathematical and
          algorithmic simulation models. OScope does not monitor host hardware, read local storage, or access physical system resources.
        </div>
      </div>
    </Card>
  );
};
