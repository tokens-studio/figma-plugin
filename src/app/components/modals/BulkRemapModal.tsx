import React from 'react';
import Modal from '../Modal';
import Heading from '../Heading';
import Button from '../Button';
import Stack from '../Stack';
import Input from '../Input';
import useTokens from '../../store/useTokens';

type Props = {
  isOpen: boolean
  onClose: () => void;
};

export default function BulkRemapModal({ isOpen, onClose }: Props) {
  const [matchingToken, setMatchingToken] = React.useState('');
  const [newToken, setNewToken] = React.useState('');
  const { handleBulkRemap } = useTokens();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const onConfirm = React.useCallback(() => {
    handleBulkRemap(newToken, matchingToken);
    onClose();
  }, []);

  const handleMatchingTokenChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    e.persist();
    setMatchingToken(e.target.value);
  }, [matchingToken]);

  const handleNewTokenChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    e.persist();
    setNewToken(e.target.value);
  }, [newToken]);

  return (
    <Modal large isOpen={isOpen} close={handleClose}>
      <form
        onSubmit={onConfirm}
      >
        <Stack direction="column" gap={4} css={{ minHeight: '215px', justifyContent: 'center' }}>
          <Stack direction="column" gap={2}>
            <Heading>
              Choose a new token for
            </Heading>

          </Stack>
          <Input
            full
            autofocus
            type="text"
            label="Match"
            value={matchingToken}
            placeholder=""
            onChange={handleMatchingTokenChange}
            name="matchingToken"
          />
          <Input
            required
            full
            autofocus
            type="text"
            label="Remap"
            value={newToken}
            placeholder=""
            onChange={handleNewTokenChange}
            name="newToken"
          />
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
