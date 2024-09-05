import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import Stack from '../Stack';
import { StorageProviderType, StorageTypeFormValues } from '@/types/StorageType';
import { Eventlike } from '../StorageItemForm/types';

type Props = {
  isOpen: boolean;
  initialValue: StorageTypeFormValues<true>;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditStorageItemModal({
  isOpen, initialValue, onClose, onSuccess,
}: Props) {
  const { t } = useTranslation(['storage']);
  const [formFields, setFormFields] = React.useState<StorageTypeFormValues<true>>(initialValue);
  const [hasErrored, setHasErrored] = React.useState(false);
  const { addNewProviderItem } = useRemoteTokens();
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const handleChange = React.useCallback((e: Eventlike) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = React.useCallback(async (values: StorageTypeFormValues<false>) => {
    const response = await addNewProviderItem(values);
    if (response.status === 'success') {
      onSuccess();
    } else {
      setHasErrored(true);
      setErrorMessage(response?.errorMessage);
    }
  }, [addNewProviderItem, onSuccess]);

  return (
    <Modal title={t('editCredentials') as string} id="modal-edit-storage-item" isOpen={isOpen} close={onClose}>
      <Stack direction="column" gap={4}>
        <StorageItemForm
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
          values={formFields as Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.URL }>}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      </Stack>
    </Modal>
  );
}
