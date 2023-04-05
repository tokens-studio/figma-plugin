import React from 'react';
import { ExportProviderType } from '@/constants/ExportProviderType';
import Modal from '../Modal';
import Stack from '../Stack';
import LoadProviderItem from '../LoadProviderSelector';
import SingleFileExport from '../ExportProvider/SingleFileExport';
import MultiFilesExport from '../ExportProvider/MultiFilesExport';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const [exportProvider, setExportProvider] = React.useState<string>(ExportProviderType.SINGLE);

  const handleProviderClick = React.useCallback((provider: string) => {
    setExportProvider(provider);
  }, []);

  return (
    <Modal large isOpen close={onClose} title="Export tokens">
      <Stack gap={4} direction="column">
        <Stack direction="row" gap={1}>
          <LoadProviderItem
            isActive={exportProvider === ExportProviderType.SINGLE}
            onClick={handleProviderClick}
            text="Single file"
            id={ExportProviderType.SINGLE}
          />
          <LoadProviderItem
            isActive={exportProvider === ExportProviderType.MULTIPLE}
            onClick={handleProviderClick}
            text="Multiple files"
            id={ExportProviderType.MULTIPLE}
          />
        </Stack>
        {
          exportProvider === ExportProviderType.SINGLE
            ? <SingleFileExport onClose={onClose} />
            : <MultiFilesExport onClose={onClose} />
        }
      </Stack>
    </Modal>
  );
}
