import React from 'react';
import { styled } from '@/stitches.config';

const StyledAliasBadge = styled('div', {
  borderRadius: '$badge',
  padding: '$1 $2',
  backgroundColor: '$bgOnDarkAccentSubtle',
  color: '$fgOnDarkAccent',
});

type Props = {
  value: string | number | null;
};

export default function AliasBadge({ value }: Props) {
  return (
    <StyledAliasBadge>{value}</StyledAliasBadge>
  );
}
