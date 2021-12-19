/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { StorageProviderType } from '../../types/api';
import Button from './Button';
import Heading from './Heading';
import ConfirmLocalStorageModal from './modals/ConfirmLocalStorageModal';
import StorageItem from './StorageItem';
import ProviderSelector from './StorageProviderSelector';
import EditStorageItemModal from './modals/EditStorageItemModal';
import CreateStorageItemModal from './modals/CreateStorageItemModal';
import useStorage from '../store/useStorage';
import { Dispatch, RootState } from '../store';

function SyncSettings() {
  const { localApiState, apiProviders, storageType } = useSelector((state: RootState) => state.uiState);
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

  const selectedRemoteProvider = () => [StorageProviderType.JSONBIN, StorageProviderType.GITHUB, StorageProviderType.URL].includes(
    localApiState?.provider as StorageProviderType,
  );

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
      case StorageProviderType.URL:
        return <div>Sync with a JSON stored on an external URL. This mode only allows Read Only.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-grow">
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
      <div className="p-4 space-y-4 border-b">
        <div className="space-y-4">
          <Heading>Token Storage</Heading>
          <div className="flex flex-row gap-2">
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
          </div>
        </div>
        {selectedRemoteProvider() && (
        <>
          <div className="text-gray-600 text-xxs">{storageProviderText()}</div>
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
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {storedApiProviders().map((item) => (
                <StorageItem
                  key={item.internalId || `${item.provider}-${item.id}-${item.secret}`}
                  onEdit={() => handleEditClick(item)}
                  item={item}
                />
              ))}
            </div>
          </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}

export default SyncSettings;
