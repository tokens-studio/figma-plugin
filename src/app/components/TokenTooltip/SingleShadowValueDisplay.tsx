import React from 'react';
import Box from '../Box';
import Stack from '../Stack';
import { TokenBoxshadowValue } from '@/types/values';
import TooltipProperty from './TooltipProperty';

type Props = {
  value: TokenBoxshadowValue
  rawValue: TokenBoxshadowValue | null
};

export const SingleShadowValueDisplay: React.FC<Props> = ({ value, rawValue }) => (
  <Box>
    <Box css={{ display: 'flex', color: '$fgToolTip' }}>{value.type}</Box>
    <Stack direction="row" align="start" gap={2} wrap>
      <TooltipProperty value={value.x} rawValue={rawValue?.x} />
      <TooltipProperty value={value.y} rawValue={rawValue?.y} />
      <TooltipProperty value={value.blur} rawValue={rawValue?.blur} />
      <TooltipProperty value={value.spread} rawValue={rawValue?.spread} />
      <TooltipProperty value={value.color} rawValue={rawValue?.color} />
    </Stack>
  </Box>
);
