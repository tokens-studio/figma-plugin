import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import Stack from '../Stack';
import { ApiDataType } from '@/types/api';

type Props = {
  isOpen: boolean
  initialValue: ApiDataType
  onClose: () => void
  onSuccess: () => void
};

export default function EditStorageItemModal({
  isOpen, initialValue, onClose, onSuccess,
}: Props) {
  const [formFields, setFormFields] = React.useState(initialValue);
  const [hasErrored, setHasErrored] = React.useState(false);
  const { addNewProviderItem } = useRemoteTokens();

  const handleChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await addNewProviderItem(formFields);
    if (!response) {
      setHasErrored(true);
    } else {
      onSuccess();
    }
  };

  return (
    <Modal large id="modal-edit-storage-item" isOpen={isOpen} close={onClose}>
      <Stack direction="column" gap={4}>
        <Heading>Edit storage item</Heading>
        <StorageItemForm
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
