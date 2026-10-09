import React from 'react';
import { SectionHeader } from '../common';

export interface LabLayoutProps {
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const LabLayout: React.FC<LabLayoutProps> = ({
  title,
  description,
  badge,
  actions,
  children,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <SectionHeader
        title={title}
        description={description}
        badge={badge}
        actions={actions}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
};
