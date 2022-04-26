import React from 'react';
import { SingleTypographyToken } from '@/types/tokens';
import Box from './Box';

// @TODO confirm whether the typography token values
// can still have the .value property from legacy

type Props = {
  value: SingleTypographyToken['value']
};

export const ResolvedTypograhpyValueDisplay: React.FC<Props> = ({ value }) => {
  return (
    <Box css={{ display: 'flex', backgroundColor: '$bgSubtle', marginLeft: '$4' }}>
      <Box css={{ marginRight: '$6'}}>
        {
          Object.keys(value).map((key) => {
            return <p>{key}</p>
          })
        }
      </Box>
      <Box>
      {
          Object.keys(value).map((key) => {
            return <p>{value[key]}</p>
          })
        }
      </Box>
    </Box>
  );
};
