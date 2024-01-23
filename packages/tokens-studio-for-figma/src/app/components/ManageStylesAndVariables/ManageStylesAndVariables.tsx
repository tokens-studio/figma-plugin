import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack } from '@tokens-studio/ui';
import { ChevronLeftIcon, SlidersIcon } from '@primer/octicons-react';
import Modal from '../Modal';
import Options from './options';

export default function ManageStylesAndVariables() {
  const { t } = useTranslation(['manageStylesAndVariables', 'tokens']);

  const [showModal, setShowModal] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);

  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleCancelOptions = React.useCallback(() => {
    // DO NOT SAVE THE OPTIONS
    setShowOptions(false);
  }, [showOptions]);

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

  const handleExportToFigma = React.useCallback(() => {
    alert('TODO: Export to Figma');
  }, []);

  const [canExportToFigma, setCanExportToFigma] = React.useState(false);

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
        Hello world
      </Modal>

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

            <Button variant="primary" id="pullDialog-button-override" onClick={handleExportToFigma} disabled={!canExportToFigma}>
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
