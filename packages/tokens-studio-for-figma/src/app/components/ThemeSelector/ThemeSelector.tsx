import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, NavArrowRight } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, Button } from '@tokens-studio/ui';
import { activeThemeSelector, themeOptionsSelector, themesListSelector } from '@/selectors';
import Text from '../Text';
import { Dispatch } from '@/app/store';
import ProBadge from '../ProBadge';
import { track } from '@/utils/analytics';
import { INTERNAL_THEMES_NO_GROUP, INTERNAL_THEMES_NO_GROUP_LABEL } from '@/constants/InternalTokenGroup';
import Box from '../Box';
import { useIsProUser } from '@/app/hooks/useIsProUser';

type AvailableTheme = {
  value: string
  label: string
  group?: string
};

export const ThemeSelector: React.FC<React.PropsWithChildren<React.PropsWithChildren<unknown>>> = () => {
  const isProUser = useIsProUser();
  const dispatch = useDispatch<Dispatch>();
  const { t } = useTranslation(['tokens']);
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const allThemes = useSelector(themesListSelector);
  const groupNames = useMemo(() => ([...new Set(availableThemes.map((theme) => theme.group || INTERNAL_THEMES_NO_GROUP))]), [availableThemes]);

  const handleClearTheme = useCallback(() => {
    dispatch.tokenState.setActiveTheme({ newActiveTheme: {}, shouldUpdateNodes: true });
  }, [dispatch]);

  const handleSelectTheme = useCallback((themeId: string) => {
    const groupOfTheme = availableThemes.find((theme) => theme.value === themeId)?.group ?? INTERNAL_THEMES_NO_GROUP;
    const selectedTheme = allThemes.find((theme) => theme.id === themeId);
    const nextTheme = { ...activeTheme };

    console.log('=== THEME SELECTION DEBUG ===');
    console.log('Selected theme ID:', themeId);
    console.log('Selected theme object:', selectedTheme);
    console.log('Is extension?', selectedTheme?.$figmaIsExtension);
    console.log('Parent collection ID:', selectedTheme?.$figmaParentCollectionId);
    console.log('Own collection ID:', selectedTheme?.$figmaCollectionId);
    console.log('Current active themes:', activeTheme);

    // Check if we're toggling off the theme
    const isTogglingOff = typeof nextTheme[groupOfTheme] !== 'undefined' && nextTheme[groupOfTheme] === themeId;

    if (isTogglingOff) {
      delete nextTheme[groupOfTheme];
    } else {
      // We're activating a theme - check for parent/extended relationships
      nextTheme[groupOfTheme] = themeId;

      // If this is an extended theme, deactivate its parent collection's themes
      if (selectedTheme?.$figmaIsExtension && selectedTheme.$figmaParentCollectionId) {
        console.log('This is an EXTENDED theme, looking for parent themes to deactivate...');
        // Find all themes with the parent collection ID
        const parentThemes = allThemes.filter(
          (t) => t.$figmaCollectionId === selectedTheme.$figmaParentCollectionId && !t.$figmaIsExtension
        );
        console.log('Found parent themes:', parentThemes.map(t => ({ id: t.id, name: t.name, collectionId: t.$figmaCollectionId })));

        // Deactivate all parent collection themes from any group
        for (const [group, activeThemeId] of Object.entries(nextTheme)) {
          if (parentThemes.some((pt) => pt.id === activeThemeId)) {
            console.log(`Deactivating parent theme ${activeThemeId} from group ${group}`);
            delete nextTheme[group];
          }
        }
      }

      // If this is a parent theme, deactivate any active extended collection themes that extend it
      if (selectedTheme?.$figmaCollectionId && !selectedTheme.$figmaIsExtension) {
        console.log('This is a PARENT theme, looking for extended themes to deactivate...');
        // Find all extended themes that have this as their parent
        const extendedThemes = allThemes.filter(
          (t) => t.$figmaIsExtension && t.$figmaParentCollectionId === selectedTheme.$figmaCollectionId
        );
        console.log('Found extended themes:', extendedThemes.map(t => ({ id: t.id, name: t.name, parentCollectionId: t.$figmaParentCollectionId })));

        // Deactivate all extended themes from any group
        for (const [group, activeThemeId] of Object.entries(nextTheme)) {
          if (extendedThemes.some((et) => et.id === activeThemeId)) {
            console.log(`Deactivating extended theme ${activeThemeId} from group ${group}`);
            delete nextTheme[group];
          }
        }
      }
    }

    console.log('Final active themes:', nextTheme);
    console.log('=== END DEBUG ===');

    if (Object.keys(nextTheme).length > 0) {
      track('Apply theme', { id: nextTheme });
    } else {
      track('Reset theme');
    }
    dispatch.tokenState.setActiveTheme({ newActiveTheme: nextTheme, shouldUpdateNodes: true });
  }, [dispatch, activeTheme, availableThemes, allThemes]);

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
          <Check />
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
                <Text css={{ color: '$fgMuted', padding: '$2 $3' }}>{groupName === INTERNAL_THEMES_NO_GROUP ? INTERNAL_THEMES_NO_GROUP_LABEL : groupName}</Text>
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
        <Button variant="invisible" asDropdown css={{ flexShrink: 1, overflow: 'hidden' }}>
          <Box css={{
            marginRight: '$2',
            color: '$fgMuted',
            fontWeight: '$sansRegular',
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
          css={{ minWidth: '180px', maxWidth: '70vw' }}
          align="end"
          className="content scroll-container"
        >
          <DropdownMenu.Item
            data-testid="themeselector-managethemes"
            css={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            disabled={!isProUser}
            onSelect={handleManageThemes}
          >
            <span>{t('manageThemes')}</span>
            {!isProUser && <ProBadge campaign="manage-themes" compact />}
            <DropdownMenu.TrailingVisual>
              <NavArrowRight />
            </DropdownMenu.TrailingVisual>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          {availableThemes.length === 0 && (
            <DropdownMenu.RadioItem css={{ paddingLeft: '$6' }} value="" disabled={!activeTheme} onSelect={handleClearTheme}>
              <Text css={{ color: '$fgDisabled', fontSize: '$xsmall' }}>{t('noThemes')}</Text>
            </DropdownMenu.RadioItem>
          )}
          {availableThemeOptions}

        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};
