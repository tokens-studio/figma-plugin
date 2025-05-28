import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Spinner, Stack,
} from '@tokens-studio/ui';
import { storageTypeSelector } from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Modal from './Modal';
import Callout from './Callout';

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
    default: {
      if (typeof pullDialogMode === 'string' && pullDialogMode.startsWith('error:')) {
        const errorMessage = pullDialogMode.replace('error:', '');
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
              <Stack direction="row" gap={4} justify="end">
                <Button variant="primary" id="pullDialog-button-close" onClick={handleClose}>
                  {t('close', { ns: 'general' })}
                </Button>
              </Stack>
            )}
          >
            <Stack direction="column" gap={4} css={{ padding: '$4' }}>
              <Callout
                id="pullDialog-error-callout"
                heading={t('failedToPull', { provider: transformProviderName(storageType.provider) })}
                description={errorMessage}
                action={{
                  onClick: handleClose,
                  text: t('close', { ns: 'general' }),
                }}
              />
            </Stack>
          </Modal>
        );
      }
      return null;
    }
  }
}
export default PullDialog;
