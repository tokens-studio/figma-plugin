import React from 'react';
import { Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import FilePreset from '../PresetProvider/FilePreset';

type Props = {
  onClose: () => void
};

export default function FileLoadModal({ onClose }: Props) {
  return (
    <Modal showClose isOpen close={onClose} title="Import from file">
      <Stack direction="column" justify="center" gap={4}>
        <FilePreset onCancel={onClose} />
      </Stack>
    </Modal>
  );
}
