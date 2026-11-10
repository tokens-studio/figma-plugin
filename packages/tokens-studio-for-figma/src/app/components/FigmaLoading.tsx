import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Spinner, Stack } from '@tokens-studio/ui';
import pjs from '../../../package.json';
import { LaunchScreenLayout, LaunchScreenTextButton } from './LaunchScreen/LaunchScreenLayout';

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
      <Box>
        {children}
      </Box>
    );
  }

  return (
    <LaunchScreenLayout data-testid="figmaloading" className="content scroll-container">
      <Stack direction="column" gap={5} align="center">
        <Box css={{ color: '$loadingScreenFgMuted' }}>
          {t('version')}
          {' '}
          {pjs.version}
        </Box>
        <Stack direction="row" gap={3} justify="center" align="center">
          <Spinner onAccent />
          {label ?? t('loadingWait')}
        </Stack>
        <LaunchScreenTextButton type="button" underline onClick={onCancel}>{t('cancel')}</LaunchScreenTextButton>
      </Stack>
    </LaunchScreenLayout>
  );
}
