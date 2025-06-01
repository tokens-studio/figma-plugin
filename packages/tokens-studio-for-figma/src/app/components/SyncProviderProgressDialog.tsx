import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Spinner, Stack, Text,
} from '@tokens-studio/ui';
import Modal from './Modal';
import { useSyncProviderProgressDialog } from '../hooks/useSyncProviderProgressDialog';

export const SyncProviderProgressDialog: React.FC = () => {
  const { t } = useTranslation(['storage']);
  const { showSyncProviderDialog, hideDialog } = useSyncProviderProgressDialog();
  const syncProviderName = useSelector((state: any) => state.uiState.syncProviderName);

  const isOpen = showSyncProviderDialog !== false;

  const handleClose = React.useCallback(() => {
    hideDialog();
  }, [hideDialog]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title={showSyncProviderDialog === 'loading' ? t('settingUpProvider') : t('providerSetupComplete')}
      isOpen={isOpen}
      close={showSyncProviderDialog === 'success' ? handleClose : undefined}
      showClose={showSyncProviderDialog === 'success'}
    >
      <Stack direction="column" gap={4} align="center">
        {showSyncProviderDialog === 'loading' ? (
          <>
            <Spinner />
            <Stack direction="column" gap={2} align="center">
              <Heading size="small">{t('connectingToProvider', { provider: syncProviderName })}</Heading>
              <Text muted>{t('validatingCredentials')}</Text>
            </Stack>
          </>
        ) : (
          <>
            <Stack direction="column" gap={2} align="center">
              <Heading size="small">{t('allDone')}</Heading>
              <Text muted>{t('providerConnectedSuccessfully', { provider: syncProviderName })}</Text>
            </Stack>
            <Button variant="primary" onClick={handleClose}>
              {t('close')}
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
};