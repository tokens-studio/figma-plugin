import React from 'react';
import { styled } from '@/stitches.config';
import IconBrokenLink from '@/icons/brokenlink.svg';

const StyledAliasBadge = styled('div', {
  borderRadius: '$badge',
  backgroundColor: '$bgOnDarkDangerSubtle',
  color: '$fgOnDarkDanger',
});

export default function NotFoundBadge() {
  return (
    <StyledAliasBadge><IconBrokenLink /></StyledAliasBadge>
  );
}
