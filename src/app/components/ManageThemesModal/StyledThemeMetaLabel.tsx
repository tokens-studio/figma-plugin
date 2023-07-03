import { styled } from '@/stitches.config';
import Box from '../Box';

export const StyledThemeMetaLabel = styled(Box, {
  fontSize: '$small',
  color: '$textMuted',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});
