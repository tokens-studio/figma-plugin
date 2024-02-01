import { Box } from '@tokens-studio/ui';
import { styled } from '@stitches/react';

export const ExportThemeRow = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'min-content 1fr 1fr min-content',
  columnGap: '$3',
  alignItems: 'center',
});
