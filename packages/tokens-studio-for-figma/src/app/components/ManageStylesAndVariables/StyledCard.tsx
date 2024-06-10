import { Box } from '@tokens-studio/ui';
import { styled } from '@stitches/react';

export const StyledCard = styled(Box, {
  borderRadius: '$medium',
  border: '1px solid $colors$borderSubtle',
  padding: '$4',
  display: 'flex',
  flexDirection: 'column',
  marginBlock: '$4',
});
