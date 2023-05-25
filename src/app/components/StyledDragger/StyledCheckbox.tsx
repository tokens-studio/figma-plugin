import Box from '../Box';
import { styled } from '@/stitches.config';

export const StyledCheckbox = styled(Box, {
  position: 'absolute',
  right: '$4',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  variants: {
    checked: {
      true: {
        opacity: 1,
      },
      indeterminate: {
        opacity: 1,
      },
      false: {
        opacity: 0.5,
        '&:hover, &:focus': {
          opacity: 1,
        },
      },
    },
  },
});
