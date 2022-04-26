import React from 'react';
import Box from './Box';
import { TokenBoxshadowValue } from '@/types/values';

type Props = {
  shadow: TokenBoxshadowValue;
  index: number
};

export const ResolvedShadowValueDisplay: React.FC<Props> = ({ shadow, index }) => (
  <Box css={{ display: 'flex', marginLeft: '$4', backgroundColor: '$bgSubtle'}}>
    <Box css={{ marginRight: "$9" }}>
      {index + 1}
    </Box>
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
