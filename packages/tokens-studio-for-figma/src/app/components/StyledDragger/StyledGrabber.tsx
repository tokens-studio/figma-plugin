import Box from '../Box';
import { styled } from '@/stitches.config';

export const StyledGrabber = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  width: '$4',
  height: '100%',
  color: '$fgSubtle',
  opacity: 0,
  variants: {
    canReorder: {
      true: {
        cursor: 'grab',
        '&:hover': {
          opacity: 1,
        },
      },
      false: {
        pointerEvents: 'none',
      },
    },
  },
});
