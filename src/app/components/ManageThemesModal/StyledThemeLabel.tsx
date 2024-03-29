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
        color: '$fgDisabled',
      },
    },
    variant: {
      folder: {
        color: '$fgMuted',
        fontWeight: '$bold',
      },
      leaf: {},
    },
  },
});
