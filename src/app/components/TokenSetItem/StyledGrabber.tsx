import Box from '../Box';
import { styled } from '@/stitches.config';

export const StyledGrabber = styled(Box, {
  cursor: 'grab',
  position: 'absolute',
  left: 0,
  display: 'flex',
  alignItems: 'center',
  width: '$4',
  height: '100%',
  color: '$textSubtle',
  opacity: 0,
  '&:hover': {
    opacity: 1,
  },
});
