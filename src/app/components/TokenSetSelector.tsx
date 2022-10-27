import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import useConfirm from '../hooks/useConfirm';
import { Dispatch } from '../store';
import Button from './Button';
import Heading from './Heading';
import IconAdd from '@/icons/add.svg';
import Input from './Input';
import Modal from './Modal';
import TokenSetTree from './TokenSetTree';
import Box from './Box';
import { styled } from '@/stitches.config';
import {
  editProhibitedSelector, tokensSelector,
} from '@/selectors';
import Stack from './Stack';

const StyledButton = styled('button', {
  flexShrink: 0,
  width: '100%',
  fontSize: '$xsmall',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3 $4 $3 $5',
  gap: '$2',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$bgSubtle',
  },
});

export default function TokenSetSelector({ saveScrollPositionSet } : { saveScrollPositionSet: (tokenSet: string) => void }) {
  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
  const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
  const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
  const [tokenSetMarkedForChange, setTokenSetMarkedForChange] = React.useState('');
  const [allTokenSets, setAllTokenSets] = React.useState(Object.keys(tokens));
  const tokenKeys = Object.keys(tokens).join(',');
  React.useEffect(() => {
    console.log('all', allTokenSets)
  }, [allTokenSets])

  React.useEffect(() => {
    const scollPositionSet = allTokenSets.reduce<Record<string, number>>((acc, crr) => {
      acc[crr] = 0;
      return acc;
    }, {});
    dispatch.uiState.setScrollPositionSet(scollPositionSet);
  }, [allTokenSets, dispatch]);

  React.useEffect(() => {
    setAllTokenSets(Object.keys(tokens));
  }, [tokenKeys]);

  React.useEffect(() => {
    setShowNewTokenSetFields(false);
    handleNewTokenSetNameChange(tokenSetMarkedForChange);
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

  const handleDuplicateTokenSet = React.useCallback((tokenSet: string) => {
    const newTokenSetName = `${tokenSet}_Copy`;
    track('Duplicate token set', { name: newTokenSetName });
    dispatch.tokenState.duplicateTokenSet(tokenSet);

    handleNewTokenSetNameChange(newTokenSetName);
    setTokenSetMarkedForChange(newTokenSetName);
    setShowRenameTokenSetFields(true);
  }, [dispatch]);

  const handleRenameTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch.tokenState.renameTokenSet({ oldName: tokenSetMarkedForChange, newName: newTokenSetName.trim() });
    setTokenSetMarkedForChange('');
    setShowRenameTokenSetFields(false);
  }, [dispatch, newTokenSetName, tokenSetMarkedForChange]);

  const handleReorder = useCallback((values: string[]) => {
    dispatch.tokenState.setTokenSetOrder(values);
  }, [dispatch]);

  const handleDelete = useCallback((set: string) => {
    handleDeleteTokenSet(set);
  }, [handleDeleteTokenSet]);

  const handleCloseRenameModal = useCallback(() => {
    setShowRenameTokenSetFields(false);
  }, []);

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleNewTokenSetNameChange(event.target.value);
  }, []);

  const handleCloseNewTokenSetModal = useCallback(() => {
    setShowNewTokenSetFields(false);
  }, []);

  const handleOpenNewTokenSetModal = useCallback(() => {
    setShowNewTokenSetFields(true);
  }, []);

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
      <TokenSetTree
        tokenSets={allTokenSets}
        onRename={handleRenameTokenSet}
        onDelete={handleDelete}
        onDuplicate={handleDuplicateTokenSet}
        onReorder={handleReorder}
        saveScrollPositionSet={saveScrollPositionSet}
      />
      <Modal
        isOpen={showRenameTokenSetFields}
        close={handleCloseRenameModal}
      >
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
                onChange={handleChangeName}
                type="text"
                name="tokensetname"
                required
              />
              <Stack direction="row" gap={4}>
                <Button variant="secondary" size="large" onClick={handleCloseRenameModal}>
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
      <Modal isOpen={showNewTokenSetFields} close={handleCloseNewTokenSetModal}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">New set</Heading>
          <form onSubmit={handleNewTokenSetSubmit}>
            <Stack direction="column" gap={4}>
              <Input
                full
                value={newTokenSetName}
                onChange={handleChangeName}
                type="text"
                name="tokensetname"
                required
                data-cy="token-set-input"
              />
              <Stack direction="row" gap={4}>
                <Button variant="secondary" size="large" onClick={handleCloseNewTokenSetModal}>
                  Cancel
                </Button>
                <Button data-cy="create-token-set" type="submit" variant="primary" size="large">
                  Create
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Modal>
      <StyledButton data-cy="button-new-token-set" type="button" disabled={editProhibited} onClick={handleOpenNewTokenSetModal}>
        New set
        <IconAdd />
      </StyledButton>
    </Box>
  );
}
