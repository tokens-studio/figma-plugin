import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import IconChevronDown from '@/icons/chevrondown.svg';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from './DropdownMenu';
import { editProhibitedSelector } from '@/selectors';
import PresetModal from './modals/PresetModal';
import ExportModal from './modals/ExportModal';

export default function ToolsDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);

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
        <DropdownMenuTrigger>
          <span>
            Tools
          </span>
          <IconChevronDown />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top">
          <DropdownMenuItem disabled={editProhibited} onSelect={handleShowPresetModal}>Load from file/folder or preset</DropdownMenuItem>
          <DropdownMenuItem disabled={editProhibited} onSelect={handleShowExportModal}>Export to file/folder</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
    </>
  );
}
