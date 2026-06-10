import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';

import { FileZipIcon } from '@primer/octicons-react';
import { apiSelector, editProhibitedSelector } from '@/selectors';
import FileLoadModal from './modals/FileLoadModal';
import PresetLoadModal from './modals/PresetLoadModal';
import ExportModal from './modals/ExportModal';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TOKENS_STUDIO_APP_URL } from '@/constants/TokensStudio';

export default function ToolsDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);

  const { t } = useTranslation(['tokens']);

  const [fileLoadModalVisible, showFileLoadModal] = React.useState(false);
  const [presetLoadModalVisible, showPresetLoadModal] = React.useState(false);
  const [exportModalVisible, showExportModal] = React.useState(false);

  const handleCloseExportModal = useCallback(() => {
    showExportModal(false);
  }, []);

  const handleCloseFileLoadModal = useCallback(() => {
    showFileLoadModal(false);
  }, []);

  const handleClosePresetLoadModal = useCallback(() => {
    showPresetLoadModal(false);
  }, []);

  const api = useSelector(apiSelector);
  const isTokensStudioOAuth = api?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;

  const handleShowFileLoadModal = useCallback(() => {
    if (isTokensStudioOAuth && api?.id) {
      window.open(`https://${TOKENS_STUDIO_APP_URL}/projects/${api.id}/tokens/import`, '_blank');
    } else {
      showFileLoadModal(true);
    }
  }, [isTokensStudioOAuth, api?.id]);

  const handleShowPresetLoadModal = useCallback(() => {
    showPresetLoadModal(true);
  }, []);

  const handleShowExportModal = useCallback(() => {
    showExportModal(true);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton tooltip={t('load_export')} aria-label={t('load_export')} size="small" icon={<FileZipIcon />} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top">
            <DropdownMenu.Item disabled={!isTokensStudioOAuth && editProhibited} onSelect={handleShowFileLoadModal}>
              {t('loadFromFile')}
            </DropdownMenu.Item>
            <DropdownMenu.Item disabled={editProhibited || isTokensStudioOAuth} onSelect={handleShowPresetLoadModal}>
              {t('loadFromPreset')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={handleShowExportModal}>
              {t('exportToFile')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {fileLoadModalVisible && <FileLoadModal onClose={handleCloseFileLoadModal} />}
      {presetLoadModalVisible && <PresetLoadModal onClose={handleClosePresetLoadModal} />}
    </>
  );
}
