import React from 'react';
import Box from '../Box';
import { TokenBoxshadowValue } from '@/types/values';

type Props = {
  shadow: TokenBoxshadowValue
};

// @TODO: Figure out how to display resolved shadow value without seeming duplicative / like we do for typography a shorthand

export const SingleShadowValueDisplay: React.FC<Props> = ({ shadow }) => (
  <Box css={{
    display: 'flex', flexDirection: 'column', marginBottom: '$2', color: '$fgToolTipMuted',
  }}
  >
    <Box css={{ display: 'flex', color: '$fgToolTipMuted' }}>{shadow.type}</Box>
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
