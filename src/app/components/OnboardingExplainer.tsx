import React from 'react';
import { InfoCircledIcon, Cross1Icon } from '@radix-ui/react-icons';
import { styled } from '@/stitches.config';
import Box from './Box';
import Heading from './Heading';
import Stack from './Stack';
import IconButton from './IconButton';

const StyledInfoIconButton = styled(InfoCircledIcon, {
  color: '$interaction',
});

const StyledTextPlan = styled('p', {
  fontWeight: '$normal',
  color: '$text',
  fontSize: '$xsmall',
});

const StyledReadMoreLink = styled('a', {
  color: '$interaction',
  fontSize: '$xsmall',
});

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
          <StyledInfoIconButton />
          <Heading size="small">{data.title}</Heading>
        </Stack>
        <IconButton dataCy="closeButton" onClick={closeOnboarding} icon={<Cross1Icon />} />
      </Stack>
      {data.text.split('\n').map((text) => (
        <StyledTextPlan>
          {text}
        </StyledTextPlan>
      ))}
      <StyledReadMoreLink href={data.url} target="_blank" rel="noreferrer">
        Read more
      </StyledReadMoreLink>
    </Box>
  );
}
