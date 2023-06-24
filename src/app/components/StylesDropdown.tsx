import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import IconChevronDown from '@/icons/chevrondown.svg';
import useTokens from '../store/useTokens';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from './DropdownMenu';
import { editProhibitedSelector, themeOptionsSelector } from '@/selectors';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const { t } = useTranslation('');
  const {
    pullStyles, createStylesFromTokens, syncStyles, createVariables,
  } = useTokens();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span>
          {t('tokens.styles')}
        </span>
        <IconChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuItem textValue="Sync styles" disabled={availableThemes.length < 1} onSelect={syncStyles}>{t('tokens.syncStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>{t('tokens.importStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Create styles" onSelect={createStylesFromTokens}>{t('tokens.createStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue="Create Variables" onSelect={createVariables}>{t('tokens.createVariables')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
