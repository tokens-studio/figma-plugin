import React from 'react';
import { useDispatch } from 'react-redux';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { Tabs } from '@/constants/Tabs';
import FigmaMark from '@/icons/figma-mark.svg';
import FigmaLetter from '@/icons/figma-letter.svg';
import Icon from './Icon';
import * as pjs from '../../../package.json';
import Button from './Button';
import Stack from './Stack';
import { Dispatch } from '../store';

const fgLoadingScreen = {
  background: '$contextMenuBackground',
  height: 'inherit',
  color: '$bgDefault',
  '& > div': {
    margin: 'auto'
  }
};

const buttonWrapper = {
  '& > button': {
    textDecoration: 'underline',
    color: '$bgDefault',
    '&:hover': {
      color: '$contextMenuBackground',
    }
  }
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
    <Stack direction="column" gap={4} className='content scroll-container' css={{ ...fgLoadingScreen }}>
      <Stack direction="column" gap={4} align="center">
        <Stack direction="column" gap={4} align="center">
          <FigmaMark />
          <FigmaLetter />
        </Stack>
        <Stack direction="column" gap={4} align="center" css={{ color: '$bgDefault', fontSize: '$xsmall' }}>
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
        <Stack direction="row" gap={4} css={{...buttonWrapper}}>
          <Button variant="ghost" size="small" onClick={handleCancel}>Cancel</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
