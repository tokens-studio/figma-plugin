import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo } from 'react';
import { Dispatch } from '@/app/store';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../DropdownMenu';
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
      <DropdownMenuTrigger
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
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuRadioGroup value={currentLang} onValueChange={handleValueChange}>
          {languages.map((lang) => (

            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              data-testid="apply-to-selection"
            >
              {lang.title}
            </DropdownMenuRadioItem>
          ))}

        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
