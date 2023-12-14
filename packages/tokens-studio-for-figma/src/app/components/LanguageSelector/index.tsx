import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import { DropdownMenu } from '@tokens-studio/ui';
import { Dispatch } from '@/app/store';

import { IconChevronDown } from '@/icons';
import { languages } from '@/i18n';
import { languageSelector } from '@/selectors';
import { track } from '@/utils/analytics';

export const LanguageSelector = () => {
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
    <DropdownMenu>
      <DropdownMenu.Trigger
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '$fgMuted',
          '&:hover, &:focus-visible': { backgroundColor: '$bgSubtle' },
        }}
        data-testid="choose-language"
      >
        {displayLang}
        <IconChevronDown />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="top">
        <DropdownMenu.RadioGroup value={currentLang} onValueChange={handleValueChange}>
          {languages.map((lang) => (

            <DropdownMenu.RadioItem
              key={lang.code}
              value={lang.code}
              data-testid="apply-to-selection"
            >
              {lang.title}
            </DropdownMenu.RadioItem>
          ))}

        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
