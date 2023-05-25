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
  ScrollDropdownMenuRadioItem,
  ScrollDropdownMenuItemIndicator,
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
import { INTERNAL_THEMES_NO_GROUP, INTERNAL_THEMES_NO_GROUP_LABEL } from '@/constants/InternalTokenGroup';
import Box from '../Box';

const ThemeDropdownLabel = styled(Text, {
  marginRight: '$2',
});

type AvailableTheme = {
  value: string
  label: string
  group?: string
};

export const ThemeSelector: React.FC = () => {
  const { tokenThemes } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const groupNames = useMemo(() => ([...new Set(availableThemes.map((t) => t.group || INTERNAL_THEMES_NO_GROUP))]), [availableThemes]);

  const handleClearTheme = useCallback(() => {
    dispatch.tokenState.setActiveTheme({ newActiveTheme: {}, shouldUpdateNodes: true });
  }, [dispatch]);

  const handleSelectTheme = useCallback((themeId: string) => {
    const groupOfTheme = availableThemes.find((theme) => theme.value === themeId)?.group ?? INTERNAL_THEMES_NO_GROUP;
    const nextTheme = activeTheme;
    if (typeof nextTheme[groupOfTheme] !== 'undefined' && nextTheme[groupOfTheme] === themeId) {
      delete nextTheme[groupOfTheme];
    } else {
      nextTheme[groupOfTheme] = themeId;
    }
    if (nextTheme) {
      track('Apply theme', { id: nextTheme });
    } else {
      track('Reset theme');
    }
    dispatch.tokenState.setActiveTheme({ newActiveTheme: nextTheme, shouldUpdateNodes: true });
  }, [dispatch, activeTheme, availableThemes]);

  const handleManageThemes = useCallback(() => {
    dispatch.uiState.setManageThemesModalOpen(true);
  }, [dispatch]);

  const activeThemeLabel = useMemo(() => {
    if (activeTheme) {
      if (Object.keys(activeTheme).length === 0) return 'None';
      if (Object.keys(activeTheme).length === 1) {
        const themeOption = availableThemes.find(({ value }) => value === Object.values(activeTheme)[0]);
        return themeOption ? themeOption.label : 'Unknown';
      }
      return `${Object.keys(activeTheme).length} active`;
    }
    return 'None';
  }, [activeTheme, availableThemes]);

  const renderThemeOption = useCallback((themes: AvailableTheme[]) => themes.map(({ label, value }) => {
    const handleSelect = () => handleSelectTheme(value);
    return (
      <ScrollDropdownMenuRadioItem
        key={value}
        value={value}
        data-cy={`themeselector--themeoptions--${value}`}
        data-testid={`themeselector--themeoptions--${value}`}
          // @README we can disable this because we are using Memo for the whole list anyways
          // eslint-disable-next-line react/jsx-no-bind
        onSelect={handleSelect}
      >
        <Box css={{ width: '$5', marginRight: '$2' }}>
          <ScrollDropdownMenuItemIndicator>
            <CheckIcon />
          </ScrollDropdownMenuItemIndicator>
        </Box>
        <Box>
          {label}
        </Box>
      </ScrollDropdownMenuRadioItem>
    );
  }), [handleSelectTheme]);

  const availableThemeOptions = useMemo(() => (
    <Box className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
      {
        groupNames.map((groupName) => {
          const filteredThemes = groupName === INTERNAL_THEMES_NO_GROUP ? availableThemes.filter((t) => (typeof t?.group === 'undefined')) : availableThemes.filter((t) => (t?.group === groupName));
          return (
            filteredThemes.length > 0 && (
            <DropdownMenuRadioGroup value={typeof activeTheme[groupName] !== 'undefined' ? activeTheme[groupName] : ''}>
              <Text css={{ color: '$staticTextMuted', padding: '$2 $3' }}>{groupName === INTERNAL_THEMES_NO_GROUP ? INTERNAL_THEMES_NO_GROUP_LABEL : groupName}</Text>
              {
                renderThemeOption(filteredThemes)
              }
            </DropdownMenuRadioGroup>
            )
          );
        })
      }
    </Box>
  ), [availableThemes, groupNames, activeTheme, renderThemeOption]);

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
          {availableThemes.length === 0 && (
            <ScrollDropdownMenuRadioItem value="" disabled={!activeTheme} onSelect={handleClearTheme}>
              <Text>No themes</Text>
            </ScrollDropdownMenuRadioItem>
          )}
          {availableThemeOptions}
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
