import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Heading, Tabs, Box, Stack, Checkbox, Label,
} from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { StyledCard } from './StyledCard';
import {
  themesListSelector,
} from '@/selectors';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { ThemeObject } from '@/types';
import { LabelledCheckbox } from './LabelledCheckbox';
import { SearchInputWithToggle } from '../SearchInputWithToggle';

function getHierarchicalThemes(themes: ThemeObject[]): ThemeObject[] {
  const themesById = new Map(themes.map((t) => [t.id, t]));
  const childrenByParent = new Map<string, string[]>();
  const roots: string[] = [];

  themes.forEach((t) => {
    if (t.$figmaParentThemeId && themesById.has(t.$figmaParentThemeId)) {
      const children = childrenByParent.get(t.$figmaParentThemeId) || [];
      children.push(t.id);
      childrenByParent.set(t.$figmaParentThemeId, children);
    } else {
      roots.push(t.id);
    }
  });

  const result: ThemeObject[] = [];
  function pushWithChildren(id: string) {
    const theme = themesById.get(id);
    if (theme) {
      result.push(theme);
      const children = childrenByParent.get(id) || [];
      children.forEach(pushWithChildren);
    }
  }

  roots.forEach(pushWithChildren);
  return result;
}

export default function ExportThemesTab({ selectedThemes, setSelectedThemes }: { selectedThemes: string[], setSelectedThemes: (themes: string[]) => void }) {
  const { t } = useTranslation(['manageStylesAndVariables']);
  const themes = useSelector(themesListSelector);
  const isProUser = useIsProUser();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleSearch = useCallback(() => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchTerm('');
    }
  }, [isSearchActive]);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filteredThemes = useMemo(() => {
    if (!searchTerm || !isSearchActive) {
      return themes;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return themes.filter((theme) => theme.name.toLowerCase().includes(lowerSearchTerm)
      || (theme.group && theme.group.toLowerCase().includes(lowerSearchTerm)));
  }, [themes, searchTerm, isSearchActive]);

  const ThemeGroups = React.useMemo(() => {
    const uniqueGroups: string[] = filteredThemes.reduce((unique: string[], theme) => {
      if (theme.group && !unique.includes(theme.group)) {
        unique.push(theme.group);
      }
      return unique;
    }, []);
    return uniqueGroups;
  }, [filteredThemes]);

  const ungroupedThemes = React.useMemo(() => filteredThemes.filter((theme) => !theme.group), [filteredThemes]);

  const excludedSelectedThemesCount = useMemo(() => {
    if (!isSearchActive || !searchTerm) {
      return 0;
    }
    const filteredThemeIds = new Set(filteredThemes.map((theme) => theme.id));
    return selectedThemes.filter((themeId) => !filteredThemeIds.has(themeId)).length;
  }, [selectedThemes, filteredThemes, isSearchActive, searchTerm]);

  const handleSelectTheme = React.useCallback((themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter((id) => id !== themeId));
    } else {
      setSelectedThemes([...selectedThemes, themeId]);
    }
  }, [selectedThemes, setSelectedThemes]);

  const handleSelectAllThemes = React.useCallback(() => {
    // When filtering, select/deselect all visible (filtered) themes
    const themesToToggle = filteredThemes;
    const allFilteredSelected = themesToToggle.every((theme) => selectedThemes.includes(theme.id));

    if (allFilteredSelected) {
      // Deselect all filtered themes
      setSelectedThemes(selectedThemes.filter((id) => !themesToToggle.some((theme) => theme.id === id)));
    } else {
      // Select all filtered themes (add to existing selection)
      const newSelection = [...selectedThemes];
      themesToToggle.forEach((theme) => {
        if (!newSelection.includes(theme.id)) {
          newSelection.push(theme.id);
        }
      });
      setSelectedThemes(newSelection);
    }
  }, [filteredThemes, selectedThemes, setSelectedThemes]);

  const themesById = useMemo(() => new Map(themes.map((t) => [t.id, t])), [themes]);

  function createThemeRow(theme: ThemeObject) {
    let depth = 0;
    let currentId = theme.id;
    while (true) {
      const t = themesById.get(currentId);
      if (t?.$figmaParentThemeId && themesById.has(t.$figmaParentThemeId)) {
        depth += 1;
        currentId = t.$figmaParentThemeId;
      } else {
        break;
      }
    }

    return (
      <Stack
        gap={3}
        key={theme.id}
        direction="row"
        align="center"
        css={{ paddingLeft: depth ? `$${depth * 4}` : undefined }}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <LabelledCheckbox id={theme.id} checked={selectedThemes.includes(theme.id)} onChange={() => handleSelectTheme(theme.id)} label={theme.name} />
        {/* TODO: Add theme details */}
        {/* <ThemeDetails /> */}
        {/* <IconButton variant="invisible" size="small" tooltip="Details" icon={<ChevronRightIcon />} /> */}
      </Stack>
    );
  }

  return (
    <Tabs.Content value="useThemes">
      {themes.length === 0 ? (
        <StyledCard>
          <Stack direction="column" align="start" gap={4}>
            {isProUser ? (
              <>
                <Heading size="medium">{t('exportThemesTab.headingPro')}</Heading>
                <p>{t('exportThemesTab.introPro')}</p>
                {/* Commenting out until we have docs <Link target="_blank" href={docsLinks.themes}>
                  {' '}
                  {t('generic.learnMore')}
                  {' – '}
                  {t('generic.themes')}
                </Link> */}
              </>
            ) : (
              <>
                <Heading size="medium">{t('exportThemesTab.headingBasic')}</Heading>
                <p>{t('exportThemesTab.introBasic')}</p>
                {/* Commenting out until we have docs <Link target="_blank" href={docsLinks.themes}>
                  {t('generic.learnMore')}
                  {' – '}
                  {t('generic.themes')}
                </Link> */}
                <Box css={{
                  alignSelf: 'flex-end',
                }}
                >
                  <Button variant="secondary" size="small">{t('actions.getPRO')}</Button>
                </Box>
              </>
            )}
          </Stack>
 
        </StyledCard>
      ) : (
        <StyledCard>
          <Stack direction="column" align="start" gap={4}>
            <Stack direction="row" justify="between" align="center" css={{ width: '100%' }}>
              {!isSearchActive && (
                <Heading>{t('exportThemesTab.confirmThemes')}</Heading>
              )}
              <SearchInputWithToggle
                isSearchActive={isSearchActive}
                searchTerm={searchTerm}
                onToggleSearch={handleToggleSearch}
                onSearchTermChange={handleSearchTermChange}
                placeholder={t('searchThemes')}
                tooltip={t('searchThemes')}
                autofocus
              />
            </Stack>
            <p>{t('exportThemesTab.combinationsOfSetsMakeThemes')}</p>
            <Stack direction="column" width="full" gap={4}>
              <Stack direction="row" gap={3} align="center">
                <Checkbox id="check-all-themes" checked={filteredThemes.length > 0 && filteredThemes.every((theme) => selectedThemes.includes(theme.id))} onCheckedChange={handleSelectAllThemes} />
                <Label htmlFor="check-all-themes">{t('generic.selectAll')}</Label>
              </Stack>
              {filteredThemes.length === 0 && isSearchActive && searchTerm ? (
                <Box css={{ padding: '$4', textAlign: 'center', color: '$fgMuted' }}>
                  {t('noThemesFound')}
                </Box>
              ) : (
                <>
                  {ThemeGroups.map((group) => (
                    <Stack direction="column" gap={2} key={group}>
                      <Heading size="small">{group}</Heading>
                      {getHierarchicalThemes(filteredThemes.filter((theme) => theme.group === group)).map((theme) => createThemeRow(theme))}
                    </Stack>
                  ))}
                  {ungroupedThemes.length ? (
                    <Stack direction="column" gap={2}>
                      <Heading size="small">{t('generic.noGroup')}</Heading>
                      {getHierarchicalThemes(ungroupedThemes).map((theme) => createThemeRow(theme))}
                    </Stack>
                  ) : null}
                </>
              )}
            </Stack>
            {excludedSelectedThemesCount > 0 && isSearchActive && (
              <Box css={{ color: '$fgMuted' }}>
                {t('exportThemesTab.otherThemesSelected', { count: excludedSelectedThemesCount })}
              </Box>
            )}
          </Stack>

        </StyledCard>
      )}
    </Tabs.Content>
  );
}
