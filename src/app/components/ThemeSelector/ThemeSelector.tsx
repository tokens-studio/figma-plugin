import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import { activeThemeSelector, themeOptionsSelector } from '@/selectors';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
} from '../DropdownMenu';
import { Flex } from '../Flex';
import Text from '../Text';
import { styled } from '@/stitches.config';
import IconToggleableDisclosure from '@/app/components/IconToggleableDisclosure';
import { Dispatch } from '@/app/store';

const ThemeDropdownLabel = styled(Text, {
  marginRight: '$2',
});

export const ThemeSelector: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);

  const handleClearTheme = useCallback(() => {
    dispatch.tokenState.setActiveTheme(null);
  }, [dispatch]);

  const handleSelectTheme = useCallback((themeId: string) => {
    dispatch.tokenState.setActiveTheme((activeTheme === themeId) ? null : themeId);
  }, [dispatch, activeTheme]);

  const handleManageThemes = useCallback(() => {
    dispatch.uiState.setManageThemesModalOpen(true);
  }, [dispatch]);

  const activeThemeLabel = useMemo(() => {
    if (activeTheme) {
      const themeOption = availableThemes.find(({ value }) => value === activeTheme);
      return themeOption ? themeOption.label : 'Unknown';
    }
    return 'None';
  }, [activeTheme, availableThemes]);

  const availableThemeOptions = useMemo(() => (
    availableThemes.map(({ label, value }) => {
      const handleSelect = () => handleSelectTheme(value);

      return (
        <DropdownMenuRadioItem
          key={value}
          value={value}
          data-cy={`themeselector--themeoptions--${value}`}
          // @README we can disable this because we are using Memo for the whole list anyways
          // eslint-disable-next-line react/jsx-no-bind
          onSelect={handleSelect}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          {label}
        </DropdownMenuRadioItem>
      );
    })
  ), [availableThemes, handleSelectTheme]);

  return (
    <Flex alignItems="center" css={{ flexShrink: 0 }}>
      <DropdownMenu>
        <DropdownMenuTrigger data-cy="themeselector-dropdown">
          <Flex>
            <ThemeDropdownLabel muted size="small">Theme:</ThemeDropdownLabel>
            <Text size="small">{activeThemeLabel}</Text>
          </Flex>
          <IconToggleableDisclosure />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" css={{ minWidth: '180px' }}>
          <DropdownMenuRadioGroup value={activeTheme ?? ''}>
            {availableThemes.length === 0 && (
              <DropdownMenuRadioItem value="" disabled={!activeTheme} onSelect={handleClearTheme}>
                <Text>No themes</Text>
              </DropdownMenuRadioItem>
            )}
            {availableThemeOptions}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-cy="themeselector-managethemes"
            css={{ paddingLeft: '$6', fontSize: '$small' }}
            onSelect={handleManageThemes}
          >
            Manage themes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
};
