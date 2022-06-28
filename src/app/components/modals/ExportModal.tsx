import React from 'react';
import Modal from '../Modal';
import Stack from '../Stack';
import ExportProviderItem from '../ExportProviderSelector';
import { ExportProviderType } from '@/constants/ExportProviderType';
import SingleFileExport from '../ExportProvider/SingleFileExport';
import MultiFilesExport from '../ExportProvider/MultiFilesExport';

type Props = {
  onClose: () => void
};

export default function ExportModal({ onClose }: Props) {
  const [exportProvider, setExportProvider] = React.useState<string>(ExportProviderType.SINGLE);

  const handleProviderClick = React.useCallback((provider: string) => () => {
    setExportProvider(provider);
  }, [exportProvider]);

  return (
    <Modal large isOpen close={onClose} title="Export">
      <Stack gap={4} direction="column">
        <Stack direction="row" gap={1}>
          <ExportProviderItem
            isActive={exportProvider === ExportProviderType.SINGLE}
            onClick={handleProviderClick(ExportProviderType.SINGLE)}
            text="Single file"
            id={ExportProviderType.SINGLE}
          />
          <ExportProviderItem
            isActive={exportProvider === ExportProviderType.MULTIPLE}
            onClick={handleProviderClick(ExportProviderType.MULTIPLE)}
            text="Multiple files"
            id={ExportProviderType.MULTIPLE}
          />
        </Stack>
        {
          exportProvider === ExportProviderType.SINGLE
            ? <SingleFileExport onCancel={onClose} />
            : <MultiFilesExport onCancel={onClose} />
        }
      </Stack>
    </Modal>
  );
}
