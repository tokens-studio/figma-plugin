import React from 'react';
import Icon from './Icon';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import * as pjs from '../../../package.json';
import Button from './Button';
import Stack from './Stack';

const lodingStyle = { 
  background: 'Black', 
  padding: '$8', height: 'inherit', 
  alignItems: 'center', 
  color: 'White', 
  overflow: 'scroll', 
  overflowX: 'hidden',
  '& > button:hover': {
    color: 'wheat',
    background: 'black !important'
  },
}
export default function FigmaLoading() {
  const handleCancel = React.useCallback(() => {
    postToFigma({
      type: MessageToPluginTypes.CANCEL_OPERATION,
    });
  }, []);

  return (
    <Stack direction="column" gap={4} css={{...lodingStyle}}>
      <Stack direction="column" gap={4} css={{ fontSize: '60px' }}>
        <div>
          Figma
        </div>
        <div>
          Tokens
        </div>
      </Stack>
      <Stack direction="column" gap={4} css={{ color: '$textMuted', fontSize: '$xsmall' }}>
        Version
        {' '}
        {pjs.plugin_version}
      </Stack>
      <Stack direction="row" gap={4} justify="center" align="center">
        <Stack direction="column" gap={4} justify="center" align="center">
          <div className="rotate bg-primary-100">
            <Icon name="loading" />
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
