import React from 'react';
import { SingleCompositionToken } from '@/types/tokens';
import Box from '../Box';

// @TODO confirm whether the Composition token values
// can still have the .value property from legacy

type Props = {
  value: SingleCompositionToken['value']
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ value }) => {
  return (
    <Box css={{ color: '$bgDefault' }}>
      {
        (Array.isArray(value)) ? (
          value.map((v, index) => (
            <div key={index}>
              {v?.property}
              {' : '}
              {v?.value}
            </div>
          ))
        ) : (
          <div>
            {value.property}
            {' : '}
            {value.value}
          </div>
        )
      }
    </Box>
  );
};
