import React from 'react';
import { useSelector } from 'react-redux';
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
          title={`Pull from ${transformProviderName(storageType.provider)}`}
          showClose
          full
          large
          isOpen
          close={onCancel}
        >
          <Stack direction="column" gap={4}>
            <Stack direction="row" gap={2} css={{ padding: '$4' }}>
              This will override your current tokens. Make sure you copy your changes if you want to preserve them.
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
                Cancel
              </Button>
              <Button variant="primary" id="pullDialog-button-override" onClick={handleOverrideClick}>
                Pull tokens
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
              Fetching Tokens from
              {' '}
              {transformProviderName(storageType.provider)}
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
