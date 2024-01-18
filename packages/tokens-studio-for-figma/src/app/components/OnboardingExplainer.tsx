import React from 'react';
import { InfoCircledIcon, Cross1Icon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import {
  Link, IconButton, Heading, Box, Stack,
} from '@tokens-studio/ui';
import { styled } from '@/stitches.config';

const StyledInfoIconButton = styled(InfoCircledIcon, {
  color: '$accentDefault',
});

const StyledTextPlan = styled('p', {
  fontWeight: '$sansRegular',
  color: '$fgDefault',
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
  const { t } = useTranslation(['general']);
  return (
    <Box css={data.title === 'Sets' ? {
      display: 'flex', flexDirection: 'column', gap: '$2', padding: '$4', borderTop: '1px solid $borderMuted', borderBottom: '1px solid $borderMuted',
    } : {
      display: 'flex', flexDirection: 'column', gap: '$2', padding: '$4', border: '1px solid $borderSubtle', borderRadius: '$medium',
    }}
    >
      <Stack direction="row" gap={2} justify="between">
        <Stack direction="row" justify="between" gap={2} align="center">
          <StyledInfoIconButton />
          <Heading size="small">{data.title}</Heading>
        </Stack>
        <IconButton variant="invisible" size="small" data-testid="closeButton" onClick={closeOnboarding} icon={<Cross1Icon />} />
      </Stack>
      <StyledTextPlan>
        {data.text}
      </StyledTextPlan>
      <Link href={data.url} target="_blank" rel="noreferrer">
        {t('readMore')}
      </Link>
    </Box>
  );
}
