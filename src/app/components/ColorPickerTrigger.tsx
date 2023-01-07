import React from 'react';
import Box from './Box';

export default function ColorPickerTrigger({
  onClick, background,
}: { onClick?: () => void, background: string | undefined }) {
  return (
    <Box
      css={{
        width: '$5', height: '$5', borderRadius: '$2', background, border: '1px solid $borderMuted', cursor: 'pointer',
      }}
      onClick={onClick}
    />
  );
}
