import { styled } from '@/stitches.config';
import IconButton from '../IconButton';

export const StyledTokenGroupAddIcon = styled(IconButton, {
  opacity: 0,
  '&:hover, &:focus, &:focus-within': {
    opacity: 1,
  },
});

export const StyledTokenGroupHeading = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover, &:focus': {
    [`& ${StyledTokenGroupAddIcon}`]: {
      opacity: 1,
    },
  },
});

export const StyledTokenGroupHeadingCollapsable = styled('button', {
  display: 'flex',
  alignItems: 'center',
  padding: '$1 $2',
  marginLeft: '-$2',
  gap: '$2',
  borderRadius: '$button',
  '&:hover, &:focus': {
    backgroundColor: '$bgSubtle',
    boxShadow: 'none',
    border: 'none',
    [`+ ${StyledTokenGroupAddIcon}`]: {
      opacity: 1,
    },
  },
  '> svg': {
    opacity: 0.5,
  },
  variants: {
    collapsed: {
      true: {
        opacity: 0.75,
      },
    },
  },
});

export const StyledTokenGroupHeadingButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: '$4',
  gap: '$2',
  '&:hover, &:focus': {
    backgroundColor: '$bgSubtle',
    outline: 'none',
  },
  variants: {
    isCollapsed: {
      true: {
        opacity: 0.5,
      },
    },
  },
});
