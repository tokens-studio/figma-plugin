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

export default function ManageStylesAndVariables({ showModal, setShowModal }: { showModal: boolean, setShowModal: (show: boolean) => void }) {
  const { t } = useTranslation(['manageStylesAndVariables']);

  const isProUser = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'useThemes' | 'useSets'>(isProUser ? 'useThemes' : 'useSets');

  const allSets = useSelector(allTokenSetsSelector);
  const themes = useSelector(themesListSelector);

  const [selectedThemes, setSelectedThemes] = React.useState<string[]>(themes.map((theme) => theme.id));

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
        <Tabs defaultValue={isProUser ? 'useThemes' : 'useSets'}>
          <Tabs.List>
            <Tabs.Trigger value="useThemes" onClick={() => handleTabChange('useThemes')}>
              {t('tabs.exportThemes')}
              <StyledProBadge css={{ marginInlineStart: '$2' }}>{isProUser ? 'PRO' : 'Get PRO'}</StyledProBadge>
            </Tabs.Trigger>
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
