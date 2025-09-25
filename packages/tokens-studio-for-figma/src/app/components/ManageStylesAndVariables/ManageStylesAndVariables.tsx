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
import ExportSetsTab from './ExportSetsTab';
import ExportThemesTab from './ExportThemesTab';
import { allTokenSetsSelector, themesListSelector } from '@/selectors';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { Dispatch } from '@/app/store';
import VariableSyncPreviewModal from '../VariableSyncPreviewModal';
import { VariableChangePreview } from '@/types/AsyncMessages';
import { settingsStateSelector, tokensSelector } from '@/selectors';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export default function ManageStylesAndVariables({ showModal, setShowModal }: { showModal: boolean, setShowModal: (show: boolean) => void }) {
  const { t } = useTranslation(['manageStylesAndVariables']);

  const isProUser = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'useThemes' | 'useSets'>(isProUser ? 'useThemes' : 'useSets');
  const [showVariablePreview, setShowVariablePreview] = React.useState(false);

  const allSets = useSelector(allTokenSetsSelector);
  const themes = useSelector(themesListSelector);
  const tokens = useSelector(tokensSelector);
  const settings = useSelector(settingsStateSelector);
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
  } = useTokens();

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

  const handleShowVariablePreview = React.useCallback(() => {
    setShowVariablePreview(true);
  }, []);

  const handleVariablePreviewConfirm = React.useCallback(async (selectedChanges: VariableChangePreview[]) => {
    setShowVariablePreview(false);
    setShowModal(false);
    
    // Apply only the selected variable changes
    if (selectedChanges.length > 0) {
      try {
        await AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.APPLY_VARIABLE_CHANGES,
          changes: selectedChanges,
          tokens,
          settings,
          selectedThemes: activeTab === 'useThemes' ? selectedThemes : undefined,
          selectedSets: activeTab === 'useSets' ? selectedSets : undefined,
        });
      } catch (error) {
        console.error('Failed to apply variable changes:', error);
      }
    }
    
    // Still create styles using existing methods
    if (activeTab === 'useSets') {
      await createStylesFromSelectedTokenSets(selectedSets);
    } else if (activeTab === 'useThemes') {
      await createStylesFromSelectedThemes(selectedThemes);
    }
  }, [activeTab, selectedSets, selectedThemes, tokens, settings, createStylesFromSelectedTokenSets, createStylesFromSelectedThemes]);

  const handleExportToFigma = React.useCallback(async () => {
    // Check if we should show variable preview
    const shouldCreateVariables = (settings.variablesBoolean
        || settings.variablesColor
        || settings.variablesNumber
        || settings.variablesString);
    
    if (shouldCreateVariables) {
      handleShowVariablePreview();
    } else {
      // Just create styles without variables
      setShowModal(false);
      if (activeTab === 'useSets') {
        await createStylesFromSelectedTokenSets(selectedSets);
      } else if (activeTab === 'useThemes') {
        await createStylesFromSelectedThemes(selectedThemes);
      }
    }
  }, [settings, activeTab, selectedSets, selectedThemes, createStylesFromSelectedTokenSets, createStylesFromSelectedThemes, handleShowVariablePreview]);
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
        isOpen={showModal && !showVariablePreview}
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
      
      <VariableSyncPreviewModal
        isOpen={showVariablePreview}
        onClose={() => setShowVariablePreview(false)}
        onConfirm={handleVariablePreviewConfirm}
        tokens={tokens}
        settings={settings}
        selectedThemes={activeTab === 'useThemes' ? selectedThemes : undefined}
        selectedSets={activeTab === 'useSets' ? selectedSets : undefined}
      />
      
      <OptionsModal isOpen={showModal && showOptions && !showVariablePreview} title={t('optionsModalTitle')} closeAction={handleCancelOptions} />
    </>
  );
}
