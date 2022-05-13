import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { StorageProviderType } from '@/types/api';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import { localApiStateSelector } from '@/selectors';
import Stack from '../Stack';

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
};

// @TODO use hooks

export default function CreateStorageItemModal({ isOpen, onClose, onSuccess }: Props) {
  const localApiState = useSelector(localApiStateSelector);
  const { addNewProviderItem } = useRemoteTokens();
  const [hasErrored, setHasErrored] = React.useState(false);
  let defaultFields;
  switch (localApiState.provider) {
    case StorageProviderType.GITHUB:
    case StorageProviderType.GITLAB:
    case StorageProviderType.ADO: {
      defaultFields = {
        secret: '',
        id: '',
        branch: '',
        filePath: '',
        baseUrl: '',
      };
      break;
    }
    default:
      defaultFields = { id: '', name: '', secret: '' };
      break;
  }
  const [formFields, setFormFields] = React.useState(defaultFields);
  const handleCreateNewClick = React.useCallback(async () => {
    setHasErrored(false);
    const response = await addNewProviderItem({
      provider: localApiState.provider,
      ...formFields,
    });
    if (response) {
      onSuccess();
    } else {
      setHasErrored(true);
    }
  }, [addNewProviderItem, formFields, localApiState.provider, onSuccess]);

  const handleChange = useCallback((e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleCreateNewClick();
  }, [handleCreateNewClick]);

  return (
    <Modal large isOpen={isOpen} close={onClose}>
      <Stack direction="column" gap={4}>
        <Heading>Add new credentials</Heading>
        <StorageItemForm
          isNew
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={onClose}
          values={formFields}
          hasErrored={hasErrored}
        />
      </Stack>
    </Modal>
  );
}
