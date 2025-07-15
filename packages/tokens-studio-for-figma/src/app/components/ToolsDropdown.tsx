import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';

import { FileZipIcon } from '@primer/octicons-react';
import { editProhibitedSelector } from '@/selectors';
import PresetModal from './modals/PresetModal';
import ExportModal from './modals/ExportModal';
import LivingDocumentationModal from './modals/LivingDocumentationModal';

export default function ToolsDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);

  const { t } = useTranslation(['tokens']);

  const [presetModalVisible, showPresetModal] = React.useState(false);
  const [exportModalVisible, showExportModal] = React.useState(false);
  const [docModalVisible, showDocModal] = React.useState(false);

  const handleCloseExportModal = useCallback(() => {
    showExportModal(false);
  }, []);

  const handleClosePresetModal = useCallback(() => {
    showPresetModal(false);
  }, []);

  const handleCloseDocModal = useCallback(() => {
    showDocModal(false);
  }, []);

  const handleShowPresetModal = useCallback(() => {
    showPresetModal(true);
  }, []);
  const handleShowExportModal = useCallback(() => {
    showExportModal(true);
  }, []);
  const handleShowDocModal = useCallback(() => {
    showDocModal(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton tooltip={t('tools')} aria-label={t('tools')} size="small" variant="invisible" icon={<FileZipIcon />} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
        <DropdownMenu.Content side="top">
          <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowPresetModal}>{t('loadFromFileOrPreset')}</DropdownMenu.Item>
          <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowExportModal}>{t('exportToFile')}</DropdownMenu.Item>
          <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowDocModal}>Generate documentation</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
      </DropdownMenu>
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
      {docModalVisible && <LivingDocumentationModal isOpen onClose={handleCloseDocModal} />}
    </>
  );
}
