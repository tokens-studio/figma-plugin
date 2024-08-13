import React, { useState } from 'react';
import { ToggleGroup, Box, Stack } from '@tokens-studio/ui';
import Modal from '../Modal';
import { LoadProviderType } from '@/constants/LoadProviderType';
import DefaultPreset from '../PresetProvider/DefaultPreset';
import FilePreset from '../PresetProvider/FilePreset';

type Props = {
  onClose: () => void
};

export default function PresetModal({ onClose }: Props) {
  const [importMode, setImportMode] = useState<string>(LoadProviderType.FILE);

  const handleValueChange = React.useCallback((provider: LoadProviderType) => {
    if (provider) {
      setImportMode(provider);
    }
  }, []);

  return (
    <Modal showClose isOpen close={onClose} title="Import">
      <Stack direction="column" justify="center" gap={4}>
        <Stack direction="column" gap={4}>
          <Box>
            <ToggleGroup type="single" value={importMode} onValueChange={handleValueChange}>
              <ToggleGroup.Item iconOnly={false} value={LoadProviderType.FILE}>File or Folder</ToggleGroup.Item>
              <ToggleGroup.Item iconOnly={false} value={LoadProviderType.PRESET}>Preset</ToggleGroup.Item>
            </ToggleGroup>
          </Box>
          {
            importMode === LoadProviderType.PRESET
              ? <DefaultPreset onCancel={onClose} />
              : <FilePreset onCancel={onClose} />
          }
        </Stack>
      </Stack>
    </Modal>
  );
}
