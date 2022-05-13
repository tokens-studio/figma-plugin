import React from 'react';
import { TokenBoxshadowValue, TokenCompositionValue, TokenTypograpyValue } from '@/types/values';
import Box from '../Box';
import { TokenTypes } from '@/constants/TokenTypes';

// @TODO confirm whether the Composition token values
// can still have the .value property from legacy

type Props = {
  value: TokenCompositionValue
};

export const SingleCompositionValueDisplay: React.FC<Props> = ({ value }) => {
  const displayValue = React.useCallback((compositionValue: TokenBoxshadowValue | TokenTypograpyValue | string) => {
    let returnValue: string;
    if (typeof compositionValue !== 'string') {
      returnValue = Object.entries(compositionValue).reduce<string>((acc, [, propertyValue]) => (
        `${acc}${propertyValue.toString()}/`
      ), '');  
    }
    else returnValue = compositionValue;
    return returnValue;
  }, []);
  return (
    <Box css={{ color: '$bgDefault', display: 'flex' }}>
      <Box css={{ color: '$bgDefault' }}>
        {value?.property + ':'}
      </Box>
      <Box css={{ color: '$bgDefault', display: 'grid' }}>
        {
          (Array.isArray(value.value)) ? (
            value.value.map((singleValue) => {
              return (
                <Box>
                  {displayValue(singleValue)}
                </Box>
              )
            })
          ) : (
            <Box>
              {displayValue(value.value)}
            </Box>
          )
        }
      </Box>
    </Box>

  );
};
