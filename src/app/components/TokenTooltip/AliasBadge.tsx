import React from 'react';
import { styled } from '@/stitches.config';

const StyledAliasBadge = styled('div', {
  padding: '$1 $2',
  backgroundColor: '$bgOnDarkAccentSubtle',
  color: '$fgOnDarkAccent',
  height: '100%',
  wordBreak: 'break-word',
  flexShrink: 1,
});

type Props = {
  value: string | number | null;
};

export default function AliasBadge({ value }: Props) {
  return (
    <StyledAliasBadge>{value}</StyledAliasBadge>
  );
}
