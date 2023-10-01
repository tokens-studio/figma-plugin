import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Stack from '../Stack';
import Input from '../Input';
import Text from '../Text';

type Props = {
  isOpen: boolean
  newName: string
  oldName: string
  onClose: () => void;
  handleRenameTokenGroupSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  handleNewTokenGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
};

export default function RenameTokenGroupModal({
  isOpen, newName, oldName, onClose, handleRenameTokenGroupSubmit, handleNewTokenGroupNameChange,
}: Props) {
  return (
    <Modal
      title={`Rename ${oldName}`}
      isOpen={isOpen}
      close={onClose}
      footer={(
        <form id="renameTokenGroup" onSubmit={handleRenameTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={newName === oldName}>
              Change
            </Button>
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" gap={4}>
        <Input
          full
          onChange={handleNewTokenGroupNameChange}
          type="text"
          value={newName}
          autofocus
          required
        />
        <Text muted>Renaming only affects tokens of the same type</Text>
      </Stack>
    </Modal>
  );
}
