/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { StorageProviderType } from '@/types/api';
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

const SyncSettings = () => {
  const localApiState = useSelector(localApiStateSelector);
  const storageType = useSelector(storageTypeSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();

  const { setStorageType } = useStorage();

  const [confirmModalVisible, showConfirmModal] = React.useState(false);
  const [editStorageItemModalVisible, setShowEditStorageModalVisible] = React.useState(Boolean(localApiState.new));
  const [createStorageItemModalVisible, setShowCreateStorageModalVisible] = React.useState(false);

  const handleEditClick = (provider) => {
    track('Edit Credentials');
    dispatch.uiState.setLocalApiState(provider);
    setShowEditStorageModalVisible(true);
  };

  const selectedRemoteProvider = React.useMemo(() => [StorageProviderType.JSONBIN, StorageProviderType.GITHUB, StorageProviderType.GITLAB, StorageProviderType.URL].includes(
    localApiState?.provider as StorageProviderType,
  ), [localApiState?.provider]);

  const storedApiProviders = () => apiProviders.filter((item) => item.provider === localApiState?.provider);

  const storageProviderText = () => {
    switch (localApiState?.provider) {
      case StorageProviderType.JSONBIN:
        return (
          <div>
            Create an account at
            {' '}
            <a href="https://jsonbin.io/" target="_blank" rel="noreferrer" className="underline">
              JSONbin.io
            </a>
            , copy the Secret Key into the field, and click on save. If you or your team already have a
            version stored, add the secret and the corresponding ID.
            {' '}
            <a
              href="https://docs.tokens.studio/sync"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Read more on docs.tokens.studio
            </a>
          </div>
        );
      case StorageProviderType.GITHUB:
        return (
          <div>
            Sync your tokens with a GitHub repository so your design decisions are up to date with code.
            {' '}
            <a
              href="https://docs.tokens.studio/sync/github"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
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
            <a
              href="https://docs.tokens.studio/sync/gitlab"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
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

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} className="content scroll-container">
      {confirmModalVisible && (
        <ConfirmLocalStorageModal
          isOpen={confirmModalVisible}
          onClose={showConfirmModal}
          onSuccess={() => {
            dispatch.uiState.setLocalApiState({ provider: StorageProviderType.LOCAL });
            setStorageType({
              provider: { provider: StorageProviderType.LOCAL },
              shouldSetInDocument: true,
            });
            showConfirmModal(false);
          }}
        />
      )}
      {editStorageItemModalVisible && (
        <EditStorageItemModal
          isOpen={editStorageItemModalVisible}
          onClose={() => setShowEditStorageModalVisible(false)}
          initialValue={localApiState}
          onSuccess={() => {
            setShowEditStorageModalVisible(false);
          }}
        />
      )}
      {createStorageItemModalVisible && (
        <CreateStorageItemModal
          isOpen={createStorageItemModalVisible}
          onClose={() => setShowCreateStorageModalVisible(false)}
          onSuccess={() => setShowCreateStorageModalVisible(false)}
        />
      )}
      <Box css={{ padding: '$4' }}>
        <Stack gap={4} direction="column">
          <Stack gap={4} direction="column">
            <Heading>Token Storage</Heading>
            <Stack direction="row" gap={2}>
              <ProviderSelector
                isActive={localApiState?.provider === StorageProviderType.LOCAL}
                isStored={storageType?.provider === StorageProviderType.LOCAL}
                onClick={() => (storageType?.provider === StorageProviderType.LOCAL ? null : showConfirmModal(true))}
                text="Local document"
                id={StorageProviderType.LOCAL}
              />
              <ProviderSelector
                isActive={localApiState?.provider === StorageProviderType.URL}
                isStored={storageType?.provider === StorageProviderType.URL}
                onClick={() => {
                  dispatch.uiState.setLocalApiState({
                    name: '',
                    secret: '',
                    id: '',
                    provider: StorageProviderType.URL,
                  });
                }}
                text="URL"
                id={StorageProviderType.URL}
              />
              <ProviderSelector
                isActive={localApiState?.provider === StorageProviderType.JSONBIN}
                isStored={storageType?.provider === StorageProviderType.JSONBIN}
                onClick={() => {
                  dispatch.uiState.setLocalApiState({
                    name: '',
                    secret: '',
                    id: '',
                    provider: StorageProviderType.JSONBIN,
                  });
                }}
                text="JSONbin"
                id={StorageProviderType.JSONBIN}
              />
              <ProviderSelector
                isActive={localApiState?.provider === StorageProviderType.GITHUB}
                isStored={storageType?.provider === StorageProviderType.GITHUB}
                onClick={() => {
                  dispatch.uiState.setLocalApiState({
                    name: '',
                    secret: '',
                    id: '',
                    branch: '',
                    provider: StorageProviderType.GITHUB,
                  });
                }}
                text="GitHub"
                id={StorageProviderType.GITHUB}
              />
              <ProviderSelector
                isActive={localApiState?.provider === StorageProviderType.GITLAB}
                isStored={storageType?.provider === StorageProviderType.GITLAB}
                onClick={() => {
                  dispatch.uiState.setLocalApiState({
                    name: '',
                    secret: '',
                    id: '',
                    branch: '',
                    provider: StorageProviderType.GITLAB,
                  });
                }}
                text="GitLab"
                id={StorageProviderType.GITLAB}
              />
            </Stack>
          </Stack>
          {selectedRemoteProvider && (
          <>
            <Text muted size="xsmall">{storageProviderText()}</Text>
            <Button
              id="button-add-new-credentials"
              variant="secondary"
              onClick={() => {
                track('Add Credentials', { provider: localApiState.provider });
                setShowCreateStorageModalVisible(true);
              }}
            >
              Add new credentials
            </Button>

            {storedApiProviders().length > 0 && (
              <Stack direction="column" gap={2} width="full" align="start">
                {storedApiProviders().map((item) => (
                  <StorageItem
                    key={item.internalId || `${item.provider}-${item.id}-${item.secret}`}
                    onEdit={() => handleEditClick(item)}
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
