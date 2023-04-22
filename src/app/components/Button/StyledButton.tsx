import { styled } from '@/stitches.config';

export const StyledButton = styled('button', {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: '$button',
  fontWeight: '$bold',
  fontSize: '$xsmall',
  padding: '$3',
  background: '$bgBtnPrimary',
  color: '$fgBtnPrimary',
  '&:disabled': {
    opacity: 0.5,
  },
  variants: {
    size: {
      small: {},
      large: {
        padding: '$4 $5',
      },
    },
    variant: {
      primary: {
        '&:focus-visible': {
          boxShadow: '$focus',
        },
      },
      secondary: {
        background: '$bgBtnSecondary',
        color: '$fgBtnSecondary',
        borderColor: '$border',
        '&:focus-visible': {
          boxShadow: '$focus',
        },
      },
      ghost: {
        background: 'transparent',
        padding: '$2 $3',
        color: '$fgBtnGhost',
        '&:hover': {
          background: '$bgHoverBtnGhost',
        },
        '&:focus-visible': {
          boxShadow: '$focus',
        },
      },
      danger: {
        background: '$bgBtnSecondary',
        color: '$fgDanger',
        borderColor: '$border',
        '&:focus-visible': {
          boxShadow: '$focusDanger',
        },
      },
    },
  },
});
