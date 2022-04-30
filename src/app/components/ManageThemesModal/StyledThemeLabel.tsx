import { styled } from '@/stitches.config';
import Box from '../Box';

export const StyledThemeLabel = styled(Box, {
  padding: '$2 $3',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  userSelect: 'none',
  fontSize: '$small',
  variants: {
    variant: {
      folder: {
        color: '$textMuted',
        fontWeight: '$normal',
      },
      leaf: {},
    },
  },
});
