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
    borderColor: '$borderBtnDisabled',
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
      },
      secondary: {
        background: '$bgBtnSecondary',
        color: '$fgBtnSecondary',
        borderColor: '$border',
      },
      ghost: {
        background: 'transparent',
        padding: '$2 $3',
        color: '$fgBtnGhost',
        '&:hover': {
          background: '$bgHoverBtnGhost',
        },
      },
    },
  },
});
