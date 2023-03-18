import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import Text from '../Text';
import Button from '../Button';
import Stack from '../Stack';

type Props = {
  isOpen: boolean
  onToggle: (open: boolean) => void
  onSuccess: () => void
};

export default function ConfirmLocalStorageModal({ isOpen, onToggle, onSuccess }: Props) {
  const handleClose = React.useCallback(() => {
    onToggle(false);
  }, [onToggle]);

  return (
    <Modal isOpen={isOpen} close={handleClose}>
      <Stack direction="column" justify="center" gap={4}>
        <Stack direction="column" gap={2}>
          <Heading>Set to document storage?</Heading>
          <Text size="small">You can always go back to remote storage.</Text>
        </Stack>
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={handleClose}>
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
