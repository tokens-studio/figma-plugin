import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import IconChevronDown from '@/icons/chevrondown.svg';
import useTokens from '../store/useTokens';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from './DropdownMenu';
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
      <DropdownMenuTrigger>
        <span>
          {t('stylesAndVariables')}
        </span>
        <Box css={{ flexShrink: 0 }}>
          <IconChevronDown />
        </Box>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuItem textValue="Create variables" disabled={availableThemes.length < 1} onSelect={createVariables}>{t('createVariables')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Sync variables" disabled={availableThemes.length < 1} onSelect={syncVariables}>{t('syncVariables')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Sync styles" disabled={availableThemes.length < 1} onSelect={syncStyles}>{t('syncStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>{t('importStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Create styles" onSelect={createStylesFromTokens}>{t('createStyles')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
