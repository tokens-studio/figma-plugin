/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import Heading from './Heading';
import ConfirmLocalStorageModal from './modals/ConfirmLocalStorageModal';
import StorageItem from './StorageItem';
import EditStorageItemModal from './modals/EditStorageItemModal';
import CreateStorageItemModal from './modals/CreateStorageItemModal';
import useStorage from '../store/useStorage';
import { Dispatch } from '../store';
import { apiProvidersSelector, localApiStateSelector, storageTypeSelector } from '@/selectors';
import Stack from './Stack';
import Box from './Box';
import Text from './Text';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useRemoteTokens from '../store/remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import IconToggleableDisclosure from './IconToggleableDisclosure';
import LocalStorageItem from './LocalStorageItem';
import { getProviderIcon } from '@/utils/getProviderIcon';

const providers = [
  {
    text: 'URL',
    type: StorageProviderType.URL,
  },
  {
    text: 'JSONBIN',
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
    text: 'Generic Versioned',
    type: StorageProviderType.GENERIC_VERSIONED_STORAGE,
  },
];

const SyncSettings = () => {
  const localApiState = useSelector(localApiStateSelector);
  const storageType = useSelector(storageTypeSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();

  const { setStorageType } = useStorage();
  const { fetchBranches } = useRemoteTokens();

  const [confirmModalVisible, showConfirmModal] = React.useState(false);
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
    (provider) => () => {
      track('Edit Credentials');
      dispatch.uiState.setLocalApiState(provider);
      setShowEditStorageModalVisible(true);
      setLocalBranches(provider);
    },
    [dispatch.uiState, setLocalBranches],
  );

  const handleSetLocalStorage = React.useCallback(() => {
    if (storageType?.provider !== StorageProviderType.LOCAL) {
      showConfirmModal(true);
    }
  }, [storageType?.provider]);

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

  const handleSubmitLocalStorage = React.useCallback(() => {
    dispatch.uiState.setLocalApiState({ provider: StorageProviderType.LOCAL });
    setStorageProvider(StorageProviderType.LOCAL);
    setStorageType({
      provider: { provider: StorageProviderType.LOCAL },
      shouldSetInDocument: true,
    });
    dispatch.tokenState.setEditProhibited(false);
    showConfirmModal(false);
  }, [dispatch.tokenState, dispatch.uiState, setStorageType]);

  const handleHideStorageModal = React.useCallback(() => {
    setShowEditStorageModalVisible(false);
  }, []);

  const handleHideAddCredentials = React.useCallback(() => {
    setShowCreateStorageModalVisible(false);
  }, []);

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {confirmModalVisible && (
        <ConfirmLocalStorageModal
          isOpen={confirmModalVisible}
          onToggle={showConfirmModal}
          onSuccess={handleSubmitLocalStorage}
        />
      )}
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
          <Stack gap={3} direction="column">
            <Heading size="small">Sync providers</Heading>
          </Stack>
          {apiProviders.length > 0 && (
            <Stack direction="column" gap={2} width="full" align="start">
              <LocalStorageItem onClick={handleSetLocalStorage} isActive={storageType.provider === StorageProviderType.LOCAL} />
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
            <DropdownMenuTrigger css={{ border: '1px solid $borderMuted' }} data-testid="add-storage-item-dropdown">
              <Text size="small">Add new</Text>
              <IconToggleableDisclosure />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
            >
              {
                providers.map((provider) => (
                  <DropdownMenuItem key={provider.type} onSelect={handleProviderClick(provider.type)} css={{ display: 'flex', gap: '$3' }} data-testid={`add-${provider.text}-credential`}>
                    <Box css={{ color: '$contextMenuForeground' }}>{getProviderIcon(provider.type)}</Box>
                    {provider.text}
                  </DropdownMenuItem>
                ))
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </Stack>
      </Box>
    </Box>
  );
};

export default SyncSettings;
