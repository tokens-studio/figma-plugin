import React, { useState } from 'react';
import Heading from '../Heading';
import Modal from '../Modal';
import Stack from '../Stack';
import LoadProvider from '../LoadProviderSelector';
import { LoadProviderType } from '@/constants/LoadProviderType';
import PresetProvider from '../LoadProvider/PresetProvider';
import FileProvider from '../LoadProvider/FileProvider';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const [loadProvider, setLoadProvider] = useState<string>(LoadProviderType.PRESET);

  const handleProviderClick = React.useCallback((provider: string) => () => {
    setLoadProvider(provider);
  }, [loadProvider]);

  return (
    <Modal showClose isOpen close={onClose}>
      <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
        <Stack direction="column" gap={2}>
          <Stack direction="row" gap={1}>
            <LoadProvider
              isActive={loadProvider === LoadProviderType.PRESET}
              onClick={handleProviderClick(LoadProviderType.PRESET)}
              text="Preset"
              id={LoadProviderType.PRESET}
            />
            <LoadProvider
              isActive={loadProvider === LoadProviderType.FILE}
              onClick={handleProviderClick(LoadProviderType.FILE)}
              text="File"
              id={LoadProviderType.FILE}
            />
          </Stack>
          <Heading>Import</Heading>
          {
            loadProvider === LoadProviderType.PRESET
              ? <PresetProvider onCancel={onClose} />
              : <FileProvider onCancel={onClose} />
          }
        </Stack>
      </Stack>
    </Modal>
  );
}
