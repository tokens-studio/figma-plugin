import React from 'react';
import { styled } from '@/stitches.config';

const StyledButton = styled('button', {
  fontWeight: '$bold',
  fontSize: '$xsmall',
  display: 'flex',
  padding: '$2',
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
    },
    isStored: {
      true: {
        backgroundColor: '$bgAccent',
        borderColor: '$interactionSubtle',
      },
    },
  },
});

export default function StorageItem({
  text, onClick, isActive, isStored, id,
}) {
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
