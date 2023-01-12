import React from 'react';
import Box from './Box';

export function Count({ count }: { count: number; }) {
  return (
    <Box
      css={{
        backgroundColor: '$bgSubtle',
        color: '$textMuted',
        borderRadius: '$full',
        padding: '$2 $3',
      }}
    >
      {count}

    </Box>
  );
}
