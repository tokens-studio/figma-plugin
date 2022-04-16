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
import { IconToggleableDisclosure } from '../icons/IconToggleableDisclosure';
import { Dispatch } from '@/app/store';

const ThemeDropdownLabel = styled(Text, {
  marginRight: '$2',
});

type Props = {
};

export const ThemeSelector: React.FC<Props> = () => {
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
    <Flex alignItems="center">
      <DropdownMenu>
        <DropdownMenuTrigger>
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
                <Text muted>No themes</Text>
              </DropdownMenuRadioItem>
            )}
            {availableThemeOptions}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
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
