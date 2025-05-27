import React from 'react';
import { ToggleGroup, Box, Stack } from '@tokens-studio/ui';
import { ExportProviderType } from '@/constants/ExportProviderType';
import Modal from '../Modal';
import SingleFileExport from '../ExportProvider/SingleFileExport';
import MultiFilesExport from '../ExportProvider/MultiFilesExport';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const [exportMode, setExportMode] = React.useState<string>(ExportProviderType.MULTIPLE);

  const handleModeChange = React.useCallback((mode: ExportProviderType.SINGLE | ExportProviderType.MULTIPLE) => {
    if (mode) {
      setExportMode(mode);
    }
  }, []);

  return (
    <Modal size="large" isOpen close={onClose} title="Export tokens">
      <Stack gap={4} direction="column">
        <Box>
          <ToggleGroup type="single" value={exportMode} onValueChange={handleModeChange}>
            <ToggleGroup.Item iconOnly={false} value={ExportProviderType.SINGLE}>Single file</ToggleGroup.Item>
            <ToggleGroup.Item iconOnly={false} value={ExportProviderType.MULTIPLE}>Multiple files</ToggleGroup.Item>
          </ToggleGroup>
        </Box>
        {
          exportMode === ExportProviderType.SINGLE
            ? <SingleFileExport onClose={onClose} />
            : <MultiFilesExport onClose={onClose} />
        }
      </Stack>
    </Modal>
  );
}
