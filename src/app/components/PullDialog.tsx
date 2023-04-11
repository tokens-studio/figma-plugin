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
  const { onConfirm, onCancel, showPullDialog } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const changedState = useSelector(changedStateSelector);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  const renderContent = React.useCallback(() => {
    switch (showPullDialog) {
      case 'initial': {
        return (
          <Stack direction="column" gap={4}>
            <Stack direction="row" gap={2}>
              This will override your current tokens. Make sure you copy your changes if you want to preserve them.
            </Stack>
            <ChangedStateList changedState={changedState} />
            <Box css={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '$4',
              borderTop: '1px solid',
              borderColor: '$borderMuted',
            }}
            >
              <Button variant="secondary" id="pullDialog-button-close" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" id="pullDialog-button-override" onClick={handleOverrideClick}>
                Override tokens
              </Button>
            </Box>
          </Stack>
        );
      }
      case 'loading': {
        return (
          <Stack direction="column" gap={4} justify="center" align="center">
            <Spinner />
            <Heading size="medium">
              Fetching Tokens from
              {' '}
              {transformProviderName(storageType.provider)}
            </Heading>
          </Stack>
        );
      }
      default: {
        return null;
      }
    }
  }, [changedState, showPullDialog, storageType.provider]);

  return (
    <Modal
      title={`Pull from ${transformProviderName(storageType.provider)}`}
      showClose
      large
      isOpen
      close={onCancel}
    >
      {renderContent()}
    </Modal>
  );
}
export default PullDialog;
