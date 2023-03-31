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

function PullDialog() {
  const { onConfirm, onCancel, showPullDialog } = usePullDialog();
  const storageType = useSelector(storageTypeSelector);
  const changedTokens = useSelector(changedTokensSelector);
  const [newTokens, setNewTokens] = React.useState(changedTokens.newTokens);
  const [updatedTokens, setUpdatedTokens] = React.useState(changedTokens.updatedTokens);

  const handleOverrideClick = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  React.useEffect(() => {
    setNewTokens(changedTokens.newTokens);
    setUpdatedTokens(changedTokens.updatedTokens);
  }, [changedTokens.newTokens, changedTokens.updatedTokens]);

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
            {newTokens.length > 0 && (
            <div>
              <Stack
                direction="row"
                justify="between"
                align="center"
                css={{ padding: '$2 $4' }}
              >
                <Heading>New Tokens</Heading>
              </Stack>
              <Stack
                direction="column"
                gap={1}
                css={{
                  borderTop: '1px solid',
                  borderColor: '$borderMuted',
                }}
              >
                {newTokens.map((token) => (
                  <div />
                ))}
              </Stack>
            </div>
            )}
            {updatedTokens.length > 0 && (
            <div>
              <Stack
                direction="row"
                justify="between"
                align="center"
                css={{ padding: '$2 $4' }}
              >
                <Heading>Existing Tokens</Heading>
              </Stack>
              <Stack
                direction="column"
                gap={1}
                css={{
                  borderTop: '1px solid',
                  borderColor: '$borderMuted',
                }}
              >
                {updatedTokens.map((token) => (
                  <div />
                ))}
              </Stack>
            </div>
            )}
            <Box css={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '$4',
              borderTop: '1px solid',
              borderColor: '$borderMuted',
            }}
            >
              <Button variant="secondary" id="pullDaialog-button-close" onClick={handleClose}>
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
    // case 'success': {
    //   return (
    //     <Modal
    //       large
    //       isOpen
    //       close={onCancel}
    //       title={`Pull from ${transformProviderName(storageType.provider)}`}
    //     >
    //       <Stack direction="column" gap={6} css={{ textAlign: 'center' }}>
    //         <Stack direction="column" gap={4}>
    //           <Heading id="pull-dialog-success-heading" size="medium">All done!</Heading>
    //           <Text size="small">
    //             Changes pulled to
    //             {' '}
    //             {transformProviderName(storageType.provider)}
    //           </Text>
    //         </Stack>
    //         <Box css={{
    //           display: 'flex',
    //           justifyContent: 'space-between',
    //           padding: '$4',
    //           borderTop: '1px solid',
    //           borderColor: '$borderMuted',
    //         }}
    //         >
    //           <Button variant="secondary" id="pullDaialog-button-close">
    //             Cancel
    //           </Button>
    //           <Button variant="primary" id="pullDialog-button-override">
    //             Override Tokens
    //           </Button>
    //         </Box>
    //       </Stack>
    //     </Modal>
    //   );
    // }
    default: {
      return null;
    }
  }
}
export default PullDialog;
