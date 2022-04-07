import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import { activeThemeSelector, themeIdentifiersSelector } from '@/selectors';
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
  const availableThemes = useSelector(themeIdentifiersSelector);

  const handleClearTheme = useCallback(() => {
    dispatch.tokenState.setActiveTheme(null);
  }, [dispatch]);

  const handleSelectTheme = useCallback((themeId: string) => {
    dispatch.tokenState.setActiveTheme(themeId);
  }, [dispatch]);

  const handleManageThemes = useCallback(() => {
    dispatch.uiState.setManageThemesModalOpen(true);
  }, [dispatch]);

  const activeThemeLabel = useMemo(() => {
    if (activeTheme) return activeTheme;
    return 'None';
  }, [activeTheme]);

  const availableThemeOptions = useMemo(() => (
    availableThemes.map((themeId) => {
      const handleSelect = () => handleSelectTheme(themeId);

      return (
        <DropdownMenuRadioItem
          key={themeId}
          value={themeId}
          onSelect={handleSelect}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          {themeId}
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
