import { styled } from '@/stitches.config';
import Box from '../Box';

export const StyledThemeLabel = styled(Box, {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  variants: {
    ignored: {
      true: {
        color: '$textDisabled',
      },
    },
    variant: {
      folder: {
        color: '$textMuted',
        fontWeight: '$bold',
      },
      leaf: {},
    },
  },
});
