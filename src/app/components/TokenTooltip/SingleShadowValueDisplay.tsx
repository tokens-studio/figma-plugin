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
    <Stack direction="column" gap={1}>
      <TooltipProperty label="x" value={value.x} rawValue={rawValue?.x} />
      <TooltipProperty label="y" value={value.y} rawValue={rawValue?.y} />
      <TooltipProperty label="Blur" value={value.blur} rawValue={rawValue?.blur} />
      <TooltipProperty label="Spread" value={value.spread} rawValue={rawValue?.spread} />
      <TooltipProperty label="Color" value={value.color} rawValue={rawValue?.color} />
    </Stack>
  </Box>
);
