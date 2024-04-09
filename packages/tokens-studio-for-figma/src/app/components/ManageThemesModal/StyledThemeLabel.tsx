import { styled } from '@/stitches.config';
import Box from '../Box';

export const StyledThemeLabel = styled(Box, {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  height: '1em',
  userSelect: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  variants: {
    ignored: {
      true: {
        color: '$fgSubtle',
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
