import React from 'react';
import { useDispatch } from 'react-redux';
import Icon from './Icon';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { Tabs } from '@/constants/Tabs';
import * as pjs from '../../../package.json';
import Button from './Button';
import Stack from './Stack';
import { Dispatch } from '../store';

const lodingStyle = { 
  background: 'Black', 
  padding: '$8', height: 'inherit', 
  alignItems: 'center', 
  color: 'White', 
  overflow: 'scroll', 
  overflowX: 'hidden',
  justifyContent: 'center',
  '& > button:hover': {
    color: 'wheat',
    background: 'black !important'
  },
  '& > button': {
    textDecoration: 'underline'
  },
}

export default function FigmaLoading() {
  const dispatch = useDispatch<Dispatch>();

  const handleCancel = React.useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.START);
    postToFigma({
      type: MessageToPluginTypes.CANCEL_OPERATION,
    });
  }, []);

  return (
    <Stack direction="column" gap={4} css={{...lodingStyle}}>
      <Stack direction="column" gap={4} css={{ alignItems: 'center' }}>
        <div>
          <img alt="Figma" src={require('../assets/mark.png')} className="rounded width-13w"/>
        </div>
        <div>
          <img alt="Figma" src={require('../assets/letter.png')} className="rounded width-30w"/>
        </div>
      </Stack>
      <Stack direction="column" gap={4} css={{ color: '$textMuted', fontSize: '$xsmall' }}>
        Version
        {' '}
        {pjs.plugin_version}
      </Stack>
      <Stack direction="row" gap={4} justify="center" align="center">
        <Stack direction="column" gap={4} justify="center" align="center">
          <div className="rotate initial-loading">
            <Icon name="loading"/>
          </div>
        </Stack>
        <Stack direction="column" gap={4} justify="center" align="center">
          Loading. please wait
        </Stack>
      </Stack>

      <Button variant="ghost" size="small" onClick={handleCancel}>Cancel</Button>
    </Stack>
  );
}
