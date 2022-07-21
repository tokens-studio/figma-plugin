import { styled } from '@/stitches.config';
import IconButton from '../IconButton';

export const StyledIconButton = styled(IconButton, {
  color: '$textMuted',
  transition: 'transform 0.2s ease-in-out',
  button: {
    padding: '$3',
  },
  variants: {
    open: {
      true: {
        transform: 'rotate(0deg)',
      },
      false: {
        transform: 'rotate(-90deg)',
      },
    },
  },
});
