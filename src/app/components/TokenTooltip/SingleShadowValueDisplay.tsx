import React from 'react';
import Box from '../Box';
import Stack from '../Stack';
import { TokenBoxshadowValue } from '@/types/values';
import TooltipProperty from './TooltipProperty';

type Props = {
  value?: TokenBoxshadowValue;
  resolvedValue?: TokenBoxshadowValue | null;
};

export const SingleShadowValueDisplay: React.FC<Props> = ({ value, resolvedValue }) => (
  <Box>
    <Box css={{ display: 'flex', color: '$fgToolTip' }}>{resolvedValue?.type}</Box>
    <Stack direction="row" align="start" gap={2} wrap>
      <TooltipProperty value={value?.x} resolvedValue={resolvedValue?.x} />
      <TooltipProperty value={value?.y} resolvedValue={resolvedValue?.y} />
      <TooltipProperty value={value?.blur} resolvedValue={resolvedValue?.blur} />
      <TooltipProperty value={value?.spread} resolvedValue={resolvedValue?.spread} />
      <TooltipProperty value={value?.color} resolvedValue={resolvedValue?.color} />
    </Stack>
  </Box>
);
