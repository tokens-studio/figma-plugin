import React from 'react';
import { useSelector } from 'react-redux';
import Modal from '../Modal';
import Button from '../Button';
import Stack from '../Stack';
import Input from '../Input';
import { MultiSelectDownshiftInput } from '../MultiSelectDownshiftInput';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';

type Props = {
  isOpen: boolean
  newName: string
  onClose: () => void;
  handleDuplicateTokenGroupSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  handleNewTokenGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectedItemChange: (selectedItems: string[]) => void
};

export default function DuplicateTokenGroupModal({
  isOpen, newName, onClose, handleDuplicateTokenGroupSubmit, handleNewTokenGroupNameChange, handleSelectedItemChange,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);

  return (
    <Modal
      title="Duplicate Group"
      isOpen={isOpen}
      close={onClose}
      large
      footer={(
        <form id="duplicateTokenGroup" onSubmit={handleDuplicateTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Duplicate
            </Button>
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" gap={4} css={{ minHeight: '215px', justifyContent: 'center' }}>
        <Input
          form="duplicateTokenGroup"
          full
          onChange={handleNewTokenGroupNameChange}
          type="text"
          name="tokengroupname"
          value={newName}
          autofocus
          required
        />
        <MultiSelectDownshiftInput menuItems={Object.keys(tokens)} initialSelectedItems={[activeTokenSet]} setSelectedMenuItems={handleSelectedItemChange} />
      </Stack>
    </Modal>
  );
}
