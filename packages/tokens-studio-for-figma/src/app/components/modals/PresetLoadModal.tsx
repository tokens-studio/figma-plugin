import React from 'react';
import { Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import DefaultPreset from '../PresetProvider/DefaultPreset';

type Props = {
  onClose: () => void
};

export default function PresetLoadModal({ onClose }: Props) {
  return (
    <Modal showClose isOpen close={onClose} title="Load from preset">
      <Stack direction="column" justify="center" gap={4}>
        <DefaultPreset onCancel={onClose} />
      </Stack>
    </Modal>
  );
}
