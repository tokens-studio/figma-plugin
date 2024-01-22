import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Stack } from '@tokens-studio/ui';
import { ChevronLeftIcon, SlidersIcon } from '@primer/octicons-react';
import useTokens from '../store/useTokens';
import Modal from './Modal';

export default function ManageStylesAndVariables() {
  const { t } = useTranslation(['manageStylesAndVariables', 'tokens']);

  const [showModal, setShowModal] = React.useState(false);
  const handleClose = React.useCallback(() => {
    setShowModal(false);
  }, []);

  const [showOptions, setShowOptions] = React.useState(false);
  const handleShowOptions = React.useCallback(() => {
    setShowOptions(true);
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
              <Button variant="secondary" id="manageStyled-button-options" onClick={handleShowOptions} icon={<SlidersIcon />}>
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
        Hello world
      </Modal>

      <Button variant="secondary" size="small" onClick={() => setShowModal(true)}>
        {t('stylesAndVariables', { ns: 'tokens' })}
      </Button>
    </>
  );
}
