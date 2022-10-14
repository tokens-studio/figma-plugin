import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InfoCircledIcon, Cross1Icon } from '@radix-ui/react-icons';
import { track } from '@/utils/analytics';
import getOnboardingFlag from '@/utils/getOnboardingFlag';
import useConfirm from '../hooks/useConfirm';
import { Dispatch } from '../store';
import Button from './Button';
import Heading from './Heading';
import IconAdd from '@/icons/add.svg';
import Input from './Input';
import IconButton from './IconButton';
import Modal from './Modal';
import TokenSetTree from './TokenSetTree';
import Box from './Box';
import { styled } from '@/stitches.config';
import {
  editProhibitedSelector, tokensSelector, uiStateSelector,
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

export default function TokenSetSelector({ saveScrollPositionSet }: { saveScrollPositionSet: (tokenSet: string) => void }) {
  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const uiState = useSelector(uiStateSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
  const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
  const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
  const [tokenSetMarkedForChange, setTokenSetMarkedForChange] = React.useState('');
  const [allTokenSets, setAllTokenSets] = React.useState(Object.keys(tokens));
  const tokenKeys = Object.keys(tokens).join(',');

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

  const closeOnboarding = useCallback(async (): Promise<boolean> => {
    dispatch.uiState.setOnboardingFlag(false);
    console.log('getOnboarding: ', await getOnboardingFlag());
    return getOnboardingFlag();
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
      {uiState.onboardingFlag && (
        <Box css={{
          display: 'flex', flexDirection: 'column', gap: '$2', padding: '$4', borderBottom: '1px solid $borderMuted', borderTop: '1px solid $borderMuted',
        }}
        >
          <Stack direction="row" gap={2} justify="between">
            <Stack direction="row" justify="between" gap={2} align="center">
              <InfoCircledIcon className="text-primary-500" />
              <Heading size="medium">Sets</Heading>
            </Stack>
            <IconButton onClick={closeOnboarding} icon={<Cross1Icon />} />
          </Stack>
          <p className="text-xs">
            Sets allow you to split your tokens up into multiple files.
            <br />
            <br />
            You can activate different sets to control theming.
          </p>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://docs.figmatokens.com/themes/token-sets?ref=onboarding_explainer_sets"
            className="inline-flex text-xs text-primary-500"
          >
            Read more
          </a>
        </Box>
      )}
    </Box>
  );
}
