import { styled } from '@/stitches.config';

export const StyledTokenGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
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

export const StyledTokenGroupHeading = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const StyledTokenGroupItems = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  // need to create a class to create traversal
  [`& ${StyledTokenGroup}`]: {
    position: 'relative',
    '&::before': {
      content: '',
      bottom: '12px',
      top: 0,
      left: 0,
      position: 'absolute',
      width: '4px',
      borderBottomLeftRadius: '6px',
      borderLeft: '1px solid $borderMuted',
      borderBottom: '1px solid $borderMuted',
    },
    marginLeft: '$1',
    paddingLeft: '$3',
    '.property-wrapper': {
      marginBottom: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      borderLeft: 'none',
    },
  },
});

export const StyledCollapsableTokenGroupHeadingButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  padding: '$1 $2',
  marginLeft: '-$2',
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
