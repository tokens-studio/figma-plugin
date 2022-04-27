import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import useConfirm from '../hooks/useConfirm';
import { Dispatch } from '../store';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import TokenSetTree from './TokenSetTree';
import Box from './Box';
import { styled } from '@/stitches.config';
import TokenSetList from './TokenSetList';
import { StorageProviderType } from '@/types/api';
import {
  apiSelector, editProhibitedSelector, featureFlagsSelector, tokensSelector,
} from '@/selectors';
import Stack from './Stack';

const StyledButton = styled('button', {
  flexShrink: 0,
  width: '100%',
  fontSize: '$xsmall',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3 $4',
  gap: '$2',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$bgSubtle',
  },
});

export default function TokenSetSelector() {
  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const featureFlags = useSelector(featureFlagsSelector);
  const api = useSelector(apiSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
  const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
  const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
  const [tokenSetMarkedForChange, setTokenSetMarkedForChange] = React.useState('');
  const [allTokenSets, setAllTokenSets] = React.useState(Object.keys(tokens));
  const tokenKeys = Object.keys(tokens).join(',');

  React.useEffect(() => {
    setAllTokenSets(Object.keys(tokens));
  }, [tokenKeys]);

  React.useEffect(() => {
    setShowNewTokenSetFields(false);
    handleNewTokenSetNameChange('');
  }, [tokens]);

  const handleNewTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    track('Created token set', { name: newTokenSetName });
    dispatch.tokenState.addTokenSet(newTokenSetName.trim());
  }, [dispatch, newTokenSetName]);

  const handleDeleteTokenSet = React.useCallback(async (tokenSet: string) => {
    track('Deleted token set');

    const userConfirmation = await confirm({
      text: `Delete token set "${tokenSet}"?`,
      description: 'Are you sure you want to delete this set?',
    });
    if (userConfirmation) {
      dispatch.tokenState.deleteTokenSet(tokenSet);
    }
  }, [confirm, dispatch]);

  const handleRenameTokenSet = React.useCallback((tokenSet: string) => {
    track('Renamed token set');
    handleNewTokenSetNameChange(tokenSet);
    setTokenSetMarkedForChange(tokenSet);
    setShowRenameTokenSetFields(true);
  }, []);

  const handleRenameTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch.tokenState.renameTokenSet({ oldName: tokenSetMarkedForChange, newName: newTokenSetName.trim() });
    setTokenSetMarkedForChange('');
    setShowRenameTokenSetFields(false);
  }, [dispatch, newTokenSetName, tokenSetMarkedForChange]);

  const handleReorder = useCallback((values: string[]) => {
    dispatch.tokenState.setTokenSetOrder(values);
  }, [dispatch]);

  return (
    <Box
      css={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        width: '150px',
        borderRight: '1px solid',
        borderColor: '$borderMuted',
        overflowY: 'auto',
      }}
      className="content"
    >
      {featureFlags?.gh_mfs_enabled
        && (api.provider === StorageProviderType.GITHUB
          || api.provider === StorageProviderType.GITLAB)
          && !api?.filePath?.endsWith('.json')
        ? (
          <Box>
            <TokenSetTree
              tokenSets={allTokenSets}
              onRename={handleRenameTokenSet}
              onDelete={(set) => handleDeleteTokenSet(set)}
            />
          </Box>
        ) : (
          <TokenSetList
            onReorder={(values: string[]) => handleReorder(values)}
            tokenSets={allTokenSets}
            onRename={handleRenameTokenSet}
            onDelete={handleDeleteTokenSet}
          />
        )}
      <Modal isOpen={showRenameTokenSetFields} close={() => setShowRenameTokenSetFields(false)}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">
            Rename
            {' '}
            {tokenSetMarkedForChange}
          </Heading>
          <form onSubmit={handleRenameTokenSetSubmit}>
            <Stack direction="column" gap={4}>
              <Input
                full
                value={newTokenSetName}
                onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
                type="text"
                name="tokensetname"
                required
              />
              <Stack direction="row" gap={4}>
                <Button variant="secondary" size="large" onClick={() => setShowRenameTokenSetFields(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="large" disabled={tokenSetMarkedForChange === newTokenSetName}>
                  Change
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Modal>
      <Modal isOpen={showNewTokenSetFields} close={() => setShowNewTokenSetFields(false)}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">New set</Heading>
          <form onSubmit={handleNewTokenSetSubmit}>
            <Stack direction="column" gap={4}>
              <Input
                full
                value={newTokenSetName}
                onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
                type="text"
                name="tokensetname"
                required
              />
              <Stack direction="row" gap={4}>
                <Button variant="secondary" size="large" onClick={() => setShowNewTokenSetFields(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="large">
                  Create
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Modal>
      <StyledButton type="button" disabled={editProhibited} onClick={() => setShowNewTokenSetFields(true)}>
        New set
        <Icon name="add" />
      </StyledButton>
    </Box>
  );
}
