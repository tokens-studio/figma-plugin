import { styled } from '@/stitches.config';

export const StyledFolderButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 1,
  zIndex: 1,
  '&:focus': {
    boxShadow: 'none',
  },
  variants: {
    size: {
      small: {
        padding: 0,
        fontSize: '$xsmall',
        gap: '$1',
      },
      default: {
        padding: '$2',
        gap: '$3',
      },
    },
  },
});
