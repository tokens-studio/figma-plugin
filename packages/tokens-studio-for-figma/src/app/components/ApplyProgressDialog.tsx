import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, Spinner, Stack, Text,
} from '@tokens-studio/ui';
import { settingsStateSelector } from '@/selectors';
import { UpdateMode } from '@/constants/UpdateMode';
import Modal from './Modal';
import { useApplyProgressDialog } from '../hooks/useApplyProgressDialog';

function ApplyProgressDialog() {
  const { onCancel, applyDialogMode } = useApplyProgressDialog();
  const settings = useSelector(settingsStateSelector);
  const { t } = useTranslation(['tokens', 'general']);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  const getModeText = () => {
    switch (settings.updateMode) {
      case UpdateMode.SELECTION:
        return t('applyTo.selection.title');
      case UpdateMode.PAGE:
        return t('applyTo.page.title');
      case UpdateMode.DOCUMENT:
        return t('applyTo.document.title');
      default:
        return '';
    }
  };

  switch (applyDialogMode) {
    case 'loading': {
      return (
        <Modal isOpen close={onCancel}>
          <Stack direction="column" gap={4} justify="center" align="center" css={{ padding: '$4 0' }}>
            <Spinner />
            <Heading size="medium">
              {t('applyTo.applyingTokensTo')} {getModeText()}
            </Heading>
          </Stack>
        </Modal>
      );
    }
    case 'success': {
      return (
        <Modal isOpen close={onCancel}>
          <Stack direction="column" align="center" gap={6} css={{ textAlign: 'center', padding: '$4 0' }}>
            <Stack direction="column" gap={4}>
              <Heading data-testid="apply-dialog-success-heading" size="medium">
                {t('applyTo.allDone')}
              </Heading>
              <Text size="small">
                {t('applyTo.tokensAppliedTo')} {getModeText()}
              </Text>
            </Stack>
            <Button
              variant="primary"
              data-testid="apply-dialog-button-close"
              onClick={handleClose}
            >
              {t('general:close')}
            </Button>
          </Stack>
        </Modal>
      );
    }
    default: {
      return null;
    }
  }
}

export default ApplyProgressDialog;