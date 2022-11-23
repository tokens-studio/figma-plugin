/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import Button from './Button';
import Heading from './Heading';
import ConfirmLocalStorageModal from './modals/ConfirmLocalStorageModal';
import StorageItem from './StorageItem';
import ProviderSelector from './StorageProviderSelector';
import EditStorageItemModal from './modals/EditStorageItemModal';
import CreateStorageItemModal from './modals/CreateStorageItemModal';
import useStorage from '../store/useStorage';
import { Dispatch } from '../store';
import { apiProvidersSelector, localApiStateSelector, storageTypeSelector } from '@/selectors';
import Stack from './Stack';
import Box from './Box';
import Text from './Text';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useRemoteTokens from '../store/remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import { useFlags } from './LaunchDarkly';

const SyncSettings = () => {
  const localApiState = useSelector(localApiStateSelector);
  const storageType = useSelector(storageTypeSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();

  const { setStorageType } = useStorage();
  const { fetchBranches } = useRemoteTokens();
  const { bitBucketSync } = useFlags();

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

  const handleProviderClick = React.useCallback(
    (provider: StorageProviderType) => () => {
      setStorageProvider(provider);
    },
    [],
  );

  const selectedRemoteProvider = React.useMemo(
    () => [
      StorageProviderType.JSONBIN,
      StorageProviderType.GITHUB,
      StorageProviderType.GITLAB,
      StorageProviderType.ADO,
      StorageProviderType.URL,
      StorageProviderType.BITBUCKET,
    ].includes(storageProvider as StorageProviderType),
    [storageProvider],
  );

  const storedApiProviders = () => apiProviders.filter((item) => item.provider === storageProvider);

  const storageProviderText = () => {
    switch (storageProvider) {
      case StorageProviderType.JSONBIN:
        return (
          <div>
            Create an account at
            {' '}
            <a href="https://jsonbin.io/" target="_blank" rel="noreferrer" className="underline">
              JSONbin.io
            </a>
            , copy the Secret Key into the field, and click on save. If you or your team already have a version stored,
            add the secret and the corresponding ID.
            {' '}
            <a href="https://docs.tokens.studio/sync/jsonbin" target="_blank" rel="noreferrer" className="underline">
              Read more on docs.tokens.studio
            </a>
          </div>
        );
      case StorageProviderType.GITHUB:
        return (
          <div>
            Sync your tokens with a GitHub repository so your design decisions are up to date with code.
            {' '}
            <a href="https://docs.tokens.studio/sync/github" target="_blank" rel="noreferrer" className="underline">
              Read the guide
            </a>
            .
          </div>
        );
      case StorageProviderType.GITLAB:
        return (
          <div>
            Sync your tokens with a Gitlab repository so your design decisions are up to date with code.
            {' '}
            <a href="https://docs.tokens.studio/sync/gitlab" target="_blank" rel="noreferrer" className="underline">
              Read the guide
            </a>
            .
          </div>
        );
      case StorageProviderType.BITBUCKET:
        return bitBucketSync ? (
          <div>
            Sync your tokens with a Bitbucket repository so your design decisions are up to date with code.
            {' '}
            <a href="https://docs.tokens.studio/sync/bitbucket" target="_blank" rel="noreferrer" className="underline">
              Read the guide
            </a>
            .
          </div>
        ) : null;
      case StorageProviderType.ADO:
        return (
          <div>
            Sync your tokens with a Azure DevOps repository so your design decisions are up to date with code.
            {' '}
            <a href="https://docs.tokens.studio/sync/ado" target="_blank" rel="noreferrer" className="underline">
              Read the guide
            </a>
            .
          </div>
        );
      case StorageProviderType.URL:
        return <div>Sync with a JSON stored on an external URL. This mode only allows Read Only.</div>;
      default:
        return null;
    }
  };

  const handleSubmitLocalStorage = React.useCallback(() => {
    dispatch.uiState.setLocalApiState({ provider: StorageProviderType.LOCAL });
    setStorageProvider(StorageProviderType.LOCAL);
    setStorageType({
      provider: { provider: StorageProviderType.LOCAL },
      shouldSetInDocument: true,
    });
    dispatch.tokenState.setEditProhibited(false);
    showConfirmModal(false);
  }, [dispatch.uiState, setStorageType, dispatch.tokenState]);

  const handleSetLocalStorage = React.useCallback(() => {
    if (storageType?.provider !== StorageProviderType.LOCAL) {
      showConfirmModal(true);
    }
  }, [storageType?.provider]);

  const handleHideStorageModal = React.useCallback(() => {
    setShowEditStorageModalVisible(false);
  }, []);

  const handleHideAddCredentials = React.useCallback(() => {
    setShowCreateStorageModalVisible(false);
  }, []);

  const handleShowAddCredentials = React.useCallback(() => {
    track('Add Credentials', { provider: storageProvider });
    setShowCreateStorageModalVisible(true);
  }, [localApiState.provider]);

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
            <Heading size="small">Token Storage</Heading>
            <Stack direction="row" gap={2}>
              <ProviderSelector
                isActive={storageProvider === StorageProviderType.LOCAL}
                isStored={storageType?.provider === StorageProviderType.LOCAL}
                onClick={handleSetLocalStorage}
                text="Local document"
                id={StorageProviderType.LOCAL}
              />
              <ProviderSelector
                isActive={storageProvider === StorageProviderType.URL}
                isStored={storageType?.provider === StorageProviderType.URL}
                onClick={handleProviderClick(StorageProviderType.URL)}
                text="URL"
                id={StorageProviderType.URL}
              />
              <ProviderSelector
                isActive={storageProvider === StorageProviderType.JSONBIN}
                isStored={storageType?.provider === StorageProviderType.JSONBIN}
                onClick={handleProviderClick(StorageProviderType.JSONBIN)}
                text="JSONbin"
                id={StorageProviderType.JSONBIN}
              />
              <ProviderSelector
                isActive={storageProvider === StorageProviderType.GITHUB}
                isStored={storageType?.provider === StorageProviderType.GITHUB}
                onClick={handleProviderClick(StorageProviderType.GITHUB)}
                text="GitHub"
                id={StorageProviderType.GITHUB}
              />
              <ProviderSelector
                isActive={storageProvider === StorageProviderType.GITLAB}
                isStored={storageType?.provider === StorageProviderType.GITLAB}
                onClick={handleProviderClick(StorageProviderType.GITLAB)}
                text="GitLab"
                id={StorageProviderType.GITLAB}
              />
              {bitBucketSync ? (
                <ProviderSelector
                  isActive={storageProvider === StorageProviderType.BITBUCKET}
                  isStored={storageType?.provider === StorageProviderType.BITBUCKET}
                  onClick={handleProviderClick(StorageProviderType.BITBUCKET)}
                  text="Bitbucket"
                  id={StorageProviderType.BITBUCKET}
                />
              ) : null}

              <ProviderSelector
                isActive={storageProvider === StorageProviderType.ADO}
                isStored={storageType?.provider === StorageProviderType.ADO}
                onClick={handleProviderClick(StorageProviderType.ADO)}
                text="ADO"
                id={StorageProviderType.ADO}
              />
            </Stack>
          </Stack>
          {selectedRemoteProvider && (
            <>
              <Text muted size="xsmall">
                {storageProviderText()}
              </Text>
              <Button id="button-add-new-credentials" variant="secondary" onClick={handleShowAddCredentials}>
                Add new credentials
              </Button>

              {storedApiProviders().length > 0 && (
                <Stack direction="column" gap={2} width="full" align="start">
                  {storedApiProviders().map((item) => (
                    <StorageItem
                      key={item?.internalId || `${item.provider}-${item.id}-${item.secret}`}
                      onEdit={handleEditClick(item)}
                      item={item}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SyncSettings;
