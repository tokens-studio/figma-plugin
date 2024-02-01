import React from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Heading, Tabs, Link, Box, Stack, Checkbox, Label
} from '@tokens-studio/ui';
import { styled } from '@stitches/react';
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
                <Heading size="medium">Create Themes to get Started</Heading>
                <p>Combinations of token sets create themes.</p>

                <p>Use Themes to create multiple collections of variables or styles for easy switching between design concepts like light or dark color modes, multiple brands, products or platforms. </p>

                <p>Or switch to Sets to export without using Themes.</p>

                <Link target="_blank" href={docsLinks.themes}>Learn more - Themes</Link>
                <Box css={{
                  alignSelf: 'flex-end',
                }}
                >
                  <Button variant="secondary" size="small">Create Themes</Button>
                </Box>
              </>
            ) : (
              <>
                <Heading size="medium">Creating Themes is a pro Feature</Heading>
                <p>Combinations of token sets create themes.</p>

                <p>Use Themes to create multiple collections of variables or styles for easy switching between design concepts like light or dark color modes, multiple brands, products or platforms. </p>
                <Link target="_blank" href={docsLinks.themes}>Learn more - Themes</Link>
                <Box css={{
                  alignSelf: 'flex-end',
                }}
                >
                  <Button variant="secondary" size="small">Get PRO</Button>
                </Box>
              </>
            )}
          </Stack>

        </StyledCard>
      ) : (
        <StyledCard>
          <Stack direction="column" align="start" gap={4}>
            <Heading>Confirm Themes</Heading>
            <p>Combinations of token sets create themes.</p>
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
                Manage Themes
              </ProButton>
            </Box>
            <Stack direction="column" width="full" gap={4}>
              <Stack direction="row" gap={3} align="center">
                <Checkbox id="check-all-themes" checked={selectedThemes.length === themes.length} onCheckedChange={handleSelectAllThemes} />
                <Label htmlFor="check-all-themes">Select all themes</Label>
              </Stack>
              {ThemeGroups.map((group) => (
                <Stack direction="column" gap={2}>
                  <Heading size="small">{group}</Heading>
                  {themes.filter((theme) => theme.group === group).map((theme) => createThemeRow(theme))}
                </Stack>
              ))}
              {ungroupedThemes.length ? (
                <Stack direction="column" gap={2}>
                  <Heading size="small">No group</Heading>
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
