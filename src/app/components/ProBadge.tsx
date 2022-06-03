import React from 'react';
import { styled } from '@/stitches.config';

const StyledBadge = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xsmall',
  padding: '$2 $3',
  borderRadius: '$badge',
  backgroundColor: '$bgPro',
  color: '$fgPro',
  fontWeight: '$bold',
  textTransform: 'uppercase',

  '&:hover, &:focus': {
    backgroundColor: '$bgProHover',
    color: '$fgPro',
  },
});

export default function ProBadge() {
  return (
    <StyledBadge href="https://figmatokens.com" target="_blank">Get Pro</StyledBadge>
  );
}
