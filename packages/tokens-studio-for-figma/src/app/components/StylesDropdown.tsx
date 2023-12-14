import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@tokens-studio/ui';
import IconChevronDown from '@/icons/chevrondown.svg';
import useTokens from '../store/useTokens';

import { editProhibitedSelector, themeOptionsSelector } from '@/selectors';
import Box from './Box';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const {
    pullStyles, createStylesFromTokens, syncStyles, createVariables, syncVariables,
  } = useTokens();
  const { t } = useTranslation(['tokens']);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <span>
          {t('stylesAndVariables')}
        </span>
        <Box css={{ flexShrink: 0 }}>
          <IconChevronDown />
        </Box>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="top">
        <DropdownMenu.Item textValue="Create variables" disabled={availableThemes.length < 1} onSelect={createVariables}>{t('createVariables')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Sync variables" disabled={availableThemes.length < 1} onSelect={syncVariables}>{t('syncVariables')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Sync styles" disabled={availableThemes.length < 1} onSelect={syncStyles}>{t('syncStyles')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>{t('importStyles')}</DropdownMenu.Item>
        <DropdownMenu.Item textValue="Create styles" onSelect={createStylesFromTokens}>{t('createStyles')}</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
