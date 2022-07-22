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
import ProBadge from '../ProBadge';
import { useFlags } from '../LaunchDarkly';
import { track } from '@/utils/analytics';

const ThemeDropdownLabel = styled(Text, {
  marginRight: '$2',
});

export const ThemeSelector: React.FC = () => {
  const { tokenThemes } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);

  const handleClearTheme = useCallback(() => {
    dispatch.tokenState.setActiveTheme(null);
  }, [dispatch]);

  const handleSelectTheme = useCallback((themeId: string) => {
    const nextTheme = (activeTheme === themeId) ? null : themeId;
    if (nextTheme) {
      track('Apply theme', { id: nextTheme });
    } else {
      track('Reset theme');
    }
    dispatch.tokenState.setActiveTheme(nextTheme);
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
          data-testid={`themeselector--themeoptions--${value}`}
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
        <DropdownMenuTrigger data-cy="themeselector-dropdown" data-testid="themeselector-dropdown">
          <Flex>
            <ThemeDropdownLabel muted size="small">Theme:</ThemeDropdownLabel>
            <Text size="small">{activeThemeLabel}</Text>
          </Flex>
          <IconToggleableDisclosure />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-testid="themeselector-dropdown-content"
          side="bottom"
          css={{ minWidth: '180px' }}
        >
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
            css={{
              paddingLeft: '$6', fontSize: '$small', display: 'flex', justifyContent: 'space-between',
            }}
            disabled={!tokenThemes}
            onSelect={handleManageThemes}
          >
            <span>Manage themes</span>
            {!tokenThemes && <ProBadge compact />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
};
