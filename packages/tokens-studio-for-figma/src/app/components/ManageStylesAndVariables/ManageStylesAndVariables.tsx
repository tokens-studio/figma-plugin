import React, { useEffect } from 'react';
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

import useExportThemesTab from './useExportThemesTab';
import useExportSetsTab from './useExportSetsTab';
import OptionsModal from './OptionsModal';
import useTokens from '@/app/store/useTokens';
import {
  stylesColorSelector, stylesEffectSelector, stylesTypographySelector, variablesBooleanSelector, variablesColorSelector, variablesNumberSelector, variablesStringSelector,
} from '@/selectors';

export default function ManageStylesAndVariables({ showModal, setShowModal }: { showModal: boolean, setShowModal: (show: boolean) => void }) {
  const [variablesColor] = React.useState<boolean>(useSelector(variablesColorSelector));
  const [variablesNumber] = React.useState<boolean>(useSelector(variablesNumberSelector));
  const [variablesString] = React.useState<boolean>(useSelector(variablesStringSelector));
  const [variablesBoolean] = React.useState<boolean>(useSelector(variablesBooleanSelector));
  const [stylesEffect] = React.useState<boolean>(useSelector(stylesEffectSelector));
  const [stylesTypography] = React.useState<boolean>(useSelector(stylesTypographySelector));
  const [stylesColor] = React.useState<boolean>(useSelector(stylesColorSelector));

  const { t } = useTranslation(['manageStylesAndVariables']);

  const isPro = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'useThemes' | 'useSets'>(isPro ? 'useThemes' : 'useSets');

  const { ExportThemesTab, selectedThemes } = useExportThemesTab();
  const { ExportSetsTab, selectedSets } = useExportSetsTab();
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

  const [canExportToFigma, setCanExportToFigma] = React.useState(false);

  useEffect(() => {
    setCanExportToFigma(activeTab === 'useSets' ? true : selectedThemes.length > 0);
  }, [selectedThemes, activeTab]);

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

  const handleExportToFigma = React.useCallback(async () => {
    handleClose();
    if (activeTab === 'useSets') {
      const variablesCreated = await createVariablesFromSets(selectedSets);
      console.log('variables created', variablesCreated);
      createStylesFromSelectedTokenSets(selectedSets);
    } else if (activeTab === 'useThemes') {
      const variablesCreated = await createVariablesFromThemes(selectedThemes);
      console.log('variables created', variablesCreated);
      createStylesFromSelectedThemes(selectedThemes);
    }
  }, [handleClose, activeTab, selectedThemes, selectedSets, createVariablesFromSets, createStylesFromSelectedTokenSets, createVariablesFromThemes, createStylesFromSelectedThemes]);

  const onInteractOutside = (event: Event) => {
    event.preventDefault();
  };

  return (
    <>
      <Modal
        size="fullscreen"
        title={t('modalTitle')}
        showClose
        isOpen={showModal}
        close={handleClose}
        // eslint-disable-next-line react/jsx-no-bind
        onInteractOutside={(event: Event) => onInteractOutside(event)}
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
        <Tabs defaultValue={isPro ? 'useThemes' : 'useSets'}>
          <Tabs.List>
            <Tabs.Trigger value="useThemes" onClick={() => handleTabChange('useThemes')}>
              {t('tabs.exportThemes')}
              <StyledProBadge css={{ marginInlineStart: '$2' }}>{isPro ? 'PRO' : 'Get PRO'}</StyledProBadge>
            </Tabs.Trigger>
            <Tabs.Trigger value="useSets" onClick={() => handleTabChange('useSets')}>{t('tabs.exportSets')}</Tabs.Trigger>
          </Tabs.List>
          <ExportThemesTab />
          <ExportSetsTab />
        </Tabs>
      </Modal>
      <OptionsModal isOpen={showOptions} title="Manage / Export Options" closeAction={handleCancelOptions} />
    </>
  );
}
