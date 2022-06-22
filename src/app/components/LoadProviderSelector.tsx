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
  variants: {
    isActive: {
      true: {
        backgroundColor: '$bgAccent',
        borderColor: '$interaction',
      },
      false: {
        backgroundColor: '$bgSubtle',
        borderColor: '$bgSubtle',
      },
    },
  },
});

type Props = {
  text: string;
  onClick: () => void;
  isActive: boolean;
  id: string;
};

export default function LoadItem({
  text, onClick, isActive, id,
}: Props) {
  return (
    <StyledButton
      isActive={isActive}
      type="button"
      onClick={onClick}
    >
      {text}
    </StyledButton>
  );
}
