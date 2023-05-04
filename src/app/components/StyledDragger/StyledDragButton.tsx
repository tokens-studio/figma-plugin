import { styled } from '@/stitches.config';
import { StyledCheckbox } from './StyledCheckbox';
import { StyledGrabber } from './StyledGrabber';

export const StyledDragButton = styled('button', {
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
    grabberVisible: {
      true: {
        [`${StyledGrabber}`]: {
          opacity: 1,
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
