import React from 'react';
import { TokenCompositionValue } from '@/types/values';
import Box from '../Box';

// @TODO confirm whether the Composition token values
// can still have the .value property from legacy

type Props = {
  value: TokenCompositionValue
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ value }) => {
  return (
    <Box css={{ color: '$bgDefault' }}>
        {value?.property}
        {' : '}
        {value?.value.toString()}
    </Box>

  );
};
