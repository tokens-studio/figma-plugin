import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Spinner, Stack,
} from '@tokens-studio/ui';
import { storageTypeSelector } from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Modal from './Modal';
import { useChangedState } from '@/hooks/useChangedState';
import { transformProviderName } from '@/utils/transformProviderName';
import ChangedStateList from './ChangedStateList';

function PullDialog() {
  const { onConfirm, onCancel, pullDialogMode, closePullDialog } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const { changedPullState } = useChangedState();
  const { t } = useTranslation(['sync']);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Check if there are any changes to display
  const hasTokenChanges = Object.entries(changedPullState.tokens).length > 0;
  const hasThemeChanges = changedPullState.themes.length > 0;
  const hasMetadataChanges = changedPullState.metadata?.tokenSetOrder && 
                            Object.entries(changedPullState.metadata.tokenSetOrder).length > 0;
  const hasChanges = hasTokenChanges || hasThemeChanges || hasMetadataChanges;

  // Close the dialog if there are no changes to display
  useEffect(() => {
    if (pullDialogMode === 'initial' && !hasChanges) {
      closePullDialog();
    }
  }, [pullDialogMode, hasChanges, closePullDialog]);

  switch (pullDialogMode) {
    case 'initial': {
      if (!hasChanges) {
        return null;
      }
      
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
      return null;
    }
  }
}
export default PullDialog;
