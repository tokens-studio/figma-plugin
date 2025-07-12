import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, Button } from '@tokens-studio/ui';
import useTokens from '../store/useTokens';

import { activeTokenSetReadOnlySelector, editProhibitedSelector, themesListSelector } from '@/selectors';
import ManageStylesAndVariables from './ManageStylesAndVariables/ManageStylesAndVariables';
import ImportVariablesDialog from './ImportVariablesDialog';
import { useImportVariables } from '../hooks/useImportVariables';
import { useIsProUser } from '../hooks/useIsProUser';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const themes = useSelector(themesListSelector);
  const proUser = useIsProUser();
  const importDisabled = editProhibited || activeTokenSetReadOnly;

  const { pullStyles } = useTokens();
  const { t } = useTranslation(['tokens']);

  const [showModal, setShowModal] = React.useState(false);
  const {
    isDialogOpen,
    collections,
    isLoading,
    openDialog,
    closeDialog,
    importVariables,
  } = useImportVariables();

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);

  const handleImportVariables = useCallback(() => {
    openDialog();
  }, [openDialog]);

  const handleConfirmImport = useCallback((selectedCollections, options) => {
    importVariables(selectedCollections, options, themes, proUser);
  }, [importVariables, themes, proUser]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button size="small" asDropdown>
            {t('stylesAndVariables')}
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top">
            <DropdownMenu.Item textValue="Export styles & variables" onSelect={handleOpenModal}>{t('exportStylesAndVariables')}</DropdownMenu.Item>
            <DropdownMenu.Item textValue="Import variables" disabled={importDisabled || isLoading} onSelect={handleImportVariables}>{t('importVariables')}</DropdownMenu.Item>
            <DropdownMenu.Item textValue="Import styles" disabled={importDisabled} onSelect={pullStyles}>{t('importStyles')}</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      {showModal && <ManageStylesAndVariables showModal={showModal} setShowModal={setShowModal} />}
      <ImportVariablesDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onConfirm={handleConfirmImport}
        collections={collections}
      />
    </>
  );
}
