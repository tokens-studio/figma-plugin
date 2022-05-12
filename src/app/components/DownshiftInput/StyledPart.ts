import { styled } from '@/stitches.config';

export const StyledPart = styled('span', {
  variants: {
    matches: {
      true: {
        fontWeight: '$bold',
      },
    },
  },
});
