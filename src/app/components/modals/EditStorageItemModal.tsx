import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';

export default function EditStorageItemModal({
  isOpen, initialValue, onClose, onSuccess,
}) {
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
    <Modal large id="modal-edit-storage-item" isOpen={isOpen} close={() => onClose(false)}>
      <div className="space-y-4">
        <Heading>Edit storage item</Heading>
        <StorageItemForm
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={() => onClose(false)}
          values={formFields}
          hasErrored={hasErrored}
        />
      </div>
    </Modal>
  );
}
