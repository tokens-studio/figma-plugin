import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  themesListSelector,
} from '@/selectors';

export default function useExportThemesTab() {
  const { t } = useTranslation(['manageStylesAndVariables']);
  const themes = useSelector(themesListSelector);

  const [selectedThemes, setSelectedThemes] = React.useState<string[]>(themes.map((theme) => theme.id));

  return {
    selectedThemes,
    setSelectedThemes,
  };
}
