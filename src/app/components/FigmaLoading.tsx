import React from 'react';
import { useDispatch } from 'react-redux';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { Tabs } from '@/constants/Tabs';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import InitialLoading from '@/icons/initial-loading.svg';
import * as pjs from '../../../package.json';
import Button from './Button';
import Stack from './Stack';
import { Dispatch } from '../store';

const figmaLoadingScreen = {
  background: '$contextMenuBackground',
  padding: '$8',
  height: 'inherit',
  color: '$bgDefault',
  alignItems: 'center',
  justifyContent: 'center',
  overflowX: 'hidden',
};

const buttonWrapper = {
  textAlign: 'center',
  '& > button': {
    textDecoration: 'underline',
    '&:hover': {
      color: '$contextMenuBackground'  
    }
  },
};

export default function FigmaLoading() {
  const dispatch = useDispatch<Dispatch>();

  const handleCancel = React.useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.START);
    postToFigma({
      type: MessageToPluginTypes.CANCEL_OPERATION,
    });
  }, []);

  return (
    <Stack direction="column" gap={4} className='content' css={{...figmaLoadingScreen}}>
      <Stack direction="column" gap={4} align="center">
        <FigmaMark />
        <FigmaLetter />
      </Stack>
      <Stack direction="column" gap={4} align="center" css={{ color: '$textMuted', fontSize: '$xsmall' }}>
        Version
        {' '}
        {pjs.plugin_version}
      </Stack>
      <Stack direction="row" gap={4} justify="center" align="center">
          <div className="rotate">
            <InitialLoading/>
          </div>
        <Stack direction="column" gap={4} justify="center" align="center">
          Loading. please wait
        </Stack>
      </Stack>
      <Stack direction="row" gap={4} css={{...buttonWrapper}}>
        <Button variant="ghost" size="small" onClick={handleCancel}>Cancel</Button>
      </Stack>
    </Stack>
  );
}
