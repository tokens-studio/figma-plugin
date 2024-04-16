import React from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Heading, Tabs, Link, Box, Stack, Checkbox, Label,
} from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { StyledCard } from './StyledCard';
import {
  themesListSelector,
} from '@/selectors';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { ThemeObject } from '@/types';
import { ExportThemeRow } from './ExportThemeRow';
import { docsLinks } from './docsLinks';
import { LabelledCheckbox } from './LabelledCheckbox';
import useExportThemesTab from './useExportThemesTab';

export default function ExportThemesTab() {
  const { t } = useTranslation(['manageStylesAndVariables']);
  const themes = useSelector(themesListSelector);
  const isPro = useIsProUser();

  const ThemeGroups = React.useMemo(() => {
    const uniqueGroups: string[] = themes.reduce((unique: string[], theme) => {
      if (theme.group && !unique.includes(theme.group)) {
        unique.push(theme.group);
      }
      return unique;
    }, []);
    return uniqueGroups;
  }, [themes]);

  const ungroupedThemes = React.useMemo(() => themes.filter((theme) => !theme.group), [themes]);
  const { selectedThemes, setSelectedThemes } = useExportThemesTab();

  // TODO: Remeber selected themes in document storage
  // Reloading the plugin shouldn't forget the selected themes

  const handleSelectTheme = React.useCallback((themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter((id) => id !== themeId));
    } else {
      setSelectedThemes([...selectedThemes, themeId]);
    }
  }, [selectedThemes, setSelectedThemes]);

  const handleSelectAllThemes = React.useCallback(() => {
    if (selectedThemes.length === themes.length) {
      setSelectedThemes([]);
    } else {
      setSelectedThemes(themes.map((theme) => theme.id));
    }
  }, [themes, selectedThemes, setSelectedThemes]);

  function createThemeRow(theme: ThemeObject) {
    return (
      <ExportThemeRow
        key={theme.id}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <LabelledCheckbox id={theme.id} checked={selectedThemes.includes(theme.id)} onChange={() => handleSelectTheme(theme.id)} label={theme.name} />
        {/* TODO: Add theme details */}
        {/* <ThemeDetails /> */}
        {/* <IconButton variant="invisible" size="small" tooltip="Details" icon={<ChevronRightIcon />} /> */}
      </ExportThemeRow>
    );
  }

  return (
    <Tabs.Content value="useThemes">
      {themes.length === 0 ? (
        <StyledCard>
          <Stack direction="column" align="start" gap={4}>
            {isPro ? (
              <>
                <Heading size="medium">{t('exportThemesTab.headingPro')}</Heading>
                <p>{t('exportThemesTab.introPro')}</p>
                <Link target="_blank" href={docsLinks.themes}>
                  {' '}
                  {t('generic.learnMore')}
                  {' – '}
                  {t('generic.themes')}
                </Link>
              </>
            ) : (
              <>
                <Heading size="medium">{t('exportThemesTab.headingBasic')}</Heading>
                <p>{t('exportThemesTab.introBasic')}</p>
                <Link target="_blank" href={docsLinks.themes}>
                  {t('generic.learnMore')}
                  {' – '}
                  {t('generic.themes')}
                </Link>
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
            <Heading>{t('exportThemesTab.confirmThemes')}</Heading>
            <p>{t('exportThemesTab.combinationsOfSetsMakeThemes')}</p>
            <Stack direction="column" width="full" gap={4}>
              <Stack direction="row" gap={3} align="center">
                <Checkbox id="check-all-themes" checked={selectedThemes.length === themes.length} onCheckedChange={handleSelectAllThemes} />
                <Label htmlFor="check-all-themes">{t('generic.selectAll')}</Label>
              </Stack>
              {ThemeGroups.map((group) => (
                <Stack direction="column" gap={2}>
                  <Heading size="small">{group}</Heading>
                  {themes.filter((theme) => theme.group === group).map((theme) => createThemeRow(theme))}
                </Stack>
              ))}
              {ungroupedThemes.length ? (
                <Stack direction="column" gap={2}>
                  <Heading size="small">{t('generic.noGroup')}</Heading>
                  {ungroupedThemes.map((theme) => createThemeRow(theme))}
                </Stack>
              ) : null}
            </Stack>
          </Stack>

        </StyledCard>
      )}
    </Tabs.Content>
  );
}
