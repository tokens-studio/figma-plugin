import { Stack } from '@tokens-studio/ui';
import React from 'react';

export const WebSocket = () => {
  const messages = [1, 2, 3, 4, 5];

  return (
    <Stack
      direction="column"
      gap={4}
      align="center"
      css={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        padding: '$4',
        overflow: 'hidden',
      }}
    >
      {messages.map((message) => (
        <Stack
          key={`message-${message}`}
          direction="row"
          align="center"
          css={{
            width: '60%',
            height: '24px',
            background: '$accentBg',
            padding: '$2',
            borderRadius: '$small',
          }}
        >
          Message
          {' '}
          {message}
        </Stack>
      ))}
    </Stack>
  );
};
