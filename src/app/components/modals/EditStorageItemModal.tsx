import React from 'react';
import setValue from 'set-value';
import deepClone from 'lodash.clonedeep';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import Stack from '../Stack';
import { StorageTypeFormValues } from '@/types/StorageType';

type Props = {
  isOpen: boolean;
  initialValue: StorageTypeFormValues<true>;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditStorageItemModal({
  isOpen, initialValue, onClose, onSuccess,
}: Props) {
  const [formFields, setFormFields] = React.useState<StorageTypeFormValues<true>>(initialValue);
  const [hasErrored, setHasErrored] = React.useState(false);
  const { addNewProviderItem } = useRemoteTokens();
  const [errorMessage, setErrorMessage] = React.useState<string>();

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const shallowObj = deepClone(formFields);
    setValue(shallowObj, e.target.name, e.target.value);
    setFormFields(shallowObj);
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
    <Modal large id="modal-edit-storage-item" isOpen={isOpen} close={onClose}>
      <Stack direction="column" gap={4}>
        <Heading>Edit storage item</Heading>
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
