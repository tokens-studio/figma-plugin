import React from 'react';
import { useSelector } from 'react-redux';
import Modal from '../Modal';
import Heading from '../Heading';
import StorageItemForm from '../StorageItemForm';
import useRemoteTokens from '../../store/remoteTokens';
import { localApiStateSelector } from '@/selectors';
import Stack from '../Stack';
import { StorageTypeFormValues } from '@/types/StorageType';

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
};

export default function CreateStorageItemModal({ isOpen, onClose, onSuccess }: Props) {
  const localApiState = useSelector(localApiStateSelector);
  const { addNewProviderItem } = useRemoteTokens();
  const [hasErrored, setHasErrored] = React.useState(false);

  const [formFields, setFormFields] = React.useState<StorageTypeFormValues<true>>(React.useMemo(() => ({
    provider: localApiState.provider,
  }), [localApiState]));

  const handleCreateNewClick = React.useCallback(async (values: StorageTypeFormValues<false>) => {
    setHasErrored(false);
    const response = await addNewProviderItem(values);
    if (response) {
      onSuccess();
    } else {
      setHasErrored(true);
    }
  }, [addNewProviderItem, onSuccess]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  }, [formFields]);

  const handleSubmit = React.useCallback((values: StorageTypeFormValues<false>) => {
    handleCreateNewClick(values);
  }, [handleCreateNewClick]);

  return (
    <Modal large isOpen={isOpen} close={onClose}>
      <Stack direction="column" gap={4}>
        <Heading>Add new credentials</Heading>
        <StorageItemForm
          isNew
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
          values={formFields}
          hasErrored={hasErrored}
        />
      </Stack>
    </Modal>
  );
}
