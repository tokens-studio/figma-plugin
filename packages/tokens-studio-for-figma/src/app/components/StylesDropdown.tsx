import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, Button } from '@tokens-studio/ui';
import useTokens from '../store/useTokens';

import { activeTokenSetReadOnlySelector, editProhibitedSelector } from '@/selectors';
import ManageStylesAndVariables from './ManageStylesAndVariables/ManageStylesAndVariables';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const importDisabled = editProhibited || activeTokenSetReadOnly;

  const { pullStyles, pullVariables } = useTokens();
  const { t } = useTranslation(['tokens']);

  const [showModal, setShowModal] = React.useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button size="small" asDropdown>
            {t('stylesAndVariables')}
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="top">
          <DropdownMenu.Item textValue="Export styles & variables" onSelect={handleOpenModal}>{t('exportStylesAndVariables')}</DropdownMenu.Item>
          <DropdownMenu.Item textValue="Import variables" disabled={importDisabled} onSelect={pullVariables}>{t('importVariables')}</DropdownMenu.Item>
          <DropdownMenu.Item textValue="Import styles" disabled={importDisabled} onSelect={pullStyles}>{t('importStyles')}</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <ManageStylesAndVariables showModal={showModal} setShowModal={setShowModal} />
    </>
  );
}
