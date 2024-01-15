import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, Button } from '@tokens-studio/ui';
import { activeThemeSelector, themeOptionsSelector } from '@/selectors';

import Text from '../Text';
import { Dispatch } from '@/app/store';
import ProBadge from '../ProBadge';
import { useFlags } from '../LaunchDarkly';
import { track } from '@/utils/analytics';
import { INTERNAL_THEMES_NO_GROUP, INTERNAL_THEMES_NO_GROUP_LABEL } from '@/constants/InternalTokenGroup';
import Box from '../Box';

type AvailableTheme = {
  value: string
  label: string
  group?: string
};

export const ThemeSelector: React.FC<React.PropsWithChildren<React.PropsWithChildren<unknown>>> = () => {
  const { tokenThemes } = useFlags();
  const dispatch = useDispatch<Dispatch>();
  const { t } = useTranslation(['tokens']);
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const groupNames = useMemo(() => ([...new Set(availableThemes.map((theme) => theme.group || INTERNAL_THEMES_NO_GROUP))]), [availableThemes]);

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
      <DropdownMenu.RadioItem
        key={value}
        value={value}
        data-testid={`themeselector--themeoptions--${value}`}
        // @README we can disable this because we are using Memo for the whole list anyways
        // eslint-disable-next-line react/jsx-no-bind
        onSelect={handleSelect}
      >
        <DropdownMenu.ItemIndicator>
          <CheckIcon />
        </DropdownMenu.ItemIndicator>
        {label}
      </DropdownMenu.RadioItem>
    );
  }), [handleSelectTheme]);

  const availableThemeOptions = useMemo(() => (
    <Box className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
      {
        groupNames.map((groupName) => {
          const filteredThemes = groupName === INTERNAL_THEMES_NO_GROUP ? availableThemes.filter((theme) => (typeof theme?.group === 'undefined')) : availableThemes.filter((theme) => (theme?.group === groupName));
          return (
            filteredThemes.length > 0 && (
              <DropdownMenu.RadioGroup key={groupName} value={typeof activeTheme[groupName] !== 'undefined' ? activeTheme[groupName] : ''}>
                <Text css={{ color: '$fgSubtle', padding: '$2 $3' }}>{groupName === INTERNAL_THEMES_NO_GROUP ? INTERNAL_THEMES_NO_GROUP_LABEL : groupName}</Text>
                {
                  renderThemeOption(filteredThemes)
                }
              </DropdownMenu.RadioGroup>
            )
          );
        })
      }
    </Box>
  ), [availableThemes, groupNames, activeTheme, renderThemeOption]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild data-testid="themeselector-dropdown">
        <Button size="small" variant="invisible" asDropdown css={{ flexShrink: 1, overflow: 'hidden' }}>
          <Box css={{
            marginRight: '$2',
            color: '$fgSubtle',
          }}
          >
            {t('theme')}
            :
          </Box>
          {activeThemeLabel}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          data-testid="themeselector-dropdown-content"
          side="bottom"
          css={{ minWidth: '180px' }}
        >
          {availableThemes.length === 0 && (
          <DropdownMenu.RadioItem css={{ paddingLeft: '$6' }} value="" disabled={!activeTheme} onSelect={handleClearTheme}>
            <Text css={{ color: '$contextMenuFgMuted', fontSize: '$xsmall' }}>{t('noThemes')}</Text>
          </DropdownMenu.RadioItem>
          )}
          {availableThemeOptions}
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            data-testid="themeselector-managethemes"
            css={{
              paddingLeft: '$7', display: 'flex', justifyContent: 'space-between',
            }}
            disabled={!tokenThemes}
            onSelect={handleManageThemes}
          >
            <span>{t('manageThemes')}</span>
            {!tokenThemes && <ProBadge compact />}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};