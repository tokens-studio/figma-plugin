import React from 'react';
import { useDispatch } from 'react-redux';
import { Tabs } from '@/constants/Tabs';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import * as pjs from '../../../package.json';
import Stack from './Stack';
import { Dispatch } from '../store';
import { styled } from '@/stitches.config';
import Spinner from './Spinner';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

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

export default function FigmaLoading() {
  const dispatch = useDispatch<Dispatch>();

  const handleCancel = React.useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.START);
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CANCEL_OPERATION,
    });
  }, [dispatch.uiState]);

  return (
    <StyledLoadingScreen justify="center" direction="column" gap={4} className="content scroll-container">
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
            Loading, please wait.
          </Stack>
        </Stack>
        <Stack direction="row" gap={4}>
          <StyledLoadingButton type="button" onClick={handleCancel}>Cancel</StyledLoadingButton>
        </Stack>
      </Stack>
    </StyledLoadingScreen>
  );
}
