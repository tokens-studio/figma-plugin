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
  borderRadius: '$button',
  flexShrink: 0,
  variants: {
    active: {
      true: {
        backgroundColor: '$interaction',
        borderColor: '$interaction',
        color: '$onInteraction',
      },
      false: {
        backgroundColor: '$bgSubtle',
        color: '$textSubtle',
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
