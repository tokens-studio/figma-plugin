import React from 'react';
import { isEqual } from '@/utils/isEqual';
import Box from '../Box';
import Stack from '../Stack';
import AliasBadge from './AliasBadge';

type Props = {
  label?: string;
  value?: string | number;
  resolvedValue?: string | number | null;
};

export default function TooltipProperty({ label, value, resolvedValue }: Props) {
  return typeof value !== 'undefined' || typeof resolvedValue !== 'undefined' ? (
    <Stack
      direction="row"
      align="center"
      css={{
        borderRadius: '$badge',
        backgroundColor: '$bgOnDarkSubtle',
        overflow: 'hidden',
        display: 'inline-flex',
      }}
    >
      {(label || typeof value !== 'undefined') && (
        <Stack direction="row" align="center" gap={2} css={{ padding: '$1 $2', color: '$fgToolTip' }}>
          {label}
          {typeof value !== 'undefined' && (
            <Box css={{ color: '$fgToolTipMuted', flexShrink: 1, wordBreak: 'break-word' }}>
              {value}
            </Box>
          )}
        </Stack>
      )}
      {typeof resolvedValue !== 'undefined' && !isEqual(String(resolvedValue), String(value)) ? <AliasBadge value={resolvedValue} /> : null}
    </Stack>
  ) : null;
}
