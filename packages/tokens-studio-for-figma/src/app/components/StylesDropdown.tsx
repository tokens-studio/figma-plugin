/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, Button } from '@tokens-studio/ui';
import useTokens from '../store/useTokens';

import { editProhibitedSelector, themeOptionsSelector } from '@/selectors';
import ManageStylesAndVariables from './ManageStylesAndVariables/ManageStylesAndVariables';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const {
    pullStyles, pullVariables,
  } = useTokens();
  const { t } = useTranslation(['tokens']);

  const [showManageStylesAndVariables, setShowManageStylesAndVariables] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="invisible" size="small" asDropdown>
            {t('stylesAndVariables')}
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content side="top">
          <DropdownMenu.Item textValue="Import variables" disabled={editProhibited} onSelect={pullVariables}>{t('importVariables')}</DropdownMenu.Item>
          <DropdownMenu.Item textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>{t('importStyles')}</DropdownMenu.Item>
          <DropdownMenu.Item textValue="Export styles & variables" onSelect={() => setShowManageStylesAndVariables(true)}>{t('exportStylesAndVariables')}</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <ManageStylesAndVariables isOpen={showManageStylesAndVariables} />
    </>
  );
}
