import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import useConfirm from '../hooks/useConfirm';
import { Dispatch } from '../store';
import Button from './Button';
import IconAdd from '@/icons/add.svg';
import Input from './Input';
import Modal from './Modal';
import TokenSetTree from './TokenSetTree';
import Box from './Box';
import { styled } from '@/stitches.config';
import {
  editProhibitedSelector, tokensSelector, uiStateSelector,
} from '@/selectors';
import Stack from './Stack';
import OnboardingExplainer from './OnboardingExplainer';

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
  const onboardingData = {
    title: 'Sets',
    text: 'Sets allow you to split your tokens up into multiple files.\n\nYou can activate different sets to control theming.',
    url: 'https://docs.figmatokens.com/themes/token-sets?ref=onboarding_explainer_sets',
  };

  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const uiState = useSelector(uiStateSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
  const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
  const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
  const [oldTokenSetName, setOldTokenSetName] = React.useState('');
  const [isDuplicate, setIsDuplicate] = React.useState(false);
  const allTokenSets = React.useMemo(() => Object.keys(tokens), [tokens]);

  React.useEffect(() => {
    const scrollPositionSet = allTokenSets.reduce<Record<string, number>>((acc, crr) => {
      acc[crr] = 0;
      return acc;
    }, {});
    dispatch.uiState.setScrollPositionSet(scrollPositionSet);
  }, [allTokenSets, dispatch]);

  React.useEffect(() => {
    setShowNewTokenSetFields(false);
  }, [tokens]);

  const handleNewTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    track('Created token set', { name: newTokenSetName });
    dispatch.tokenState.addTokenSet(newTokenSetName.trim());
    handleNewTokenSetNameChange('');
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
    setOldTokenSetName(tokenSet);
    setIsDuplicate(false);
    setShowRenameTokenSetFields(true);
  }, []);

  const handleDuplicateTokenSet = React.useCallback((tokenSet: string) => {
    const newTokenSetName = `${tokenSet}_Copy`;
    handleNewTokenSetNameChange(newTokenSetName);
    setOldTokenSetName(tokenSet);
    setIsDuplicate(true);
    setShowRenameTokenSetFields(true);
  }, []);

  const handleRenameTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDuplicate) {
      track('Duplicate token set', { name: newTokenSetName });
      dispatch.tokenState.duplicateTokenSet(newTokenSetName, oldTokenSetName);
    } else if (tokens.hasOwnProperty(oldTokenSetName)) {
      dispatch.tokenState.renameTokenSet({ oldName: oldTokenSetName, newName: newTokenSetName.trim() });
    } else {
      dispatch.tokenState.renameTokenSetFolder({ oldName: oldTokenSetName, newName: newTokenSetName.trim() });
    }
    setOldTokenSetName('');
    handleNewTokenSetNameChange('');
    setShowRenameTokenSetFields(false);
  }, [dispatch, newTokenSetName, oldTokenSetName, isDuplicate, tokens]);

  const handleReorder = useCallback((values: string[]) => {
    dispatch.tokenState.setTokenSetOrder(values);
  }, [dispatch]);

  const closeOnboarding = useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSets(false);
  }, [dispatch]);

  const handleDelete = useCallback((set: string) => {
    handleDeleteTokenSet(set);
  }, [handleDeleteTokenSet]);

  const handleCloseRenameModal = useCallback(() => {
    setShowRenameTokenSetFields(false);
    handleNewTokenSetNameChange('');
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
        title={`${isDuplicate ? 'Duplicate' : 'Rename'} ${oldTokenSetName}`}
        isOpen={showRenameTokenSetFields}
        close={handleCloseRenameModal}
      >
        <form onSubmit={handleRenameTokenSetSubmit}>
          <Stack direction="column" gap={4}>
            <Input
              full
              autofocus
              value={newTokenSetName}
              onChange={handleChangeName}
              type="text"
              name="tokensetname"
              data-testid="rename-set-input"
              required
            />
            <Stack direction="row" gap={4}>
              <Button variant="secondary" size="large" onClick={handleCloseRenameModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="large" disabled={!newTokenSetName}>
                {
                  isDuplicate ? 'Save' : 'Change'
                }
              </Button>
            </Stack>
          </Stack>
        </form>
      </Modal>
      <Modal
        title="New set"
        isOpen={showNewTokenSetFields}
        close={handleCloseNewTokenSetModal}
      >
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
              data-testid="create-set-input"
              autofocus
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
      </Modal>
      <StyledButton data-cy="button-new-token-set" data-testid="new-set-button" type="button" disabled={editProhibited} onClick={handleOpenNewTokenSetModal}>
        New set
        <IconAdd />
      </StyledButton>
      {uiState.onboardingExplainerSets && (
        <OnboardingExplainer data={onboardingData} closeOnboarding={closeOnboarding} />
      )}
    </Box>
  );
}
