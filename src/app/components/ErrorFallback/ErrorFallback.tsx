import React from 'react';
import Heading from '../Heading';
import Stack from '../Stack';
import Text from '../Text';

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <Stack direction="column" align="center" gap={4} justify="center" css={{ height: '100%', textAlign: 'center' }}>
      <Heading>Something went wrong!</Heading>
      <Stack direction="column" gap={2}>
        <Text size="xsmall" muted>{error.message}</Text>
        <Text size="xsmall" muted>Restart the plugin and try again.</Text>
      </Stack>
    </Stack>
  );
}
