import React from 'react';
import Box from './Box';
import { styled } from '@/stitches.config';
import { TokenBoxshadowValue } from '@/types/values';

type Props = {
  shadows: TokenBoxshadowValue[];
};

const StyledIndexItem = styled('div', {
  color: '$textSubtle',
  marginBottom: '$4',
});

const StyledValueItem = styled('div', {
  marginBottom: '$4',
});

export const ResolvedShadowValueDisplay: React.FC<Props> = ({ shadows }) => {
  return (
    <Box css={{ display: 'flex', backgroundColor: '$bgSubtle',  padding: '$4' }}>
      <Box css={{ display: 'grid', marginRight: '$9' }}>
      {
        shadows.map((shadow, index) => {
          return <StyledIndexItem key={index}>{index + 1}</StyledIndexItem>
        })
      }
    </Box>

    <Box css={{ display: 'grid', marginLeft: '$6' }}>
      {
        shadows.map((shadow, index) => {
          return <StyledValueItem key={index}>
            {shadow.x}
            {' '}
            {shadow.y}
            {' '}
            {shadow.blur}
            {' '}
            {shadow.spread}
            {' '}
            {shadow.color}
          </StyledValueItem>
        })
      }
    </Box>
  </Box>
  )
};
