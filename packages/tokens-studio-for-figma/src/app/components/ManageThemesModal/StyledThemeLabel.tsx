import { Box } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';

export const StyledThemeLabel = styled(Box, {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  display: 'block',
  alignItems: 'center',
  gap: '$2',
  variants: {
    ignored: {
      true: {
        color: '$fgMuted',
      },
    },
    variant: {
      folder: {
        color: '$fgMuted',
        fontWeight: '$sansBold',
      },
      leaf: {},
    },
  },
});
