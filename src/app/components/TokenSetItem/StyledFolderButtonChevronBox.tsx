import Box from '../Box';
import { styled } from '@/stitches.config';

export const StyledFolderButtonChevronBox = styled(Box, {
  transition: 'transform 0.2s ease-in-out',
  color: '$textSubtle',
  variants: {
    collapsed: {
      true: {
        transform: 'rotate(-90deg)',
      },
      false: {
        transform: 'rotate(0deg)',
      },
    },
  },
});
