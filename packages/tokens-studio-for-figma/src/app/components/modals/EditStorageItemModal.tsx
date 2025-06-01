import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import Stack from '../Stack';
import { StorageTypeFormValues } from '@/types/StorageType';
import { Eventlike } from '../StorageItemForm/types';
import { useSyncProviderProgressDialog } from '../../hooks/useSyncProviderProgressDialog';

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
  const { showDialog, hideDialog } = useSyncProviderProgressDialog();

  const handleChange = React.useCallback((e: Eventlike) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = React.useCallback(async (values: StorageTypeFormValues<false>) => {
    const providerName = {
      url: 'URL',
      jsonbin: 'JSONBIN',
      github: 'GitHub',
      gitlab: 'GitLab',
      ado: 'Azure DevOps',
      bitbucket: 'Bitbucket',
      supernova: 'Supernova',
      genericVersionedStorage: 'Generic Versioned Storage',
      tokensstudio: 'Tokens Studio',
    }[values.provider] || values.provider;
    
    showDialog(providerName);
    
    const response = await addNewProviderItem(values);
    if (response.status === 'success') {
      // The progress dialog will automatically transition to success state
      // and the user can close it when ready
      onSuccess();
    } else {
      hideDialog();
      setHasErrored(true);
      setErrorMessage(response?.errorMessage);
    }
  }, [addNewProviderItem, onSuccess, showDialog, hideDialog]);

  return (
    <Modal title={t('editCredentials') as string} id="modal-edit-storage-item" isOpen={isOpen} close={onClose}>
      <Stack direction="column" gap={4}>
        <StorageItemForm
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
          values={formFields}
          hasErrored={hasErrored}
          errorMessage={errorMessage}
        />
      </Stack>
    </Modal>
  );
}
