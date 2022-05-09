import React from 'react';
import { useDispatch } from 'react-redux';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { Tabs } from '@/constants/Tabs';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import Icon from './Icon';
import * as pjs from '../../../package.json';
import Stack from './Stack';
import { Dispatch } from '../store';
import { styled } from '@/stitches.config';

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
    postToFigma({
      type: MessageToPluginTypes.CANCEL_OPERATION,
    });
  }, [dispatch.uiState]);

  return (
    <StyledLoadingScreen justify="center" direction="column" gap={4} className="content scroll-container">
      <Stack direction="column" gap={4} align="center">
        <Stack direction="column" gap={4} align="center">
          <FigmaMark />
          <FigmaLetter />
        </Stack>
        <Stack direction="column" gap={4} align="center" css={{ color: '$loadingScrenFgMuted', fontSize: '$xsmall' }}>
          Version
          {' '}
          {pjs.plugin_version}
        </Stack>
        <Stack direction="row" gap={4} justify="center" align="center">
          <div className="rotate">
            <Icon name="loading" />
          </div>
          <Stack direction="column" gap={4} justify="center" align="center">
            Loading. please wait
          </Stack>
        </Stack>
        <Stack direction="row" gap={4}>
          <StyledLoadingButton type="button" onClick={handleCancel}>Cancel</StyledLoadingButton>
        </Stack>
      </Stack>
    </StyledLoadingScreen>
  );
}
