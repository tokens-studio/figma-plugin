import React from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Heading, Tabs, Link, Box, Stack, Checkbox, Label,
} from '@tokens-studio/ui';
import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import { StyledCard } from './StyledCard';
import {
  themesListSelector,
} from '@/selectors';
import { StyledProBadge } from '../ProBadge';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { ThemeObject } from '@/types';
import { ExportThemeRow } from './ExportThemeRow';
import { docsLinks } from './docsLinks';
import { LabelledCheckbox } from './LabelledCheckbox';

const ProButton = styled(Button, {
  ':first-child': {
    flexDirection: 'row-reverse',
  },
});

export default function useExportThemesTab() {
  const { t } = useTranslation('ManageStylesAndVariables');
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

  // TODO: Remeber selected themes in document storage
  // Reloading the plugin shouldn't forget the selected themes
  const [selectedThemes, setSelectedThemes] = React.useState<string[]>(themes.map((theme) => theme.id));

  const handleSelectTheme = React.useCallback((themeId: string) => {
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter((id) => id !== themeId));
    } else {
      setSelectedThemes([...selectedThemes, themeId]);
    }
  }, [selectedThemes]);

  const handleSelectAllThemes = React.useCallback(() => {
    if (selectedThemes.length === themes.length) {
      setSelectedThemes([]);
    } else {
      setSelectedThemes(themes.map((theme) => theme.id));
    }
  }, [themes, selectedThemes]);

  const handleManageThemes = React.useCallback(() => {
    /* TODO: Open the manage themes modal */
    alert('MANAGE THEMES');
  }, []);

  const handleGetPro = React.useCallback(() => {
    window.open('https://tokens.studio/#pricing-1', '_blank');
  }, []);

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

  const ExportThemesTab = () => (
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
                <Box css={{
                  alignSelf: 'flex-end',
                }}
                >
                  <Button variant="secondary" size="small">{t('actions.createThemes')}</Button>
                </Box>
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
            <Box css={{
              alignSelf: 'flex-start',
            }}
            >
              <ProButton
                as="a"
                icon={<StyledProBadge>{isPro ? 'PRO' : 'GET PRO'}</StyledProBadge>}
                variant="secondary"
                size="small"
                css={{
                  alignContent: 'center',
                  gap: '$2',
                }}
                onClick={isPro ? handleManageThemes : handleGetPro}
              >
                {t('actions.manageThemes')}
              </ProButton>
            </Box>
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
  return {
    ExportThemesTab,
    selectedThemes,
  };
}
