import React from 'react';
import { InfoCircledIcon, Cross1Icon } from '@radix-ui/react-icons';
import Box from './Box';
import Heading from './Heading';
import Stack from './Stack';
import IconButton from './IconButton';

type Props = {
  data: {
    title: string,
    text: string,
    url: string,
  };
  closeOnboarding: () => void;
};

export default function OnboardingExplainer({ data, closeOnboarding }: Props) {
  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', gap: '$2', padding: '$4', border: '1px solid $borderMuted', borderTop: '1px solid $borderMuted',
    }}
    >
      <Stack direction="row" gap={2} justify="between">
        <Stack direction="row" justify="between" gap={2} align="center">
          <InfoCircledIcon className="text-primary-500" />
          <Heading size="medium">{data.title}</Heading>
        </Stack>
        <IconButton dataCy="closeButton" onClick={closeOnboarding} icon={<Cross1Icon />} />
      </Stack>
      {data.text.split('\n').map((text) => (
        <p className="text-xs">
          {text}
          <br />
        </p>
      ))}
      <a
        target="_blank"
        rel="noreferrer"
        href={data.url}
        className="inline-flex text-xs text-primary-500"
      >
        Read more
      </a>
    </Box>
  );
}
