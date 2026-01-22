import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Stack, Tabs,
} from '@tokens-studio/ui';
import {
  ChevronLeftIcon, SlidersIcon,
} from '@primer/octicons-react';
import { useSelector } from 'react-redux';
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
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { FileExportPreferences } from '@/figmaStorage/FileExportPreferencesProperty';

export default function ManageStylesAndVariables({ showModal, setShowModal }: { showModal: boolean, setShowModal: (show: boolean) => void }) {
  const { t } = useTranslation(['manageStylesAndVariables']);

  const isProUser = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'useThemes' | 'useSets'>(isProUser ? 'useThemes' : 'useSets');

  const allSets = useSelector(allTokenSetsSelector);
  const themes = useSelector(themesListSelector);

  // State for per-file preferences
  const [selectedThemes, setSelectedThemes] = React.useState<string[]>([]);
  const [preferencesLoaded, setPreferencesLoaded] = React.useState(false);

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

  // Load file-specific export preferences when modal opens
  React.useEffect(() => {
    if (showModal && !preferencesLoaded) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.GET_FILE_EXPORT_PREFERENCES,
      }).then((result) => {
        const preferences = result as FileExportPreferences;
        if (preferences.selectedExportThemes && preferences.selectedExportThemes.length > 0) {
          // Validate that the saved themes still exist
          const validThemes = preferences.selectedExportThemes.filter((themeId) => themes.some((theme) => theme.id === themeId));
          setSelectedThemes(validThemes);
        } else {
          // Default to empty selection instead of all themes
          setSelectedThemes([]);
        }
        setPreferencesLoaded(true);
      }).catch((error) => {
        console.warn('Failed to load file export preferences:', error);
        // Fallback to empty selection
        setSelectedThemes([]);
        setPreferencesLoaded(true);
      });
    }
  }, [showModal, themes, preferencesLoaded]);

  // Save file-specific preferences when selectedThemes changes (but only after initial load)
  React.useEffect(() => {
    if (preferencesLoaded && selectedThemes) {
      const preferences: FileExportPreferences = {
        selectedExportThemes: selectedThemes,
      };

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SET_FILE_EXPORT_PREFERENCES,
        preferences,
      }).catch((error) => {
        console.warn('Failed to save file export preferences:', error);
      });
    }
  }, [selectedThemes, preferencesLoaded]);

  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleCancelOptions = React.useCallback(() => {
    // DO NOT SAVE THE OPTIONS
    setShowOptions(false);
  }, []);

  const handleExportToFigma = React.useCallback(async () => {
    setShowModal(false);
    if (activeTab === 'useSets') {
      await createVariablesFromSets(selectedSets);
      await createStylesFromSelectedTokenSets(selectedSets);
    } else if (activeTab === 'useThemes') {
      await createVariablesFromThemes(selectedThemes);
      await createStylesFromSelectedThemes(selectedThemes);
    }
  }, [setShowModal, activeTab, selectedThemes, selectedSets, createVariablesFromSets, createStylesFromSelectedTokenSets, createVariablesFromThemes, createStylesFromSelectedThemes]);
  const canExportToFigma = activeTab === 'useSets' ? selectedSets.length > 0 : selectedThemes.length > 0;

  const handleTabChange = React.useCallback((tab: 'useThemes' | 'useSets') => {
    setActiveTab(tab);
  }, []);

  const handleClose = React.useCallback(() => {
    if (showOptions) {
      setShowOptions(false);
    } else {
      setShowModal(false);
      // Reset preferences loaded state when modal closes
      setPreferencesLoaded(false);
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
