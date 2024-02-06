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
import useOptionsModal from './useOptionsModal';

export default function ManageStylesAndVariables() {
  const { t } = useTranslation(['manageStylesAndVariables', 'tokens']);

  const [showModal, setShowModal] = React.useState(false);

  const isPro = useIsProUser();

  const [showOptions, setShowOptions] = React.useState(false);

  const { OptionsModal, exportOptions } = useOptionsModal();
  const { ExportThemesTab, selectedThemes } = useExportThemesTab();
  const { ExportSetsTab, selectedSets } = useExportSetsTab();

  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleCancelOptions = React.useCallback(() => {
    // DO NOT SAVE THE OPTIONS
    setShowOptions(false);
  }, []);

  const handleExportToFigma = React.useCallback(() => {
    alert('TODO: Export to Figma - check the console for export options');
    console.log('Export options:', exportOptions);
    console.log('Selected themes:', selectedThemes);
    console.log('Selected sets:', selectedSets);
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
  }, [setShowOptions, showOptions]);

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
              <StyledProBadge css={{ marginInlineStart: '$2' }}>{isPro ? 'PRO' : 'Get PRO'}</StyledProBadge>
            </Tabs.Trigger>
            <Tabs.Trigger value="useSets">Token Sets</Tabs.Trigger>
          </Tabs.List>
          <ExportThemesTab />
          <ExportSetsTab />
        </Tabs>
      </Modal>

      <OptionsModal isOpen={showOptions} title="Manage / Export Options" closeAction={handleCancelOptions} />

      <Button variant="secondary" size="small" onClick={handleOpen}>
        {t('stylesAndVariables', { ns: 'tokens' })}
      </Button>
    </>
  );
}
