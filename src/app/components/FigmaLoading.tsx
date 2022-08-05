import React, { PropsWithChildren } from 'react';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import * as pjs from '../../../package.json';
import Stack from './Stack';
import { styled } from '@/stitches.config';
import Spinner from './Spinner';
import Box from './Box';

const StyledLoadingScreen = styled(Stack, {
  background: '$loadingScreenBg',
  height: 'inherit',
  color: '$loadingScreenFg',
});

const StyledLoadingButton = styled('button', {
  textDecoration: 'underline',
  color: '$loadingScreenFgMuted',
  '&:hover, &:focus': {
    color: '$loadingScreenFg',
  },
});

type Props = PropsWithChildren<{
  isLoading?: boolean
  label?: string
  onCancel?: () => void
}>;

export default function FigmaLoading({
  isLoading, label, onCancel, children,
}: Props) {
  if (!isLoading) {
    return (
      <Box>
        {children}
      </Box>
    );
  }

  return (
    <StyledLoadingScreen data-testid="figmaloading" justify="center" direction="column" gap={4} className="content scroll-container">
      <Stack direction="column" gap={4} align="center">
        <Stack direction="column" gap={4} align="center">
          <FigmaMark />
          <FigmaLetter />
        </Stack>
        <Stack direction="column" gap={4} align="center" css={{ color: '$loadingScrenFgMuted' }}>
          Version
          {' '}
          {pjs.plugin_version}
        </Stack>
        <Stack direction="row" gap={4} justify="center" align="center">
          <Spinner inverse />
          <Stack direction="column" gap={4} justify="center" align="center">
            {label ?? 'Loading, please wait.'}
          </Stack>
        </Stack>
        <Stack direction="row" gap={4}>
          <StyledLoadingButton type="button" onClick={onCancel}>Cancel</StyledLoadingButton>
        </Stack>
      </Stack>
    </StyledLoadingScreen>
  );
}
