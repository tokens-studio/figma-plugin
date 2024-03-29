import React from 'react';
import { styled } from '@/stitches.config';

export const StyledBadge = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xsmall',
  padding: '$3',
  borderRadius: '$medium',
  backgroundColor: '$accentDefault',
  lineHeight: 1,
  color: '$fgOnEmphasis',
  fontWeight: '$bold',
});

type Props = {
  text: string;
};

export default function Badge({ text }: Props) {
  return (
    <StyledBadge>{text}</StyledBadge>
  );
}
