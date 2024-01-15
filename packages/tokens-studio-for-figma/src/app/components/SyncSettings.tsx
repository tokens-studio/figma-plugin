/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu, Heading, Button, Box, Stack,
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
import { tokenFormatSelector } from '@/selectors/tokenFormatSelector';

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
    },
  ], [t]);

  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();
  const tokenFormat = useSelector(tokenFormatSelector);

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
          <Heading size="medium">{t('syncProviders')}</Heading>
          format:
          {' '}
          {tokenFormat}
          {apiProviders.length > 0 && (
            <Stack direction="column" gap={2} width="full" align="start">
              <LocalStorageItem />
              {apiProviders.map((item) => (
                <StorageItem
                  key={item?.internalId || `${item.provider}-${item.id}`}
                  onEdit={handleEditClick(item)}
                  item={item}
                />
              ))}
            </Stack>
          )}
          <DropdownMenu>
            <DropdownMenu.Trigger asChild data-testid="add-storage-item-dropdown">
              <Button asDropdown>
                {t('addNewSyncProvider')}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              side="bottom"
            >
              {
                providers.map((provider) => (
                  <DropdownMenu.Item key={provider.type} onSelect={handleProviderClick(provider.type)} css={{ display: 'flex', gap: '$3' }} data-testid={`add-${provider.text}-credential`}>
                    <Box css={{ color: '$fgSubtle' }}>{getProviderIcon(provider.type)}</Box>
                    {provider.text}
                  </DropdownMenu.Item>
                ))
              }
            </DropdownMenu.Content>
          </DropdownMenu>
        </Stack>
      </Box>
    </Box>
  );
};

export default SyncSettings;