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
  color: '$spinner',
});

export default function Spinner() {
  return (
    <StyledSpinner><LoadingIcon /></StyledSpinner>
  );
}
