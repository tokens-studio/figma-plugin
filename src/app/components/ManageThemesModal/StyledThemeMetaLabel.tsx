import { styled } from '@/stitches.config';
import Box from '../Box';

export const StyledThemeMetaLabel = styled(Box, {
  fontSize: '$small',
  color: '$fgMuted',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});
