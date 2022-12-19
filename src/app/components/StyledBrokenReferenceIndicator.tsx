import React from 'react';
import IconBrokenLink from '@/icons/brokenlink.svg';
import { styled } from '@/stitches.config';

const StyledIndicator = styled('div', {
  position: 'absolute',
  top: '3px',
  right: '3px',
  borderRadius: '100%',
  border: '1px solid $bgDefault',
  background: '$dangerFg',
  width: '6px',
  height: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export default function StyledBrokenReferenceIndicator() {
  return (
    <StyledIndicator>
      <IconBrokenLink />
    </StyledIndicator>
  );
}
