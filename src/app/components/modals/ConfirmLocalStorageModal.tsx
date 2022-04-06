import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import Button from '../Button';
import Stack from '../Stack';

export default function ConfirmLocalStorageModal({ isOpen, onClose, onSuccess }) {
  return (
    <Modal isOpen={isOpen} close={() => onClose(false)}>
      <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
        <Stack direction="column" gap={2}>
          <Heading>Set to document storage?</Heading>
          <p className="text-xs">You can always go back to remote storage.</p>
        </Stack>
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="large" onClick={onSuccess}>
            Yes, set to local.
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
