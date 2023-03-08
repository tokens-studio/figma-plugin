import { styled } from '@/stitches.config';
import { StyledCheckbox } from './StyledCheckbox';
import { StyledGrabber } from './StyledGrabber';

export const StyledDragButton = styled('button', {
  padding: '$3 $6 $3 $1',
  display: 'flex',
  width: '100%',
  textAlign: 'left',
  '&:hover, &:focus': {
    boxShadow: 'none',
    [`+ ${StyledCheckbox}`]: {
      opacity: 1,
    },
    [`${StyledGrabber}`]: {
      opacity: 1,
    },
  },
  variants: {
    isActive: {
      true: {
        backgroundColor: '$bgAccent',
        borderColor: '$interaction',
      },
      false: {
        '&:focus, &:hover': {
          background: '$bgSubtle',
        },
      },
    },
    itemType: {
      folder: {
        cursor: 'default',
        '&:hover, &:focus': {
          backgroundColor: 'inherit',
        },
      },
      set: {},
    },
  },
});
