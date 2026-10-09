import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { EmptyState, Button, Badge } from '../../components/common';
import { Link } from 'wouter';

export const NotFoundView: React.FC = () => {
  return (
    <div style={{ padding: 'var(--space-8) 0' }}>
      <EmptyState
        icon={<AlertTriangle size={28} color="var(--color-warning)" />}
        title="Subsystem Address Unmapped (404)"
        description="The requested observatory route does not map to any recognized laboratory or telemetry address space."
        badge={<Badge variant="warning">Segmentation Fault / 404</Badge>}
        action={
          <Link href="/">
            <Button variant="primary" size="md">
              Return to Base Observatory
            </Button>
          </Link>
        }
      />
    </div>
  );
};
