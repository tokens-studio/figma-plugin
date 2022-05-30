import React from 'react';
import { styled } from '@/stitches.config';

const StyledBadge = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xsmall',
  padding: '$2 $3',
  borderRadius: '$badge',
  backgroundColor: '$bgAccent',
  color: '$onInteraction',
  fontWeight: '$bold',

  '&:hover, &:focus': {
    backgroundColor: '$bgAccentHover',
    color: '$onInteraction',
  },
});

export default function ProBadge() {
  return (
    <StyledBadge href="https://figmatokens.com" target="_blank">Pro</StyledBadge>
  );
}
