import React from 'react';
import { Button, Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import Input from '../Input';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

type Props = { isOpen: boolean; onClose: () => void };

export default function LivingDocumentationModal({ isOpen, onClose }: Props) {
  const [tokenSet, setTokenSet] = React.useState('');
  const [startsWith, setStartsWith] = React.useState('');

  const handleGenerate = React.useCallback(() => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LIVING_DOCUMENTATION,
      tokenSet,
      startsWith,
    });
    onClose();
  }, [tokenSet, startsWith, onClose]);

  return (
    <Modal title="Generate documentation" isOpen={isOpen} close={onClose} size="large">
      <Stack direction="column" gap={4}>
        <Input full label="Token set" value={tokenSet} onChange={(e) => setTokenSet(e.target.value)} />
        <Input full label="Name starts with" value={startsWith} onChange={(e) => setStartsWith(e.target.value)} />
        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleGenerate}>Generate</Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
