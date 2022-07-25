import React from 'react';
import { keyframes, styled } from '@/stitches.config';
import Box from '../Box';
import { Flex } from '../Flex';

const bounceUpDown = keyframes({
  '0%': { transform: 'translateY(-20%)' },
  '50%': { transform: 'translateY(20%)' },
  '100%': { transform: 'translateY(-20%)' },
});

const StyledResolvingLoaderBubble = styled('div', {
  width: '4px',
  height: '4px',
  borderRadius: '$full',
  background: '$fgSubtle',
  animation: `${bounceUpDown} 1000ms 0ms infinite linear`,
});

export const ResolvingLoader: React.FC = () => (
  <Flex>
    <Box
      css={{
        display: 'grid',
        padding: '$3',
        gap: '$2',
        borderRadius: '$button',
        background: '$bgSubtle',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}
    >
      <StyledResolvingLoaderBubble />
      <StyledResolvingLoaderBubble css={{ animationDelay: '300ms' }} />
      <StyledResolvingLoaderBubble css={{ animationDelay: '600ms' }} />
    </Box>
  </Flex>
);
