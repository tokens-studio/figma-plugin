import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Stack, Tabs,
} from '@tokens-studio/ui';
import {
  ChevronLeftIcon, SlidersIcon,
} from '@primer/octicons-react';
import { useSelector, useDispatch } from 'react-redux';
import { StyledProBadge } from '../ProBadge';
import Modal from '../Modal';
import { useIsProUser } from '@/app/hooks/useIsProUser';

import OptionsModal from './OptionsModal';
import useTokens from '@/app/store/useTokens';
import useConfirm from '@/app/hooks/useConfirm';
import ExportSetsTab from './ExportSetsTab';
import ExportThemesTab from './ExportThemesTab';
import { allTokenSetsSelector, themesListSelector, tokensSelector } from '@/selectors';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { Dispatch } from '@/app/store';
import { TokenTypes } from '@/constants/TokenTypes';

export default function ManageStylesAndVariables({ showModal, setShowModal }: { showModal: boolean, setShowModal: (show: boolean) => void }) {
  const { t } = useTranslation(['manageStylesAndVariables']);

  const isProUser = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'useThemes' | 'useSets'>(isProUser ? 'useThemes' : 'useSets');

  const allSets = useSelector(allTokenSetsSelector);
  const themes = useSelector(themesListSelector);
  const dispatch = useDispatch<Dispatch>();
  const savedSelectedThemes = useSelector((state: any) => state.uiState.selectedExportThemes) || [];

  // Validate saved themes to ensure they still exist
  const validatedSelectedThemes = savedSelectedThemes.filter((themeId) => themes.some((theme) => theme.id === themeId));

  // Default to using all themes if no valid saved themes are found
  const initialSelectedThemes = validatedSelectedThemes.length > 0
    ? validatedSelectedThemes
    : themes.map((theme) => theme.id);

  const [selectedThemes, setSelectedThemes] = React.useState<string[]>(initialSelectedThemes);

  const [selectedSets, setSelectedSets] = React.useState<ExportTokenSet[]>(allSets.map((set) => {
    const tokenSet = {
      set,
      status: TokenSetStatus.ENABLED,
    };
    return tokenSet;
  }));

  const {
    createVariablesFromSets, createVariablesFromThemes, createStylesFromSelectedTokenSets, createStylesFromSelectedThemes,
    removeVariablesFromToken,
  } = useTokens();
  const { confirm } = useConfirm<string[]>();
  const allTokens = useSelector(tokensSelector);

  // Save selected themes when they change and update redux state
  React.useEffect(() => {
    if (selectedThemes) {
      // Update Redux state - this will trigger the effect to save to shared plugin data
      dispatch.uiState.setSelectedExportThemes(selectedThemes);
    }
  }, [selectedThemes, dispatch.uiState]);

  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleCancelOptions = React.useCallback(() => {
    // DO NOT SAVE THE OPTIONS
    setShowOptions(false);
  }, []);

  // Color tokens that now hold a gradient value but still have a Figma variable
  // bound from an earlier export. Figma variables can't store gradients, so a
  // stale variable will keep overriding the new gradient style on any bound
  // layer. Offer to delete these variables before we push.
  const gradientTokensWithStaleVariable = React.useMemo(() => {
    const isGradient = (v: unknown): v is string => typeof v === 'string'
      && (v.startsWith('linear-gradient') || v.startsWith('radial-gradient') || v.startsWith('conic-gradient'));
    // Flatten variable-reference keys across all themes once so the token scan
    // stays O(tokens + refs) rather than O(tokens × themes).
    const referencedTokenNames = new Set<string>();
    themes.forEach((theme) => {
      Object.keys(theme.$figmaVariableReferences ?? {}).forEach((name) => referencedTokenNames.add(name));
    });
    const seen = new Set<string>();
    const collected: string[] = [];
    Object.values(allTokens).forEach((tokenList) => {
      tokenList.forEach((token) => {
        if (token.type !== TokenTypes.COLOR || !isGradient(token.value) || seen.has(token.name)) return;
        if (referencedTokenNames.has(token.name)) {
          seen.add(token.name);
          collected.push(token.name);
        }
      });
    });
    return collected;
  }, [allTokens, themes]);

  const handleExportToFigma = React.useCallback(async () => {
    if (gradientTokensWithStaleVariable.length > 0) {
      const gradientConfirm = await confirm({
        text: t('confirmDeleteGradientVariables.text', { defaultValue: 'Delete Figma variables for gradient tokens?' }),
        description: t('confirmDeleteGradientVariables.description', { defaultValue: "Figma variables can't store gradients. These color tokens are now gradients but still have variables from a previous export — bound layers will keep showing the old color until the variable is removed. Uncheck any you'd rather keep." }),
        confirmAction: t('confirmDeleteGradientVariables.confirmAction', { defaultValue: 'Delete selected & export' }),
        cancelAction: t('confirmDeleteGradientVariables.cancelAction', { defaultValue: 'Cancel' }),
        variant: 'danger',
        choices: gradientTokensWithStaleVariable.map((name) => ({
          key: name,
          label: name,
          enabled: true,
        })),
      });
      if (!gradientConfirm) return; // user cancelled — abort export entirely
      const toDelete = gradientConfirm.data ?? [];
      // Sequential rather than Promise.all — each call posts a REMOVE_VARIABLES
      // message and the plugin side processes them serially anyway, so this
      // keeps behavior predictable without a burst of parallel requests.
      // eslint-disable-next-line no-restricted-syntax
      for (const name of toDelete) {
        // eslint-disable-next-line no-await-in-loop
        await removeVariablesFromToken(name);
      }
    }

    setShowModal(false);
    if (activeTab === 'useSets') {
      await createVariablesFromSets(selectedSets);
      await createStylesFromSelectedTokenSets(selectedSets);
    } else if (activeTab === 'useThemes') {
      await createVariablesFromThemes(selectedThemes);
      await createStylesFromSelectedThemes(selectedThemes);
    }
  }, [
    setShowModal, activeTab, selectedThemes, selectedSets,
    createVariablesFromSets, createStylesFromSelectedTokenSets,
    createVariablesFromThemes, createStylesFromSelectedThemes,
    gradientTokensWithStaleVariable, confirm, removeVariablesFromToken, t,
  ]);
  const canExportToFigma = activeTab === 'useSets' ? selectedSets.length > 0 : selectedThemes.length > 0;

  const handleTabChange = React.useCallback((tab: 'useThemes' | 'useSets') => {
    setActiveTab(tab);
  }, []);

  const handleClose = React.useCallback(() => {
    if (showOptions) {
      setShowOptions(false);
    } else {
      setShowModal(false);
    }
  }, [setShowModal, showOptions]);

  const onInteractOutside = React.useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  return (
    <>
      <Modal
        size="fullscreen"
        title={t('modalTitle')}
        showClose
        isOpen={showModal}
        close={handleClose}
        onInteractOutside={onInteractOutside}
        footer={(
          <Stack direction="row" gap={4} justify="between">
            <Button variant="invisible" id="manageStyles-button-close" onClick={handleClose} icon={<ChevronLeftIcon />}>
              {t('actions.cancel')}
            </Button>
            <Stack direction="row" gap={4}>
              <Button variant="secondary" icon={<SlidersIcon />} id="manageStyles-button-options" onClick={handleShowOptions}>
                {t('actions.options')}
              </Button>
              <Button variant="primary" id="pullDialog-button-override" onClick={handleExportToFigma} disabled={!canExportToFigma}>
                {t('actions.export')}
              </Button>
            </Stack>
          </Stack>
  )}
        stickyFooter
      >
        <Tabs defaultValue={activeTab}>
          <Tabs.List>
            {/* eslint-disable-next-line react/jsx-no-bind */}
            <Tabs.Trigger value="useThemes" onClick={() => handleTabChange('useThemes')}>
              {t('tabs.exportThemes')}
              <StyledProBadge css={{ marginInlineStart: '$2' }}>{isProUser ? 'PRO' : 'Get PRO'}</StyledProBadge>
            </Tabs.Trigger>
            {/* eslint-disable-next-line react/jsx-no-bind */}
            <Tabs.Trigger value="useSets" onClick={() => handleTabChange('useSets')}>{t('tabs.exportSets')}</Tabs.Trigger>
          </Tabs.List>
          <ExportThemesTab selectedThemes={selectedThemes} setSelectedThemes={setSelectedThemes} />
          <ExportSetsTab selectedSets={selectedSets} setSelectedSets={setSelectedSets} />
        </Tabs>
      </Modal>
      <OptionsModal isOpen={showModal && showOptions} title={t('optionsModalTitle')} closeAction={handleCancelOptions} />
    </>
  );
}
