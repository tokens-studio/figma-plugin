import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@tokens-studio/ui';
import { tokensSelector, activeTokenSetSelector } from '@/selectors';
import { ErrorMessage } from '../ErrorMessage';
import Modal from '../Modal';
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
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const { t } = useTranslation(['tokens']);

  const canRename = React.useMemo(() => {
    const isDuplicated = tokens[activeTokenSet].some((token) => token.name.startsWith(`${newName}.`));
    return !isDuplicated;
  }, [tokens, newName, activeTokenSet]);

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
            <Button type="submit" variant="primary" disabled={(newName === oldName) || !canRename}>
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
        {!canRename && <ErrorMessage css={{ width: '100%' }}> {t('renameGroupError')} </ErrorMessage>}
        <Text muted>Renaming only affects tokens of the same type</Text>
      </Stack>
    </Modal>
  );
}
