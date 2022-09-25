import { TokenTypes } from '@/constants/TokenTypes';
import { styled } from '@/stitches.config';

export const StyledTokenButtonText = styled('span', {
  color: '$fgDefault',
  padding: '$2 $3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexShrink: 0,
  textAlign: 'left',
  gap: '$2',
});

export const StyledTokenButton = styled('button', {
  position: 'relative',
  marginBottom: '$2',
  marginRight: '$2',
  backgroundColor: '$bgSubtle',
  '&:hover, &:focus': {
    backgroundColor: '$bgAccent',
  },
  variants: {
    tokenType: {
      [TokenTypes.COLOR]: {
        [`& ${StyledTokenButtonText}::before`]: {
          width: '$6',
          height: '$6',
          flexShrink: 0,
          border: '1px solid',
          content: '',
          borderRadius: '$full',
          background: 'var(--backgroundColor)',
          borderColor: 'var(--borderColor)',
        },
      },
    },
    displayType: {
      LIST: {
        width: '100%',
        borderRadius: '$tokenButton',
        backgroundColor: 'transparent',
        [`& ${StyledTokenButtonText}`]: {
          justifyContent: 'flex-start',
        },
      },
      GRID: {
        borderRadius: '$tokenButton',
        [`& ${StyledTokenButtonText}`]: {
          borderRadius: '$full',
        },
      },
    },
    active: {
      true: {
        backgroundColor: '$bgAccent',
        boxShadow: '$focusMuted !important',
        '&:hover, &:focus': {
          boxShadow: '$focusMuted !important',
        },
      },
    },
    disabled: {
      true: {
        borderColor: '$border',
      },
    },
  },
  compoundVariants: [
    {
      displayType: 'LIST',
      tokenType: TokenTypes.COLOR,
      css: {
        width: '100%',
        '&:hover, &:focus': {
          backgroundColor: '$bgAccent',
        },
      },
    },
    {
      displayType: 'GRID',
      tokenType: TokenTypes.COLOR,
      css: {
        borderRadius: '$full',
        backgroundColor: 'transparent',
        '&:hover, &:focus': {
          outline: 'none',
          boxShadow: '$tokenFocus',
          backgroundColor: 'transparent',
        },
        [`& ${StyledTokenButtonText}`]: {
          padding: 0,
        },
      },
    },
  ],
});
