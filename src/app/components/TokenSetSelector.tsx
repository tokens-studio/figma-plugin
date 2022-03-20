import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import useConfirm from '../hooks/useConfirm';
import { Dispatch, RootState } from '../store';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import TokenSetTree from './TokenSetTree';
import Box from './Box';
import { styled } from '@/stitches.config';
import TokenSetList from './TokenSetList';

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
  const isMultifile = false;

  const { tokens, editProhibited } = useSelector((state: RootState) => state.tokenState);
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

  const handleNewTokenSetSubmit = (e) => {
    e.preventDefault();
    track('Created token set', { name: newTokenSetName });
    dispatch.tokenState.addTokenSet(newTokenSetName.trim());
  };

  const handleDeleteTokenSet = async (tokenSet) => {
    track('Deleted token set');

    const userConfirmation = await confirm({
      text: `Delete token set "${tokenSet}"?`,
      description: 'Are you sure you want to delete this set?',
    });
    if (userConfirmation) {
      dispatch.tokenState.deleteTokenSet(tokenSet);
    }
  };

  const handleRenameTokenSet = (tokenSet) => {
    track('Renamed token set');
    handleNewTokenSetNameChange(tokenSet);
    setTokenSetMarkedForChange(tokenSet);
    setShowRenameTokenSetFields(true);
  };

  const handleRenameTokenSetSubmit = (e) => {
    e.preventDefault();
    dispatch.tokenState.renameTokenSet({ oldName: tokenSetMarkedForChange, newName: newTokenSetName.trim() });
    setTokenSetMarkedForChange('');
    setShowRenameTokenSetFields(false);
  };

  React.useEffect(() => {
    setShowNewTokenSetFields(false);
    handleNewTokenSetNameChange('');
  }, [tokens]);

  function handleReorder(values: string[]) {
    console.log('Reorder', values);
    dispatch.tokenState.setTokenSetOrder(values);
  }

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
      {isMultifile ? (
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
          onDelete={(set) => handleDeleteTokenSet(set)}
        />
      )}
      <Modal isOpen={showRenameTokenSetFields} close={() => setShowRenameTokenSetFields(false)}>
        <div className="flex flex-col justify-center space-y-4 text-center">
          <Heading size="small">
            Rename
            {' '}
            {tokenSetMarkedForChange}
          </Heading>
          <form onSubmit={handleRenameTokenSetSubmit} className="space-y-4">
            <Input
              full
              value={newTokenSetName}
              onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
              type="text"
              name="tokensetname"
              required
            />
            <div className="space-x-4">
              <Button variant="secondary" size="large" onClick={() => setShowRenameTokenSetFields(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="large" disabled={tokenSetMarkedForChange === newTokenSetName}>
                Change
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={showNewTokenSetFields} close={() => setShowNewTokenSetFields(false)}>
        <div className="flex flex-col justify-center space-y-4 text-center">
          <Heading size="small">New set</Heading>
          <form onSubmit={handleNewTokenSetSubmit} className="space-y-4">
            <Input
              full
              value={newTokenSetName}
              onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
              type="text"
              name="tokensetname"
              required
            />
            <div className="space-x-4">
              <Button variant="secondary" size="large" onClick={() => setShowNewTokenSetFields(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="large">
                Create
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <StyledButton type="button" disabled={editProhibited} onClick={() => setShowNewTokenSetFields(true)}>
        New set
        <Icon name="add" />
      </StyledButton>
    </Box>
  );
}
