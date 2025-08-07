import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Spinner, Stack,
} from '@tokens-studio/ui';
import { storageTypeSelector, lastErrorSelector } from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Modal from './Modal';
import Callout from './Callout';

import { transformProviderName } from '@/utils/transformProviderName';
import ChangedStateList from './ChangedStateList';

function PullDialog() {
  const { onConfirm, onCancel, pullDialogMode } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const lastError = useSelector(lastErrorSelector);

  const { t } = useTranslation(['sync']);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  const getErrorHeading = React.useCallback(() => {
    if (!lastError) return t('genericError');

    // Use the centralized header - no fallback needed since all errors now have headers
    return lastError.header;
  }, [lastError, t]);

  switch (pullDialogMode) {
    case 'initial': {
      return (
        <Modal
          title={t('pullFrom', { provider: transformProviderName(storageType.provider) })}
          showClose
          full
          size="large"
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
          <Stack direction="row" gap={2} css={{ padding: '$4', paddingBottom: 0 }}>
            {t('override')}
          </Stack>
          <ChangedStateList type="pull" />
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
    case 'error': {
      return (
        <Modal
          title={t('couldNotLoadTokens')}
          showClose
          full
          size="large"
          isOpen
          close={onCancel}
          stickyFooter
          footer={(
            <Stack direction="row" gap={4} justify="end">
              <Button variant="secondary" id="pullDialog-button-cancel" onClick={onCancel}>
                {t('cancel')}
              </Button>
            </Stack>
          )}
        >
          <Stack direction="column" gap={4} css={{ padding: '$4' }}>
            {lastError && (
              <Callout
                id="pull-dialog-error"
                heading={getErrorHeading()}
                description={lastError.message}
              />
            )}
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
