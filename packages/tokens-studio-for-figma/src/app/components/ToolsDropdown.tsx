import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@tokens-studio/ui';
import IconChevronDown from '@/icons/chevrondown.svg';

import { editProhibitedSelector } from '@/selectors';
import PresetModal from './modals/PresetModal';
import ExportModal from './modals/ExportModal';

export default function ToolsDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);

  const { t } = useTranslation(['tokens']);

  const [presetModalVisible, showPresetModal] = React.useState(false);
  const [exportModalVisible, showExportModal] = React.useState(false);

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <span>
            {t('tools')}
          </span>
          <IconChevronDown />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="top">
          <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowPresetModal}>{t('loadFromFileOrPreset')}</DropdownMenu.Item>
          <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowExportModal}>{t('exportToFile')}</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
    </>
  );
}
