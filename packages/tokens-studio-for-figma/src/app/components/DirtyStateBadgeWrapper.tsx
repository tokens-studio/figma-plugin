import { Box } from '@tokens-studio/ui';
import React from 'react';
import { StyledDirtyStateBadge } from './StyledDirtyStateBadge';

export function DirtyStateBadgeWrapper({ badge, children }: { badge: boolean, children: React.ReactNode }) {
  return (
    <Box css={{ position: 'relative' }}>
      {badge && <StyledDirtyStateBadge />}
      {children}
    </Box>
  );
}
