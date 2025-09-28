import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner, Stack } from '@tokens-studio/ui';
import TokensStudioIcon from '@/icons/tokensstudio.svg';
import TokensStudioWord from '@/icons/tokensstudio-word.svg';
import pjs from '../../../package.json';
import { styled } from '@/stitches.config';

const StyledLoadingScreen = styled(Stack, {
  background: '$loadingScreenBg',
  height: '100vh',
  color: '$loadingScreenFg',
});

const StyledTokensStudioIcon = styled(TokensStudioIcon, {
  width: '150px',
  height: '125px',
});

const StyledTokensStudioWord = styled(TokensStudioWord, {
  width: '200px',
  height: '25px',
});

const StyledLoadingButton = styled('button', {
  textDecoration: 'underline',
  color: '$loadingScreenFgMuted',
  '&:hover, &:focus': {
    color: '$loadingScreenFg',
  },
});

type Props = PropsWithChildren<{
  isLoading?: boolean
  label?: string
  onCancel?: () => void
}>;

export default function FigmaLoading({
  isLoading, label, onCancel, children,
}: Props) {
  const { t } = useTranslation(['startScreen']);

  if (!isLoading) {
    return (
      <div>
        {children}
      </div>
    );
  }

  return (
    <StyledLoadingScreen data-testid="figmaloading" justify="center" direction="column" gap={4} className="content scroll-container">
      <Stack direction="column" gap={4} align="center">
        <Stack direction="column" gap={4} align="center">
          <StyledTokensStudioIcon />
          <StyledTokensStudioWord />
        </Stack>
        <Stack direction="column" gap={4} align="center" css={{ color: '$loadingScreenFgMuted' }}>
          {t('version')}
          {' '}
          {pjs.version}
        </Stack>
        <Stack direction="row" gap={4} justify="center" align="center">
          <Spinner onAccent />
          <Stack direction="column" gap={4} justify="center" align="center">
            {label ?? t('loadingWait')}
          </Stack>
        </Stack>
        <Stack direction="row" gap={4}>
          <StyledLoadingButton type="button" onClick={onCancel}>{t('cancel')}</StyledLoadingButton>
        </Stack>
      </Stack>
    </StyledLoadingScreen>
  );
}
