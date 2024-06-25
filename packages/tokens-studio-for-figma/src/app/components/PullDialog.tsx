import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Heading, Spinner, Stack,
} from '@tokens-studio/ui';
import { storageTypeSelector } from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Modal from './Modal';

import { transformProviderName } from '@/utils/transformProviderName';
import ChangedStateList from './ChangedStateList';

function PullDialog() {
  const { onConfirm, onCancel, pullDialogMode } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);

  const { t } = useTranslation(['sync']);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  switch (pullDialogMode) {
    case 'initial': {
      return (
        <Modal
          title={t('pullFrom', { provider: transformProviderName(storageType.provider) })}
          showClose
          full
          size="fullscreen"
          isOpen
          close={onCancel}
          stickyFooter
          footer={(
            <Stack direction="row" gap={4} justify="between">
              <Button variant="secondary" id="pullDialog-button-close" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button variant="primary" id="pullDialog-button-override" onClick={handleOverrideClick}>
                {t('pullTokens')}
              </Button>
            </Stack>
          )}
        >
          <Stack direction="column" gap={4}>
            <Stack direction="row" gap={2} css={{ padding: '$4' }}>
              {t('override')}
            </Stack>
            <ChangedStateList />
          </Stack>
        </Modal>
      );
    }
    case 'loading': {
      return (
        <Modal isOpen close={onCancel}>
          <Stack direction="column" gap={4} justify="center" align="center" css={{ padding: '$4 0' }}>
            <Spinner />
            <Heading size="medium">{t('pullFrom', { provider: transformProviderName(storageType.provider) })}</Heading>
          </Stack>
        </Modal>
      );
    }
    default: {
      return null;
    }
  }
}
export default PullDialog;
