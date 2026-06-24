import React from 'react';
import { Tooltip } from '@tokens-studio/ui';
import { DeprecatedProperty } from '@/types/tokens/SingleGenericToken';
import Box from './Box';

type Props = {
  deprecated?: DeprecatedProperty;
};

export default function DeprecatedBadge({ deprecated }: Props) {
  if (!deprecated) return null;

  const isError = deprecated.severity === 'error';
  const bgColor = isError ? '$bgDanger' : '$bgWarning';
  const textColor = isError ? '#D32F2F' : '#F57F17';

  return (
    <Tooltip label={deprecated.message || 'This token is deprecated'} side="top">
      <Box
        css={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '$1',
          padding: '$1 $2',
          fontSize: '$xxs',
          fontWeight: '600',
          borderRadius: '$small',
          backgroundColor: bgColor,
          color: textColor,
          cursor: 'help',
        }}
      >
        <span>{isError ? '🔴' : '🟡'}</span>
        <span>Deprecated</span>
      </Box>
    </Tooltip>
  );
}
