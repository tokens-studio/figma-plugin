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
  },
  variants: {
    isActive: {
      true: {
        backgroundColor: '$accentBg',
        borderColor: '$accentDefault',
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
    canReorder: {
      true: {
        '&:hover, &:focus': {
          [`${StyledGrabber}`]: {
            opacity: 1,
          },
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
