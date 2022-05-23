import React from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from '@/app/store';
import Heading from '../Heading';
import Button from '../Button';
import Modal from '../Modal';
import Stack from '../Stack';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const dispatch = useDispatch<Dispatch>();

  const handleSetDefault = React.useCallback(() => {
    dispatch.tokenState.setDefaultTokens();
    onClose();
  }, [dispatch, onClose]);

  return (
    <Modal showClose isOpen close={onClose}>
      <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
        <Stack direction="column" gap={2}>
          <Heading>Load a preset</Heading>
          <p className="text-xs text-gray-600">
            Override your current tokens by applying a preset. Want your preset featured here? Submit it via
            {' '}
            <a
              target="_blank"
              rel="noreferrer"
              className="underline"
              href="https://github.com/six7/figma-tokens/issues"
            >
              GitHub
            </a>
          </p>
          <Button variant="primary" onClick={handleSetDefault}>
            Apply default preset
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
