import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';

import { FileZipIcon } from '@primer/octicons-react';
import { editProhibitedSelector } from '@/selectors';
import PresetModal from './modals/PresetModal';
import ExportModal from './modals/ExportModal';
import AIHelperModal from './modals/AIHelperModal';

export default function ToolsDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);

  const { t } = useTranslation(['tokens']);

  const [presetModalVisible, showPresetModal] = React.useState(false);
  const [exportModalVisible, showExportModal] = React.useState(false);
  const [aiHelperModalVisible, showAIHelperModal] = React.useState(false);

  const handleCloseExportModal = useCallback(() => {
    showExportModal(false);
  }, []);

  const handleClosePresetModal = useCallback(() => {
    showPresetModal(false);
  }, []);

  const handleShowPresetModal = useCallback(() => {
    showPresetModal(true);
  }, []);
  const handleShowExportModal = useCallback(() => {
    showExportModal(true);
  }, []);

  const handleCloseAIHelperModal = useCallback(() => {
    showAIHelperModal(false);
  }, []);
  const handleShowAIHelperModal = useCallback(() => {
    showAIHelperModal(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton tooltip={t('load_export')} aria-label={t('load_export')} size="small" icon={<FileZipIcon />} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top">
            <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowPresetModal}>
              {t('loadFromFileOrPreset')}
            </DropdownMenu.Item>
            <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowExportModal}>
              {t('exportToFile')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowAIHelperModal}>
              {t('aiHelper')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
      {aiHelperModalVisible && <AIHelperModal onClose={handleCloseAIHelperModal} />}
    </>
  );
}
