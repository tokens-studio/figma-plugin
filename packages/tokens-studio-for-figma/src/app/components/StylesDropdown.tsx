import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, Button } from '@tokens-studio/ui';
import useTokens from '../store/useTokens';

import { editProhibitedSelector, themeOptionsSelector } from '@/selectors';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const {
    pullStyles, pullVariables, createStylesFromTokens, syncStyles, createVariables, syncVariables,
  } = useTokens();
  const { t } = useTranslation(['tokens']);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="invisible" size="small" asDropdown>
          {t('stylesAndVariables')}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="top">
        <DropdownMenu.Item textValue="Create variables" disabled={availableThemes.length < 1} onSelect={createVariables}>{t('createVariables')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Sync variables" disabled={availableThemes.length < 1} onSelect={syncVariables}>{t('syncVariables')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Import variables" disabled={editProhibited} onSelect={pullVariables}>{t('importVariables')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Sync styles" disabled={availableThemes.length < 1} onSelect={syncStyles}>{t('syncStyles')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>{t('importStyles')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Create styles" onSelect={createStylesFromTokens}>{t('createStyles')}</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
