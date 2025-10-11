import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import DefaultPreset from '../PresetProvider/DefaultPreset';

type Props = {
  onClose: () => void
};

export default function PresetLoadModal({ onClose }: Props) {
  const { t } = useTranslation(['tokens']);

  return (
    <Modal showClose isOpen close={onClose} title={t('importFromPreset')}>
      <Stack direction="column" justify="center" gap={4}>
        <DefaultPreset onCancel={onClose} />
      </Stack>
    </Modal>
  );
}
