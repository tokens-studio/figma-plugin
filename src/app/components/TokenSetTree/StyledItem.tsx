import Box from '../Box';
import { styled } from '@/stitches.config';

export const StyledItem = styled(Box, {
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  gap: '$1',
  fontWeight: '$bold',
  fontSize: '$xsmall',
  width: '100%',
});
