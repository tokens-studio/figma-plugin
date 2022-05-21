import React from 'react';
import { TokenBoxshadowValue } from '@/types/values';
import Box from '../Box';

type Props = {
  property: string;
  value: string | number | Array<TokenBoxshadowValue> | object
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ property, value }) => (
  <Box css={{ color: '$fgToolTipMuted' }}>
    {property}
    {' : '}
    {value.toString()}
  </Box>

);
