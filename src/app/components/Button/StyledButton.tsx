import { styled } from '@/stitches.config';

export const StyledButton = styled('button', {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: '$small',
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
        borderColor: '$borderDefault',
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
        color: '$dangerFg',
        borderColor: '$borderDefault',
        '&:focus-visible': {
          boxShadow: '$focusDanger',
        },
      },
    },
  },
});
