import React from 'react';
import { TokenBorderValue } from '@/types/values';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';

type Props = {
  value: TokenBorderValue;
  resolvedValue: TokenBorderValue;
};

export const SingleBorderValueDisplay: React.FC<Props> = ({ value, resolvedValue }) => (
  <Stack direction="column" align="start" gap={1}>
    <TooltipProperty label="Color" value={value.color} resolvedValue={resolvedValue?.color} />
    <TooltipProperty label="Width" value={value.width} resolvedValue={resolvedValue?.width} />
    <TooltipProperty label="Style" value={value.style} resolvedValue={resolvedValue?.style} />
  </Stack>
);
