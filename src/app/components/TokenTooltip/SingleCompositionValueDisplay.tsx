import React from 'react';
import { TokenBoxshadowValue } from '@/types/values';
import Box from '../Box';

// @TODO confirm whether the Composition token values
// can still have the .value property from legacy

type Props = {
  property: string;
  value: string | number | Array<TokenBoxshadowValue> | object
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ property, value }) => {
  return (
    <Box css={{ color: '$bgDefault' }}>
        {property}
        {' : '}
        {value.toString()}
    </Box>

  );
};
