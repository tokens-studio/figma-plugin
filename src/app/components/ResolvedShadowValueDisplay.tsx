import React from 'react';
import { useUIDSeed } from 'react-uid';
import Box from './Box';
import { styled } from '@/stitches.config';
import { TokenBoxshadowValue } from '@/types/values';

type Props = {
  shadows: TokenBoxshadowValue[];
};

const StyledIndexItem = styled('div', {
  color: '$textSubtle',
  marginBottom: '$2',
});

const StyledValueItem = styled('div', {
  marginBottom: '$2',
});

export const ResolvedShadowValueDisplay: React.FC<Props> = ({ shadows }) => {
  const seed = useUIDSeed();

  return (
    <Box css={{
      display: 'flex', backgroundColor: '$bgSubtle', padding: '$4', fontSize: '$xsmall',
    }}
    >
      <Box css={{ display: 'grid', marginRight: '$9' }}>
        {shadows.map((shadow, index) => (
          <StyledIndexItem key={seed(shadow)}>{index + 1}</StyledIndexItem>
        ))}
      </Box>

      <Box css={{ display: 'grid', marginLeft: '$6' }}>
        {shadows.map((shadow) => (
          <StyledValueItem key={seed(shadow)}>
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
        ))}
      </Box>
    </Box>
  );
};
