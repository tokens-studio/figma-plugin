import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Heading, Tabs, Box, Stack, Checkbox, Label,
} from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { StyledCard } from './StyledCard';
import {
  themesListSelector,
  exportExtendedCollectionsSelector,
} from '@/selectors';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { ThemeObject } from '@/types';
import { LabelledCheckbox } from './LabelledCheckbox';
import { SearchInputWithToggle } from '../SearchInputWithToggle';
import { sortThemesForDisplay } from '@/utils/themeListToTree';

function ThemeRow({
  theme,
  selectedThemes,
  descendantsByThemeId,
  onSelect,
}: {
  theme: ThemeObject;
  selectedThemes: string[];
  descendantsByThemeId: Map<string, Set<string>>;
  onSelect: (id: string) => void;
}) {
  const descendants = descendantsByThemeId.get(theme.id) || new Set<string>();
  const isLockedByChild = selectedThemes.includes(theme.id)
    && [...descendants].some((id) => selectedThemes.includes(id));
  const handleChange = React.useCallback(() => onSelect(theme.id), [onSelect, theme.id]);
  return (
    <Stack gap={3} direction="row" align="center">
      <LabelledCheckbox
        id={theme.id}
        checked={selectedThemes.includes(theme.id)}
        onChange={handleChange}
        label={theme.name}
        disabled={isLockedByChild}
      />
    </Stack>
  );
}

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
  const allThemes = useSelector(themesListSelector);
  const exportExtendedCollections = useSelector(exportExtendedCollectionsSelector);
  const themes = useMemo(
    () => (exportExtendedCollections ? allThemes : allThemes.filter((t) => !t.$figmaParentThemeId)),
    [allThemes, exportExtendedCollections],
  );
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

  const sortedFilteredThemes = React.useMemo(() => sortThemesForDisplay(filteredThemes), [filteredThemes]);

  const ThemeGroups = React.useMemo(() => {
    const uniqueGroups: string[] = sortedFilteredThemes.reduce((unique: string[], theme) => {
      if (theme.group && !unique.includes(theme.group)) {
        unique.push(theme.group);
      }
      return unique;
    }, []);
    return uniqueGroups;
  }, [sortedFilteredThemes]);

  // Map each group to its parent group (for extended collections)
  const themeGroupParentMap = React.useMemo(() => {
    const themeById = new Map(sortedFilteredThemes.map((t) => [t.id, t]));
    const map = new Map<string, string | null>();
    ThemeGroups.forEach((group) => {
      const firstInGroup = sortedFilteredThemes.find((t) => (t.group ?? '') === group);
      if (firstInGroup?.$figmaParentThemeId) {
        const parentGroup = themeById.get(firstInGroup.$figmaParentThemeId)?.group ?? null;
        map.set(group, parentGroup);
      } else {
        map.set(group, null);
      }
    });
    return map;
  }, [ThemeGroups, sortedFilteredThemes]);

  const ungroupedThemes = React.useMemo(() => sortedFilteredThemes.filter((theme) => !theme.group), [sortedFilteredThemes]);

  const excludedSelectedThemesCount = useMemo(() => {
    if (!isSearchActive || !searchTerm) {
      return 0;
    }
    const filteredThemeIds = new Set(filteredThemes.map((theme) => theme.id));
    return selectedThemes.filter((themeId) => !filteredThemeIds.has(themeId)).length;
  }, [selectedThemes, filteredThemes, isSearchActive, searchTerm]);

  // Build a map from themeId → parentThemeId for ancestor traversal
  const parentByThemeId = React.useMemo(() => {
    const map = new Map<string, string>();
    allThemes.forEach((t) => {
      if (t.$figmaParentThemeId) map.set(t.id, t.$figmaParentThemeId);
    });
    return map;
  }, [allThemes]);

  // Build a map from themeId → Set of all descendant theme IDs
  const descendantsByThemeId = React.useMemo(() => {
    const childrenMap = new Map<string, string[]>();
    allThemes.forEach((t) => {
      if (t.$figmaParentThemeId) {
        const list = childrenMap.get(t.$figmaParentThemeId) || [];
        list.push(t.id);
        childrenMap.set(t.$figmaParentThemeId, list);
      }
    });
    const getAllDescendants = (id: string): string[] => {
      const children = childrenMap.get(id) || [];
      return children.flatMap((c) => [c, ...getAllDescendants(c)]);
    };
    const result = new Map<string, Set<string>>();
    allThemes.forEach((t) => {
      result.set(t.id, new Set(getAllDescendants(t.id)));
    });
    return result;
  }, [allThemes]);

  const handleSelectTheme = React.useCallback((themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      // Block unchecking if any descendant is still selected
      const descendants = descendantsByThemeId.get(themeId) || new Set<string>();
      const hasCheckedDescendant = [...descendants].some((id) => selectedThemes.includes(id));
      if (hasCheckedDescendant) return;
      setSelectedThemes(selectedThemes.filter((id) => id !== themeId));
    } else {
      // When checking, also check all ancestors
      const ancestors: string[] = [];
      let current = parentByThemeId.get(themeId);
      while (current) {
        if (!selectedThemes.includes(current) && !ancestors.includes(current)) {
          ancestors.push(current);
        }
        current = parentByThemeId.get(current);
      }
      setSelectedThemes([...selectedThemes, themeId, ...ancestors]);
    }
  }, [selectedThemes, setSelectedThemes, parentByThemeId, descendantsByThemeId]);

  const handleSelectAllThemes = React.useCallback(() => {
    // When filtering, select/deselect all visible (filtered) themes
    const themesToToggle = sortedFilteredThemes;
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
  }, [sortedFilteredThemes, selectedThemes, setSelectedThemes]);

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
                <Checkbox id="check-all-themes" checked={sortedFilteredThemes.length > 0 && sortedFilteredThemes.every((theme) => selectedThemes.includes(theme.id))} onCheckedChange={handleSelectAllThemes} />
                <Label htmlFor="check-all-themes">{t('generic.selectAll')}</Label>
              </Stack>
              {sortedFilteredThemes.length === 0 && isSearchActive && searchTerm ? (
                <Box css={{ padding: '$4', textAlign: 'center', color: '$fgMuted' }}>
                  {t('noThemesFound')}
                </Box>
              ) : (
                <>
                  {(() => {
                    const renderGroup = (group: string, depth: number): React.ReactNode => {
                      const childGroups = ThemeGroups.filter((g) => themeGroupParentMap.get(g) === group);
                      return (
                        <Stack direction="column" gap={2} key={group} css={{ paddingLeft: depth > 0 ? `${depth * 16}px` : undefined }}>
                          <Heading size="small">{group}</Heading>
                          {getHierarchicalThemes(sortedFilteredThemes.filter((theme) => theme.group === group)).map((theme) => (
                            <ThemeRow key={theme.id} theme={theme} selectedThemes={selectedThemes} descendantsByThemeId={descendantsByThemeId} onSelect={handleSelectTheme} />
                          ))}
                          {childGroups.map((child) => renderGroup(child, depth + 1))}
                        </Stack>
                      );
                    };
                    const rootGroups = ThemeGroups.filter((g) => !themeGroupParentMap.get(g));
                    return rootGroups.map((group) => renderGroup(group, 0));
                  })()}
                  {ungroupedThemes.length ? (
                    <Stack direction="column" gap={2}>
                      <Heading size="small">{t('generic.noGroup')}</Heading>
                      {getHierarchicalThemes(ungroupedThemes).map((theme) => (
                        <ThemeRow key={theme.id} theme={theme} selectedThemes={selectedThemes} descendantsByThemeId={descendantsByThemeId} onSelect={handleSelectTheme} />
                      ))}
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
