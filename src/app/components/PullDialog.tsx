import React from 'react';
import { useSelector } from 'react-redux';
import {
  changedTokensSelector, storageTypeSelector,
} from '@/selectors';
import usePullDialog from '../hooks/usePullDialog';
import Button from './Button';
import Heading from './Heading';
import Modal from './Modal';
import Stack from './Stack';
import Spinner from './Spinner';
import Box from './Box';
import { transformProviderName } from '@/utils/transformProviderName';
import ChangedTokenList from './ChangedTokenList';

function PullDialog() {
  const { onConfirm, onCancel, showPullDialog } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const changedTokens = useSelector(changedTokensSelector);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  switch (showPullDialog) {
    case 'initial': {
      return (
        <Modal
          title={`Pull from ${transformProviderName(storageType.provider)}`}
          showClose
          large
          isOpen
          close={onCancel}
        >
          <Stack direction="column" gap={4}>
            {Object.entries(changedTokens).length > 0 && (
              <ChangedTokenList changedTokens={changedTokens} />
            )}
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
                Override Tokens
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
