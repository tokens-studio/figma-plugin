import { Box } from '@tokens-studio/ui';
import React from 'react';
import { StyledDirtyStateBadge } from './StyledDirtyStateBadge';

export function DirtyStateBadgeWrapper({
  badge,
  children,
  badgeTestId,
}: {
  badge: boolean;
  children: React.ReactNode;
  badgeTestId?: string;
}) {
  return (
    <Box css={{ position: 'relative' }}>
      {badge && <StyledDirtyStateBadge data-testid={badgeTestId} />}
      {children}
    </Box>
  );
}
