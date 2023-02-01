import React from 'react';
import { styled } from '@/stitches.config';
import Heading from '../Heading';
import Stack from '../Stack';
import Text from '../Text';

const StyledLink = styled('a', {
  color: '$interaction',
  textDecoration: 'underline',
});

export function ErrorFallback({ error }: { error: Error }) {
  return (
    <Stack direction="column" align="center" gap={4} justify="center" css={{ padding: '$4', height: '100%', textAlign: 'center' }}>
      <Heading>Something went wrong!</Heading>
      <Stack direction="column" gap={3}>
        <Text size="xsmall" muted>{error.message}</Text>
        <Text size="xsmall" muted>Restart the plugin and try again.</Text>
        <Text size="xsmall" muted>
          If this keeps happening, you need to reset your tokens.
          {' '}
          <StyledLink href="https://docs.tokens.studio/reset-tokens" target="_blank" rel="noreferrer">Read how</StyledLink>
        </Text>

      </Stack>
    </Stack>
  );
}
