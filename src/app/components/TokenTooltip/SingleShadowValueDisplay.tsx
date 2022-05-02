import React from 'react';
import Box from '../Box';
import { TokenBoxshadowValue } from '@/types/values';

type Props = {
  shadow: TokenBoxshadowValue
};

export const SingleShadowValueDisplay: React.FC<Props> = ({ shadow }) => (
  <Box css={{
    display: 'flex', flexDirection: 'column', marginBottom: '$2', color: '$bgDefault',
  }}
  >
    <Box css={{ display: 'flex', color: '$contextMenuForegroundMuted' }}>{shadow.type}</Box>
    <Box css={{ display: 'flex' }}>
      {shadow.x}
      {' '}
      {shadow.y}
      {' '}
      {shadow.blur}
      {' '}
      {shadow.spread}
      {' '}
      {shadow.color}
    </Box>
  </Box>
);
