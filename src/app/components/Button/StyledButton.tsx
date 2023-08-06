import { styled } from '@/stitches.config';

export const StyledButton = styled('button', {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: '$small',
  fontWeight: '$bold',
  fontSize: '$xsmall',
  padding: '$3',
  background: '$btnPrimaryBg',
  color: '$btnPrimaryFg',
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
        background: '$btnSecondaryBg',
        color: '$fgDefault',
        borderColor: '$borderDefault',
        '&:focus-visible': {
          boxShadow: '$focus',
        },
      },
      ghost: {
        background: 'transparent',
        padding: '$2 $3',
        color: '$fgDefault',
        '&:focus-visible': {
          boxShadow: '$focus',
        },
      },
      danger: {
        background: '$btnSecondaryBg',
        color: '$dangerFg',
        borderColor: '$borderDefault',
        '&:focus-visible': {
          boxShadow: '$focusDanger',
        },
      },
    },
  },
});
