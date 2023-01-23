import React from 'react';
import { useSelector } from 'react-redux';
import Modal from '../Modal';
import Button from '../Button';
import Stack from '../Stack';
import Input from '../Input';
import { MultiSelectDownshiftInput } from '../MultiSelectDownshiftInput';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';
import useManageTokens from '@/app/store/useManageTokens';

type Props = {
  isOpen: boolean;
  type: string;
  newName: string;
  oldName: string;
  onClose: () => void;
  handleNewTokenGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DuplicateTokenGroupModal({
  isOpen, type, newName, oldName, onClose, handleNewTokenGroupNameChange,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const [selectedTokenSets, setSelectedTokenSets] = React.useState<string[]>([activeTokenSet]);
  const { duplicateGroup } = useManageTokens();

  const handleSelectedItemChange = React.useCallback((selectedItems: string[]) => {
    setSelectedTokenSets(selectedItems);
  }, []);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    duplicateGroup({
      oldName, newName, tokenSets: selectedTokenSets, type,
    });
    onClose();
  }, [duplicateGroup, oldName, newName, type, selectedTokenSets]);

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
