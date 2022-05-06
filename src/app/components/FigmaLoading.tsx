import React from 'react';
import { styled } from '@/stitches.config';
import { useDispatch } from 'react-redux';
import Icon from './Icon';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { Tabs } from '@/constants/Tabs';
import * as pjs from '../../../package.json';
import Button from './Button';
import Stack from './Stack';
import { Dispatch } from '../store';

const FgLoadingScreen = styled('div', {
  display: 'grid',
  background: 'Black',
  padding: '$8',
  height: 'inherit',
  color: 'White',
  alignItems: 'center',
  justifyContent: 'center',
  '& > button:hover': {
    color: 'wheat',
    background: 'black !important'
  },
  '& > button': {
    textDecoration: 'underline'
  },
  '.rotate > svg': {
    filter: 'invert(99%) sepia(4%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)'
  },
});

export default function FigmaLoading() {
  const dispatch = useDispatch<Dispatch>();

  const handleCancel = React.useCallback(() => {
    dispatch.uiState.setActiveTab(Tabs.START);
    postToFigma({
      type: MessageToPluginTypes.CANCEL_OPERATION,
    });
  }, []);

  return (
    <FgLoadingScreen className='content scroll-container'>
      <Stack direction="column" gap={4} align="center">
        <Icon name="figma" />
        <Icon name="figmaLetter" />
      </Stack>
      <Stack direction="column" gap={4} align="center" css={{ color: '$textMuted', fontSize: '$xsmall' }}>
        Version
        {' '}
        {pjs.plugin_version}
      </Stack>
      <Stack direction="row" gap={4} justify="center" align="center">
        <Stack direction="column" gap={4} justify="center" align="center">
          <div className="rotate">
            <Icon name="loading"/>
          </div>
        </Stack>
        <Stack direction="column" gap={4} justify="center" align="center">
          Loading. please wait
        </Stack>
      </Stack>

      <Stack direction="column" gap={4} align="center" css={{ '& > button': { width: 'inherit' }}}>
        <Button variant="ghost" size="small" onClick={handleCancel}>Cancel</Button>
      </Stack>
    </FgLoadingScreen>
  );
}
