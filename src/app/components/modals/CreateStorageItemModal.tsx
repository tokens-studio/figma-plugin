import React from 'react';
import Modal from '../Modal';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import { StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { Eventlike } from '../StorageItemForm/types';

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  storageProvider: StorageProviderType
};

export default function CreateStorageItemModal({
  isOpen, onClose, onSuccess, storageProvider,
}: Props) {
  const { addNewProviderItem } = useRemoteTokens();
  const [hasErrored, setHasErrored] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const [formFields, setFormFields] = React.useState<StorageTypeFormValues<true>>(React.useMemo(() => ({
    provider: storageProvider,
  }), [storageProvider]));

  const handleCreateNewClick = React.useCallback(async (values: StorageTypeFormValues<false>) => {
    setHasErrored(false);
    const response = await addNewProviderItem(values);
    if (response.status === 'success') {
      onSuccess();
    } else {
      setHasErrored(true);
      setErrorMessage(response?.errorMessage);
    }
  }, [addNewProviderItem, onSuccess]);

  const handleChange = React.useCallback((e: Eventlike) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = React.useCallback((values: StorageTypeFormValues<false>) => {
    handleCreateNewClick(values);
  }, [handleCreateNewClick]);

  return (
    <Modal title="Add new credentials" large isOpen={isOpen} close={onClose}>
      <StorageItemForm
        isNew
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={onClose}
        values={formFields}
        hasErrored={hasErrored}
        errorMessage={errorMessage}
      />
    </Modal>
  );
}
