import React from 'react';
import { LinkBreak2Icon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';

const StyledAliasBadge = styled('div', {
  color: '$fgOnDarkDanger',
});

export default function NotFoundBadge() {
  return (
    <StyledAliasBadge>
      <LinkBreak2Icon />
    </StyledAliasBadge>
  );
}
