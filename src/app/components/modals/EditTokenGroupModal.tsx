import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Stack from '../Stack';
import Input from '../Input';
import Text from '../Text';
import Box from '../Box';
import Heading from '../Heading';
import Textarea from '../Textarea';

export type EditTokenGroupFormValues = {
  name: string;
  type: string
  description: string;
};
type Props = {
  isOpen: boolean;
  values: EditTokenGroupFormValues;
  onClose: () => void;
  handleFormChange: (e: EditTokenGroupFormValues) => void;
  handleEditTokenGroupSubmit: (e: EditTokenGroupFormValues) => void;
};

export default function EditTokenGroupModal({
  isOpen, values, onClose, handleFormChange, handleEditTokenGroupSubmit,
}: Props) {
  const handleDescriptionChange = React.useCallback((value: string) => {
    handleFormChange({
      ...values,
      description: value,
    });
  }, [values, handleFormChange]);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFormChange({
      ...values,
      [e.target.name]: e.target.value,
    });
  }, [values, handleFormChange]);

  const handleSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleEditTokenGroupSubmit(values);
  }, [values, handleEditTokenGroupSubmit]);

  return (
    <Modal
      title={`Rename ${values.name}`}
      isOpen={isOpen}
      close={onClose}
    >
      <form id="renameTokenGroup" onSubmit={handleSubmit}>
        <Stack gap={3} direction="column" justify="start">
          <Input
            full
            name="name"
            onChange={handleInputChange}
            type="text"
            value={values.name}
            autofocus
            required
          />
          <Text muted>Renaming only affects tokens of the same type</Text>
          <Box>
            <Heading size="xsmall">Description</Heading>
            <Textarea
              key="description"
              value={values?.description || ''}
              placeholder="Optional description"
              onChange={handleDescriptionChange}
              rows={3}
              border
            />
          </Box>
          <Input
            full
            name="type"
            onChange={handleInputChange}
            type="text"
            value={values.type}
            autofocus
            required
          />
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!values.name || !values.type}>
              Change
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}
