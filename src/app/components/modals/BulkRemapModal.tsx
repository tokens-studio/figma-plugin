import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Stack from '../Stack';
import Input from '../Input';
import useTokens from '../../store/useTokens';
import Box from '../Box';
import Checkbox from '../Checkbox';
import Label from '../Label';
import { UpdateMode } from '@/constants/UpdateMode';

type Props = {
  isOpen: boolean
  onClose: () => void;
};

export default function BulkRemapModal({ isOpen, onClose }: Props) {
  const [oldName, setOldName] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [shouldRemapDocument, setShouldRemapDocument] = React.useState(false);
  const { handleBulkRemap } = useTokens();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const onConfirm = React.useCallback(async () => {
    const updateMode = shouldRemapDocument ? UpdateMode.DOCUMENT : UpdateMode.SELECTION;
    await handleBulkRemap(newName, oldName, updateMode);
    onClose();
  }, [handleBulkRemap, onClose, newName, oldName, shouldRemapDocument]);

  const handleOldNameChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setOldName(e.target.value);
  }, []);

  const handleNewNameChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setNewName(e.target.value);
  }, []);

  const updateShouldRemapDocument = React.useCallback(() => {
    setShouldRemapDocument(!shouldRemapDocument);
  }, [shouldRemapDocument]);

  return (
    <Modal large showClose isOpen={isOpen} close={handleClose} title="Bulk remap">
      <form
        onSubmit={onConfirm}
      >
        <Stack direction="column" gap={4}>
          <Input
            full
            required
            autofocus
            type="text"
            label="Match"
            value={oldName}
            placeholder=""
            onChange={handleOldNameChange}
            name="oldName"
          />
          <Input
            required
            full
            type="text"
            label="Remap"
            value={newName}
            placeholder=""
            onChange={handleNewNameChange}
            name="newName"
          />
          <Box css={{
            display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small',
          }}
          >
            <Checkbox
              checked={shouldRemapDocument}
              id="remapDocument"
              onCheckedChange={updateShouldRemapDocument}
            />
            <Label htmlFor="remapDocument" css={{ fontSize: '$small', fontWeight: '$bold' }}>
              Remap across document (slow)
            </Label>
          </Box>
          <Stack direction="row" gap={4} justify="between">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Remap
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}
