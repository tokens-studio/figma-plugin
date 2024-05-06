import React from 'react';
import { Heading } from '@tokens-studio/ui';
import Stack from '../Stack';
import Text from '../Text';

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <Stack direction="column" align="center" gap={4} justify="center" css={{ padding: '$4', height: '100%', textAlign: 'center' }}>
      <Heading>An unexpected error has occured</Heading>
      <Stack direction="column" gap={3}>
        <Text size="xsmall" muted>{error.message}</Text>
      </Stack>
    </Stack>
  );
}
