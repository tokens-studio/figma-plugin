import React from 'react';
import { keyframes, styled } from '@/stitches.config';
import LoadingIcon from '@/icons/loading.svg';

const rotate = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

const StyledSpinner = styled('div', {
  animation: `${rotate} 1000ms linear infinite`,
  variants: {
    inverse: {
      true: {
        color: '$spinnerInverse',
      },
      false: {
        color: '$fgDefault',
      },
    },
  },
});

export default function Spinner({ inverse = false }: { inverse?: boolean }) {
  return (
    <StyledSpinner inverse={inverse}><LoadingIcon /></StyledSpinner>
  );
}
