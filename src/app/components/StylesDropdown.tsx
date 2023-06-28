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
  const { t } = useTranslation(['tokens']);
  const {
    pullStyles, createStylesFromTokens, syncStyles, createVariables,
  } = useTokens();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span>
          {t('styles')}
        </span>
        <IconChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuItem textValue={t('syncStyles')} disabled={availableThemes.length < 1} onSelect={syncStyles}>{t('syncStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue={t('importStyles')} disabled={editProhibited} onSelect={pullStyles}>{t('importStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue={t('createStyles')} onSelect={createStylesFromTokens}>{t('createStyles')}</DropdownMenuItem>
        <DropdownMenuItem textValue={t('createVariables')} onSelect={createVariables}>{t('createVariables')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
