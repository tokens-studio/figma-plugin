import React from 'react';
import { LinkBreak2Icon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';

const StyledAliasBadge = styled('div', {
  color: '$fgOnDarkDanger',
});

export default function NotFoundBadge() {
  return (
    <StyledAliasBadge data-testid="not-found-badge">
      <LinkBreak2Icon />
    </StyledAliasBadge>
  );
}
