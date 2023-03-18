import React, { useState } from 'react';
import Modal from '../Modal';
import Stack from '../Stack';
import LoadProviderItem from '../LoadProviderSelector';
import { LoadProviderType } from '@/constants/LoadProviderType';
import DefaultPreset from '../PresetProvider/DefaultPreset';
import FilePreset from '../PresetProvider/FilePreset';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const [loadProvider, setLoadProvider] = useState<string>(LoadProviderType.FILE);

  const handleProviderClick = React.useCallback((provider: string) => {
    setLoadProvider(provider);
  }, []);

  return (
    <Modal showClose isOpen close={onClose} title="Import">
      <Stack direction="column" justify="center" gap={4}>
        <Stack direction="column" gap={4}>
          <Stack direction="row" gap={2}>
            <LoadProviderItem
              isActive={loadProvider === LoadProviderType.FILE}
              onClick={handleProviderClick}
              text="File"
              id={LoadProviderType.FILE}
            />
            <LoadProviderItem
              isActive={loadProvider === LoadProviderType.PRESET}
              onClick={handleProviderClick}
              text="Preset"
              id={LoadProviderType.PRESET}
            />
          </Stack>
          {
            loadProvider === LoadProviderType.PRESET
              ? <DefaultPreset onCancel={onClose} />
              : <FilePreset onCancel={onClose} />
          }
        </Stack>
      </Stack>
    </Modal>
  );
}
