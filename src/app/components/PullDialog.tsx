import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  changedStateSelector, storageTypeSelector,
} from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Button from './Button';
import Heading from './Heading';
import Modal from './Modal';
import Stack from './Stack';
import Spinner from './Spinner';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import ChangedStateList from './ChangedStateList';

function PullDialog() {
  const { onConfirm, onCancel, pullDialogMode } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const changedState = useSelector(changedStateSelector);

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
          large
          isOpen
          close={onCancel}
        >
          <Stack direction="column" gap={4}>
            <Stack direction="row" gap={2} css={{ padding: '$4' }}>
              {t('override')}
            </Stack>
            <ChangedStateList changedState={changedState} />
            <Box css={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '$4',
              borderTop: '1px solid',
              borderColor: '$borderMuted',
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '$bgDefault',
            }}
            >
              <Button variant="secondary" id="pullDialog-button-close" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button variant="primary" id="pullDialog-button-override" onClick={handleOverrideClick}>
                {t('pullTokens')}
              </Button>
            </Box>
          </Stack>
        </Modal>
      );
    }
    case 'loading': {
      return (
        <Modal
          large
          isOpen
          close={onCancel}
          title={`Pull from ${transformProviderName(storageType.provider)}`}
        >
          <Stack direction="column" gap={4} justify="center" align="center">
            <Spinner />
            <Heading size="medium">
              {t('pullFrom', { provider: transformProviderName(storageType.provider) })}
            </Heading>
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
