import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import FilePreset from '../PresetProvider/FilePreset';

type Props = {
  onClose: () => void
};

export default function FileLoadModal({ onClose }: Props) {
  const { t } = useTranslation(['tokens']);

  return (
    <Modal showClose isOpen close={onClose} title={t('importFromFile')}>
      <Stack direction="column" justify="center" gap={4}>
        <FilePreset onCancel={onClose} />
      </Stack>
    </Modal>
  );
}
