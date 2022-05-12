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
    isStored: {
      true: {
        backgroundColor: '$bgAccent',
        borderColor: '$interactionSubtle',
      },
    },
  },
});

type Props = {
  text: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  isStored?: boolean;
  id: string;
};

export default function StorageItem({
  text, onClick, isActive, isStored, id,
}: Props) {
  return (
    <StyledButton
      data-cy={`provider-${id}`}
      isActive={isActive}
      isStored={isStored}
      type="button"
      onClick={onClick}
    >
      {text}
    </StyledButton>
  );
}
