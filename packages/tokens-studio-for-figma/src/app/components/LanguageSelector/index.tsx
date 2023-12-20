import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import { Select } from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { Dispatch } from '@/app/store';

import { languages } from '@/i18n';
import { languageSelector } from '@/selectors';
import { track } from '@/utils/analytics';

export const LanguageSelector = () => {
  const { t } = useTranslation(['settings']);
  const dispatch = useDispatch<Dispatch>();

  const currentLang = useSelector(languageSelector);
  const displayLang = useMemo(() => languages.find((l) => l.code === currentLang)?.title, [currentLang]);

  const handleValueChange = React.useCallback(
    (value: string) => {
      track('setLanguage', { value });
      dispatch.settings.setLanguage(value);
    },
    [dispatch.settings],
  );

  return (
    <Select value={currentLang} onValueChange={handleValueChange}>
      <Select.Trigger value={displayLang} label={t('language')} data-testid="choose-language" />
      <Select.Content>
        {languages.map((lang) => (
          <Select.Item key={lang.code} value={lang.code}>
            {lang.title}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
