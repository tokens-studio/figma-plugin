import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Button, Stack, Tabs, Heading, Box, Link, Checkbox, Label, IconButton, DropdownMenu, ToggleGroup,
} from '@tokens-studio/ui';
import { styled } from '@stitches/react';
import {
  AlertFillIcon,
  ChevronLeftIcon, ChevronRightIcon, DiffAddedIcon, DiffRemovedIcon, PencilIcon, SlidersIcon, FileDirectoryIcon, XCircleFillIcon, CheckCircleFillIcon, CheckCircleIcon, LinkIcon,
} from '@primer/octicons-react';
import { EyeClosedIcon } from '@radix-ui/react-icons';
import {
  allTokenSetsSelector, themesListSelector, usedTokenSetSelector,
} from '@/selectors';

import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import { ThemeObject } from '@/types';
import { StyledProBadge } from '../ProBadge';
import Modal from '../Modal';
import Options from './options';

const docsLinks = {
  stylesAndVariables: 'https://docs.tokens.studio/',
  themes: 'https://docs.tokens.studio/',
  sets: 'https://docs.tokens.studio/',
};

const StyledCard = styled(Box, {
  borderRadius: '$medium',
  border: '1px solid $colors$borderSubtle',
  padding: '$4',
  display: 'flex',
  flexDirection: 'column',
  marginBlock: '$4',
});

const ProButton = styled(Button, {
  ':first-child': {
    flexDirection: 'row-reverse',
  },
});

const ExportThemeRow = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'min-content 1fr 1fr min-content',
  columnGap: '$3',
  alignItems: 'center',
});

// TODO: Get the theme details from the theme object
// This should be calculated to tell the user the diff of the theme
const ThemeDetails = ({ theme: ThemeObject }) => (
  <Stack
    direction="row"
    gap={4}
    css={{
      label: {
        display: 'inline-flex',
        flexDirection: 'row',
      },
    }}
  >
    <Label css={{ color: '$successFg', fontSize: '$xxsmall' }}>
      <DiffAddedIcon size="small" />
      99
    </Label>
    <Label css={{ color: '$dangerFg', fontSize: '$xxsmall' }}>
      <DiffRemovedIcon size="small" />
      99
    </Label>
    <Label css={{ color: '$accentEmphasis', fontSize: '$xxsmall' }}>
      <PencilIcon size="small" />
      99
    </Label>
    <Label css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
      <AlertFillIcon size="small" />
      99
    </Label>
  </Stack>
);

export default function ManageStylesAndVariables() {
  const { t } = useTranslation(['manageStylesAndVariables', 'tokens']);

  const [showModal, setShowModal] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [showChangeSets, setShowChangeSets] = React.useState(false);

  const themes = useSelector(themesListSelector);

  const allSets = useSelector(allTokenSetsSelector);
  const [selectedSets, setSelectedSets] = React.useState<string[]>(allSets.map((set) => set));

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

  function createThemeRow(theme: ThemeObject) {
    return (
      <ExportThemeRow
        key={theme.id}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Checkbox id={theme.id} checked={selectedThemes.includes(theme.id)} onCheckedChange={() => handleSelectTheme(theme.id)} />
        <Label htmlFor={theme.id}>{theme.name}</Label>
        <ThemeDetails theme={theme} />
        <IconButton variant="invisible" size="small" tooltip="Details" icon={<ChevronRightIcon />} />
      </ExportThemeRow>
    );
  }

  const handleSelectAllThemes = React.useCallback(() => {
    if (selectedThemes.length === themes.length) {
      setSelectedThemes([]);
    } else {
      setSelectedThemes(themes.map((theme) => theme.id));
    }
  }, [themes, selectedThemes]);

  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);

  const isPro = existingKey && !licenseKeyError;

  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleSaveOptions = React.useCallback(() => {
    alert('TODO: Save options');
  }, []);

  const handleCancelOptions = React.useCallback(() => {
    // DO NOT SAVE THE OPTIONS
    setShowOptions(false);
  }, [showOptions]);

  const handleCancelChangeSets = React.useCallback(() => {
    // DO NOT SAVE THE SET CHANGES
    setShowChangeSets(false);
  }, [showOptions]);

  const handleSelectedSetChange = React.useCallback((set: string) => {
    if (selectedSets.includes(set)) {
      setSelectedThemes(selectedSets.filter((id) => id !== set));
    } else {
      setSelectedThemes([...selectedSets, set]);
    }
  }, []);

  const handleExportToFigma = React.useCallback(() => {
    alert('TODO: Export to Figma');
  }, []);

  const handleManageThemes = React.useCallback(() => {
    alert('MANAGE THEMES');
  }, []);

  const handleGetPro = React.useCallback(() => {
    alert('GET PRO');
  }, []);

  const [canExportToFigma, setCanExportToFigma] = React.useState(false);

  useEffect(() => {
    setCanExportToFigma(selectedThemes.length > 0);
  }, [selectedThemes]);

  const handleOpen = React.useCallback(() => {
    setShowModal(true);
  }, []);

  const handleClose = React.useCallback(() => {
    if (showOptions) {
      setShowOptions(false);
    } else {
      setShowModal(false);
    }
  }, []);

  return (
    <>
      <Modal
        size="fullscreen"
        title={t('modalTitle')}
        showClose
        isOpen={showModal}
        close={handleClose}
        footer={(
          <Stack direction="row" gap={4} justify="between">
            <Button variant="invisible" id="manageStyles-button-close" onClick={handleClose} icon={<ChevronLeftIcon />}>
              {t('actions.cancel')}
            </Button>
            <Stack direction="row" gap={4}>
              {!showOptions && (
              <Button variant="secondary" id="manageStyled-button-options" onClick={handleShowOptions} icon={<SlidersIcon />}>
                {t('actions.options')}
              </Button>
              )}
              <Button variant="primary" id="pullDialog-button-override" onClick={handleExportToFigma} disabled={!canExportToFigma}>
                {t('actions.export')}
              </Button>
            </Stack>
          </Stack>
  )}
        stickyFooter
      >
        <Tabs defaultValue="useThemes">
          <Tabs.List>
            <Tabs.Trigger value="useThemes">
              Themes
              <StyledProBadge css={{ marginInlineStart: '$2' }}>PRO</StyledProBadge>
            </Tabs.Trigger>
            <Tabs.Trigger value="useSets">Token Sets</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="useThemes">
            { themes.length === 0 ? (
              <StyledCard>
                <Stack direction="column" align="start" gap={4}>
                  {isPro ? (
                    <>
                      <Heading size="medium">Create Themes to get Started</Heading>
                      <p>Combinations of token sets create themes.</p>

                      <p>Use Themes to create multiple collections of variables or styles for easy switching between design concepts like light or dark color modes, multiple brands, products or platforms. </p>

                      <p>Or switch to Sets to export without using Themes.</p>

                      <Link href={docsLinks.themes}>Learn more - Themes</Link>
                      <Box css={{ alignSelf: 'flex-end' }}>
                        <Button variant="secondary" size="small">Create Themes</Button>
                      </Box>
                    </>
                  )
                    : (

                      <>
                        <Heading size="medium">Creating Themes is a pro Feature</Heading>
                        <p>Combinations of token sets create themes.</p>

                        <p>Use Themes to create multiple collections of variables or styles for easy switching between design concepts like light or dark color modes, multiple brands, products or platforms. </p>
                        <Link href={docsLinks.themes}>Learn more - Themes</Link>
                        <Box css={{ alignSelf: 'flex-end' }}>
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
                  <Box css={{ alignSelf: 'flex-start' }}>
                    <ProButton icon={<StyledProBadge>{isPro ? 'PRO' : 'GET PRO'}</StyledProBadge>} variant="secondary" size="small" css={{ alignContent: 'center', gap: '$2' }} onClick={isPro ? handleManageThemes : handleGetPro}>
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
                    <Stack direction="column" gap={2}>
                      <Heading size="small">No group</Heading>
                      {ungroupedThemes.map((theme) => createThemeRow(theme))}
                    </Stack>
                  </Stack>
                </Stack>

              </StyledCard>
            )}
          </Tabs.Content>
          <Tabs.Content value="useSets">
            <StyledCard>
              <Stack direction="column" align="start" gap={6}>
                <Stack direction="column" align="start" gap={4}>
                  <Heading>Confirm Sets</Heading>
                  <p>You can use token sets to manage your styles, and variables.</p>
                  <p>Use Themes (Pro) to create multiple collections of variables or styles for easy switching between design concepts. </p>
                  <Link href={docsLinks.stylesAndVariables}>Learn more - Styles and variables</Link>
                </Stack>
                <Stack direction="column" align="start" gap={4}>
                  {/* eslint-disable-next-line react/jsx-no-bind */}
                  <Button variant="secondary" size="small" onClick={() => setShowChangeSets(true)}>Change Sets</Button>
                  <ExportThemeRow>
                    <FileDirectoryIcon size="small" />
                    <Label>
                      {selectedSets.length}
                      {' of '}
                      {allSets.length}
                    </Label>
                    <ThemeDetails theme={null} />
                    <IconButton variant="invisible" size="small" tooltip="Details" icon={<ChevronRightIcon />} />
                    <Modal full compact isOpen={showChangeSets} close={handleCancelChangeSets}>
                      <Heading>Enabled sets will export to Figma</Heading>
                      <Link href={docsLinks.sets}>Learn more - Enabled vs set as source</Link>
                      <Stack direction="column" gap={4} css={{ marginBlockStart: '$4' }}>
                        {
                        allSets.map((set) => (
                          <Box css={{
                            display: 'grid', gridTemplateColumns: '1fr min-content', alignItems: 'center', gridGap: '$3',
                          }}
                          >
                            {/* eslint-disable react/jsx-no-bind */}
                            {/* <Checkbox
                              onCheckedChange={() => handleSelectedSetChange(set)}
                              id={set}
                              checked={selectedSets.includes(set)}
                            /> */}
                            <Label>{set}</Label>
                            <ToggleGroup
                              type="single"
                              defaultValue="source"
                            >
                              <ToggleGroup.Item value="disabled" tooltip="Disabled" tooltipSide="top">
                                <XCircleFillIcon />
                              </ToggleGroup.Item>
                              <ToggleGroup.Item value="source" tooltip="Source - use references only" tooltipSide="top">
                                <LinkIcon />
                              </ToggleGroup.Item>
                              <ToggleGroup.Item value="enabled" tooltip="Enabled" tooltipSide="top">
                                <CheckCircleFillIcon />
                              </ToggleGroup.Item>
                            </ToggleGroup>
                            {/* eslint-enable react/jsx-no-bind */}
                          </Box>
                        ))
                        }
                      </Stack>
                    </Modal>
                  </ExportThemeRow>
                </Stack>
              </Stack>
            </StyledCard>
          </Tabs.Content>
        </Tabs>
      </Modal>

      {/* TODO: Refactor this so the modal lives in its own file? */}
      <Modal
        size="fullscreen"
        title={t('modalTitle')}
        showClose
        isOpen={showOptions}
        close={handleClose}
        footer={(
          <Stack direction="row" gap={4} justify="between">
            <Button variant="invisible" id="manageStyles-button-close" onClick={handleCancelOptions} icon={<ChevronLeftIcon />}>
              {t('actions.cancel')}
            </Button>

            <Button variant="primary" id="pullDialog-button-override" onClick={handleSaveOptions}>
              {t('actions.confirm')}
            </Button>

          </Stack>
  )}
        stickyFooter
      >
        <Options />
      </Modal>

      <Button variant="secondary" size="small" onClick={handleOpen}>
        {t('stylesAndVariables', { ns: 'tokens' })}
      </Button>
    </>
  );
}
