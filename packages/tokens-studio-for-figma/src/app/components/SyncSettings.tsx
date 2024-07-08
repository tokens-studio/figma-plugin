/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Heading, Button, Box, Stack, Text, Dialog,
} from '@tokens-studio/ui';
import { track } from '@/utils/analytics';
import StorageItem from './StorageItem';
import EditStorageItemModal from './modals/EditStorageItemModal';
import CreateStorageItemModal from './modals/CreateStorageItemModal';
import { Dispatch } from '../store';
import { apiProvidersSelector, localApiStateSelector, storageTypeSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useRemoteTokens from '../store/remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import LocalStorageItem from './LocalStorageItem';
import { getProviderIcon } from '@/utils/getProviderIcon';
import { StyledBetaBadge } from './SecondScreen';

const SyncSettings = () => {
  const localApiState = useSelector(localApiStateSelector);

  const { t } = useTranslation(['storage']);

  const providers = useMemo(() => [
    {
      text: t('providers.url.title'),
      type: StorageProviderType.URL,
    },
    {
      text: t('providers.jsonbin.title'),
      type: StorageProviderType.JSONBIN,
    },
    {
      text: 'GitHub',
      type: StorageProviderType.GITHUB,
    },
    {
      text: 'GitLab',
      type: StorageProviderType.GITLAB,
    },
    {
      text: 'Azure DevOps',
      type: StorageProviderType.ADO,
    },
    {
      text: 'BitBucket',
      type: StorageProviderType.BITBUCKET,
      beta: true,
    },
    {
      text: 'Supernova',
      type: StorageProviderType.SUPERNOVA,
    },
    {
      text: t('providers.generic.title'),
      type: StorageProviderType.GENERIC_VERSIONED_STORAGE,
    },
    {
      text: 'Tokens Studio',
      type: StorageProviderType.TOKENS_STUDIO,
      beta: true,
    },
    {
      text: 'WebSocket',
      type: StorageProviderType.WEB_SOCKET,
      beta: true,
    },
  ], [t]);

  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();

  const [open, setOpen] = React.useState(false);

  const { fetchBranches } = useRemoteTokens();

  const [editStorageItemModalVisible, setShowEditStorageModalVisible] = React.useState(Boolean(localApiState.new));
  const [createStorageItemModalVisible, setShowCreateStorageModalVisible] = React.useState(false);
  const [storageProvider, setStorageProvider] = React.useState(localApiState.provider);

  const setLocalBranches = React.useCallback(
    async (provider: StorageTypeCredentials) => {
      const branches = await fetchBranches(provider);
      if (branches) {
        dispatch.branchState.setBranches(branches);
      }
    },
    [dispatch.branchState, fetchBranches],
  );

  const handleEditClick = React.useCallback(
    (provider: any) => () => {
      track('Edit Credentials');
      dispatch.uiState.setLocalApiState(provider);
      setShowEditStorageModalVisible(true);
      setLocalBranches(provider);
    },
    [dispatch.uiState, setLocalBranches],
  );

  const handleShowAddCredentials = React.useCallback((provider: StorageProviderType) => {
    track('Add Credentials', { provider });
    setShowCreateStorageModalVisible(true);
  }, []);

  const handleProviderClick = React.useCallback(
    (provider: StorageProviderType) => () => {
      setOpen(false);
      setStorageProvider(provider);
      handleShowAddCredentials(provider);
    },
    [handleShowAddCredentials],
  );

  const handleHideStorageModal = React.useCallback(() => {
    setShowEditStorageModalVisible(false);
  }, []);

  const handleHideAddCredentials = React.useCallback(() => {
    setShowCreateStorageModalVisible(false);
  }, []);

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {editStorageItemModalVisible && (
        <EditStorageItemModal
          isOpen={editStorageItemModalVisible}
          onClose={handleHideStorageModal}
          initialValue={localApiState}
          onSuccess={handleHideStorageModal}
        />
      )}
      {createStorageItemModalVisible && (
        <CreateStorageItemModal
          isOpen={createStorageItemModalVisible}
          onClose={handleHideAddCredentials}
          onSuccess={handleHideAddCredentials}
          storageProvider={storageProvider}
        />
      )}
      <Box css={{ padding: '0 $4' }}>
        <Stack gap={4} direction="column" align="start">
          <Stack direction="row" justify="between" align="center" css={{ width: '100%' }}>
            <Heading size="medium">{t('syncProviders')}</Heading>
            <Dialog modal open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <Button variant="secondary" size="small" data-testid="add-storage-item-button">
                  {t('addNewSyncProvider')}
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content className="content scroll-container">
                  <Heading>{t('addNewSyncProvider')}</Heading>

                  <Stack direction="column" gap={4}>
                    {
                    providers.map((provider) => (
                      <Stack direction="row" justify="between" align="center" key={provider.text}>
                        <Stack direction="column">
                          <Box css={{
                            color: '$fgDefault', display: 'inline-flex', gap: '$2', alignItems: 'center',
                          }}
                          >
                            <Box css={{ color: '$fgSubtle' }}>{getProviderIcon(provider.type)}</Box>
                            {provider.text}
                            {provider.beta && <StyledBetaBadge>BETA</StyledBetaBadge>}
                          </Box>
                        </Stack>
                        <Button
                          key={provider.type}
                          onClick={handleProviderClick(provider.type)}
                          variant="secondary"
                          size="small"
                          data-testid={`add-${provider.text}-credential`}
                        >
                          {t('choose')}
                        </Button>
                      </Stack>
                    ))
                  }
                  </Stack>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          </Stack>
          <Stack direction="column" gap={2} width="full" align="start">
            <LocalStorageItem />
            {apiProviders.length > 0 && apiProviders.map((item) => (
              <StorageItem
                key={item?.internalId || `${item.provider}-${item.id}`}
                onEdit={handleEditClick(item)}
                item={item}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SyncSettings;
