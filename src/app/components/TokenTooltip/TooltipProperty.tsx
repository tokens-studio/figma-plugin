import React from 'react';
import Box from '../Box';
import Stack from '../Stack';
import { StyledAliasBadge } from './StyledAliasBadge';

type Props = {
  label?: string,
  value?: string | number,
  rawValue?: string | number | null,
};

export default function TooltipProperty({ label, value, rawValue }: Props) {
  return value ? (
    <Stack direction="row" align="center" gap={3}>
      {label && <Box css={{ color: '$fgToolTip' }}>{label}</Box>}
      <Box css={{ color: '$fgToolTipMuted' }}>{value}</Box>
      {rawValue && String(rawValue) !== String(value) && <StyledAliasBadge>{rawValue}</StyledAliasBadge>}
    </Stack>
  ) : null;
}
