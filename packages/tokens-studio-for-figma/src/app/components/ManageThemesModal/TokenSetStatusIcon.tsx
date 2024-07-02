import React from 'react';
import Box from '../Box';
import { IconCheck, IconIndeterminateAlt } from '@/icons';
import { styled } from '@/stitches.config';

const TokenSetIconWrapper = styled(Box, {
  width: '12px',
  height: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  borderColor: 'transparent',
  borderRadius: '$small',
  flexShrink: 0,
  variants: {
    active: {
      true: {
        backgroundColor: '$accentDefault',
        borderColor: '$accentDefault',
        color: '$fgOnEmphasis',
      },
      false: {
        backgroundColor: '$bgSubtle',
        color: '$fgSubtle',
        borderColor: '$borderMuted',
      },
    },
  },
});

export default function TokenSetStatusIcon({ status }: { status: 'source' | 'enabled' | 'disabled' }) {
  return (
    <TokenSetIconWrapper active={status !== 'disabled'}>
      {status === 'source' && <IconIndeterminateAlt />}
      {status === 'enabled' && <IconCheck />}
    </TokenSetIconWrapper>
  );
}
