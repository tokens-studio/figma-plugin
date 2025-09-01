import React from 'react';
import { Button, Checkbox, Switch } from '@tokens-studio/ui';
import Modal from '../Modal';
import Stack from '../Stack';
import Input from '../Input';
import useTokens from '../../store/useTokens';
import Box from '../Box';
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
  const [useRegex, setUseRegex] = React.useState(false);
  const { handleBulkRemap } = useTokens();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const onConfirm = React.useCallback(async () => {
    const updateMode = shouldRemapDocument ? UpdateMode.DOCUMENT : UpdateMode.SELECTION;
    await handleBulkRemap(newName, oldName, updateMode, useRegex);
    onClose();
  }, [handleBulkRemap, onClose, newName, oldName, shouldRemapDocument, useRegex]);

  const handleOldNameChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setOldName(e.target.value);
  }, []);

  const handleNewNameChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setNewName(e.target.value);
  }, []);

  const updateShouldRemapDocument = React.useCallback(() => {
    setShouldRemapDocument(!shouldRemapDocument);
  }, [shouldRemapDocument]);

  const updateUseRegex = React.useCallback(() => {
    setUseRegex(!useRegex);
  }, [useRegex]);

  return (
    <Modal size="large" showClose isOpen={isOpen} close={handleClose} title="Bulk remap">
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
            <Label htmlFor="remapDocument" css={{ fontSize: '$small', fontWeight: '$sansBold' }}>
              Remap across document (slow)
            </Label>
          </Box>
          <Box css={{
            display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small',
          }}
          >
            <Switch
              checked={useRegex}
              id="useRegex"
              onCheckedChange={updateUseRegex}
            />
            <Label htmlFor="useRegex" css={{ fontSize: '$small', fontWeight: '$sansBold' }}>
              Use regular expressions
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
