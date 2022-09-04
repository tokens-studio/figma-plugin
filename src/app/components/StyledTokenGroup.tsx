import { styled } from '@/stitches.config';

export const StyledTokenGroup = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  gap: '$1',
  variants: {
    displayType: {
      LIST: {
        flexDirection: 'column',
      },
      GRID: {
        flexDirection: 'row',
      },
    },
  },
});

export const StyledCollapsableTokenGroupHeadingButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  padding: '$1 $2',
  gap: '$2',
  borderRadius: '$1',
  '&:hover, &:focus': {
    backgroundColor: '$bgSubtle',
    boxShadow: 'none',
    border: 'none',
  },
  '> svg': {
    opacity: 0.5,
  },
  variants: {
    collapsed: {
      true: {
        opacity: 0.5,
      },
    },
  },
});
