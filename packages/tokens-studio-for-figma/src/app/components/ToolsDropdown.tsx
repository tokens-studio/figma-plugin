import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';

import { Box, Tools } from 'iconoir-react';
import { editProhibitedSelector } from '@/selectors';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import PresetModal from './modals/PresetModal';
import ExportModal from './modals/ExportModal';
import LivingDocumentationModal from './modals/LivingDocumentationModal';
import ProBadge from './ProBadge';
import UpgradeToProModal from './UpgradeToProModal';
import generateDocumentationImage from '@/app/assets/hints/generateDocumentation.png';

export default function ToolsDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const isProUser = useIsProUser();

  const { t } = useTranslation(['tokens']);

  const [presetModalVisible, showPresetModal] = React.useState(false);
  const [exportModalVisible, showExportModal] = React.useState(false);
  const [docModalVisible, showDocModal] = React.useState(false);
  const [upgradeModalVisible, showUpgradeModal] = React.useState(false);

  const handleCloseExportModal = useCallback(() => {
    showExportModal(false);
  }, []);

  const handleClosePresetModal = useCallback(() => {
    showPresetModal(false);
  }, []);

  const handleCloseDocModal = useCallback(() => {
    showDocModal(false);
  }, []);

  const handleCloseUpgradeModal = useCallback(() => {
    showUpgradeModal(false);
  }, []);

  const handleShowPresetModal = useCallback(() => {
    showPresetModal(true);
  }, []);
  const handleShowExportModal = useCallback(() => {
    showExportModal(true);
  }, []);
  const handleShowDocModal = useCallback(() => {
    if (isProUser) {
      showDocModal(true);
    } else {
      showUpgradeModal(true);
    }
  }, [isProUser]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton tooltip={t('tools')} aria-label={t('tools')} size="small" icon={<Tools />} />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top">
            <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowPresetModal}>{t('loadFromFileOrPreset')}</DropdownMenu.Item>
            <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowExportModal}>{t('exportToFile')}</DropdownMenu.Item>
            <DropdownMenu.Item disabled={editProhibited} onSelect={handleShowDocModal}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
              }}
              >
                Generate documentation
                <ProBadge compact campaign="tools-dropdown" />
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      {exportModalVisible && <ExportModal onClose={handleCloseExportModal} />}
      {presetModalVisible && <PresetModal onClose={handleClosePresetModal} />}
      {docModalVisible && <LivingDocumentationModal isOpen onClose={handleCloseDocModal} />}
      {!upgradeModalVisible && (
        <UpgradeToProModal
          isOpen
          onClose={handleCloseUpgradeModal}
          feature="documentation-feature"
          title="Upgrade to Pro"
          image={generateDocumentationImage}
          description="Generate documentation is a Pro feature that automatically creates comprehensive design system documentation from your tokens."
        />
      )}
    </>
  );
}
