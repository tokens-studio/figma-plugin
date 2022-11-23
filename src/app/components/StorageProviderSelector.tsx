import React from 'react';
import { styled } from '@/stitches.config';

const StyledButton = styled('button', {
  fontWeight: '$bold',
  fontSize: '$xsmall',
  display: 'flex',
  padding: '$3 $4',
  borderRadius: '$default',
  border: '1px solid transparent',
  '&:focus': {
    outline: 'none',
  },
});

type Props = {
  text: string;
};

export default function StorageItem({
  text,
}: Props) {
  return (
    <StyledButton
      type="button"
    >
      {text}
    </StyledButton>
  );
}
