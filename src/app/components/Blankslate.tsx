import React from 'react';
import Box from './Box';
import Heading from './Heading';
import Text from './Text';

export default function Blankslate({ title, text }: { title: string; text: string }) {
  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '$2', alignItems: 'center', justifyContent: 'center',
    }}
    >
      <Heading>{title}</Heading>
      <Text muted size="small">{text}</Text>
    </Box>
  );
}
