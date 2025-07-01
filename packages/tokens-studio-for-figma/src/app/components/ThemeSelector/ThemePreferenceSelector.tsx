import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Label, Select, Stack,
} from '@tokens-studio/ui';
import { Dispatch } from '@/app/store';
import { themePreferenceSelector } from '@/selectors';

export function ThemePreferenceSelector() {
  const { t } = useTranslation(['settings']);
  const dispatch = useDispatch<Dispatch>();
  const themePreference = useSelector(themePreferenceSelector);

  const handleThemeChange = useCallback((value: string) => {
    dispatch.settings.setThemePreference(value as 'auto' | 'light' | 'dark');
  }, [dispatch]);

  const themeOptions = [
    { value: 'auto', label: t('themeAuto', 'Auto (Follow Figma)') },
    { value: 'light', label: t('themeLight', 'Light') },
    { value: 'dark', label: t('themeDark', 'Dark') },
  ];

  const displayTheme = themeOptions.find((option) => option.value === themePreference)?.label;

  return (
    <Stack direction="row" justify="between" align="center" gap={4} css={{ width: '100%' }}>
      <Label htmlFor="theme-selector">{t('theme', 'Theme')}</Label>
      <Select
        value={themePreference}
        onValueChange={handleThemeChange}
      >
        <Select.Trigger value={displayTheme} data-testid="choose-theme" />
        <Select.Content>
          {themeOptions.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Stack>
  );
}
