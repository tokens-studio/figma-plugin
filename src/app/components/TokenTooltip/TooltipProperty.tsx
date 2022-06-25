import React from 'react';
import { isEqual } from '@/utils/isEqual';
import Box from '../Box';
import Stack from '../Stack';
import AliasBadge from './AliasBadge';

type Props = {
  label?: string;
  value?: string | number;
  rawValue?: string | number | null;
};

export default function TooltipProperty({ label, value, rawValue }: Props) {
  return value ? (
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
      <Stack
        direction="row"
        align="center"
        gap={2}
        css={{ padding: '$1 $2', display: 'flex', alignItems: 'center' }}
      >
        {label && (
        <Box css={{ color: '$fgToolTip' }}>
          {label}
        </Box>
        )}
        <Box css={{ color: '$fgToolTipMuted' }}>
          {value}
        </Box>
      </Stack>
      {rawValue && !isEqual(String(rawValue), String(value)) ? <AliasBadge value={rawValue} /> : null}
    </Stack>
  ) : null;
}
