import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Stack, Tabs,
} from '@tokens-studio/ui';
import {
  ChevronLeftIcon, SlidersIcon,
} from '@primer/octicons-react';
import { StyledProBadge } from '../ProBadge';
import Modal from '../Modal';
import { useIsProUser } from '@/app/hooks/useIsProUser';

import useExportThemesTab from './useExportThemesTab';
import useExportSetsTab from './useExportSetsTab';
import OptionsModal from './OptionsModal';
import useTokens from '@/app/store/useTokens';

export default function ManageStylesAndVariables() {
  const { t } = useTranslation(['manageStylesAndVariables']);

  const [showModal, setShowModal] = React.useState(false);

  const isPro = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(false);

  const { ExportThemesTab, selectedThemes } = useExportThemesTab();
  const { ExportSetsTab, selectedSets } = useExportSetsTab();
  const { createVariablesFromThemes, createVariables } = useTokens();

  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleCancelOptions = React.useCallback(() => {
    // DO NOT SAVE THE OPTIONS
    setShowOptions(false);
  }, []);

  const handleExportToFigma = React.useCallback(() => {
    alert('TODO: Export to Figma - check the console for export options');
    console.log('Selected themes:', selectedThemes);
    console.log('Selected sets:', selectedSets);
    createVariablesFromThemes(selectedThemes);
    // createVariables();
  }, [selectedThemes, selectedSets]);

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
  }, [setShowOptions, showOptions]);

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
        <Tabs defaultValue="useThemes">
          <Tabs.List>
            <Tabs.Trigger value="useThemes">
              {t('tabs.exportThemes')}
              <StyledProBadge css={{ marginInlineStart: '$2' }}>{isPro ? 'PRO' : 'Get PRO'}</StyledProBadge>
            </Tabs.Trigger>
            <Tabs.Trigger value="useSets">{t('tabs.exportSets')}</Tabs.Trigger>
          </Tabs.List>
          <ExportThemesTab />
          <ExportSetsTab />
        </Tabs>
      </Modal>

      <Button variant="secondary" size="small" onClick={handleOpen}>
        {t('buttonLabel')}
      </Button>
      <OptionsModal isOpen={showOptions} title="Manage / Export Options" closeAction={handleCancelOptions} />
    </>
  );
}
