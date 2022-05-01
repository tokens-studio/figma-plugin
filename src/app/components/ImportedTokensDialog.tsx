import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Heading from './Heading';
import Button from './Button';
import Modal from './Modal';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import { activeTokenSetSelector, importedTokensSelector } from '@/selectors';
import Stack from './Stack';
import IconButton from './IconButton';
import AddIcon from '@/icons/add.svg';
import TrashIcon from '@/icons/trash.svg';
import Box from './Box';

function ImportToken({
  name,
  value,
  oldValue,
  description,
  oldDescription,
  updateAction,
  removeToken,
  updateToken,
}: {
  name: string;
  value: string;
  oldValue?: string;
  description?: string;
  oldDescription?: string;
  updateAction: string;
  removeToken: any;
  updateToken: any;
}) {
  return (
    <Stack direction="row" justify="between" css={{ padding: '$2 $4' }}>
      <Stack direction="column" gap={1}>
        <div className="text-xs font-semibold">{name}</div>
        <Stack direction="row" align="center" gap={1}>
          <Box css={{
            padding: '$2',
            wordBreak: 'break-all',
            fontWeight: '$bold',
            borderRadius: '$default',
            fontSize: '$xsmall',
            backgroundColor: '$bgSuccess',
            color: '$fgSuccess',
          }}
          >
            {typeof value === 'object' ? JSON.stringify(value) : value}
          </Box>
          {oldValue ? (
            <Box css={{
              padding: '$2',
              wordBreak: 'break-all',
              fontWeight: '$bold',
              borderRadius: '$default',
              fontSize: '$xsmall',
              backgroundColor: '$bgDanger',
              color: '$fgDanger',
            }}
            >
              {typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue}
            </Box>
          ) : null}
        </Stack>
        {(description || oldDescription) && (
        <div className="text-xxs">
          {description}
          {' '}
          {oldDescription ? ` (before: ${oldDescription})` : ''}
        </div>
        )}
      </Stack>
      <Stack direction="row" align="center" gap={1}>
        <IconButton tooltip={updateAction} icon={<AddIcon />} onClick={updateToken} />
        <IconButton tooltip="Ignore" icon={<TrashIcon />} onClick={removeToken} />
      </Stack>
    </Stack>
  );
}

export default function ImportedTokensDialog() {
  const dispatch = useDispatch<Dispatch>();
  const { editSingleToken, createSingleToken } = useManageTokens();
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const importedTokens = useSelector(importedTokensSelector);
  const [newTokens, setNewTokens] = React.useState(importedTokens.newTokens);
  const [updatedTokens, setUpdatedTokens] = React.useState(importedTokens.updatedTokens);

  const handleIgnoreExistingToken = React.useCallback((token) => () => {
    setUpdatedTokens((updatedTokens.filter((t) => t.name !== token.name)));
  }, [setUpdatedTokens, updatedTokens]);

  const handleIgnoreNewToken = React.useCallback((token) => () => {
    setNewTokens(newTokens.filter((t) => t.name !== token.name));
  }, [setNewTokens, newTokens]);

  const handleCreateNewClick = React.useCallback(() => {
    // Create new tokens according to styles
    // TODO: This should probably be a batch operation
    newTokens.forEach((token) => {
      createSingleToken({
        parent: activeTokenSet,
        name: token.name,
        value: token.value,
        options: {
          type: token.type,
          description: token.description,
        },
        shouldUpdateDocument: false,
      });
    });
    setNewTokens([]);
  }, [newTokens, activeTokenSet, createSingleToken]);

  const handleUpdateClick = React.useCallback(() => {
    // Go through each token that needs to be updated
    // TODO: This should probably be a batch operation
    updatedTokens.forEach((token) => {
      editSingleToken({
        parent: activeTokenSet,
        name: token.name,
        value: token.value,
        options: {
          type: token.type,
          description: token.description,
        },
        shouldUpdateDocument: false,
      });
    });
    setUpdatedTokens([]);
  }, [updatedTokens, editSingleToken, activeTokenSet]);

  const handleImportAllClick = React.useCallback(() => {
    // Perform both actions for all the tokens
    // TODO: This should probably be a batch operation
    handleUpdateClick();
    handleCreateNewClick();
  }, [handleCreateNewClick, handleUpdateClick]);

  const handleCreateSingleClick = React.useCallback((token) => () => {
    // Create new tokens according to styles
    createSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      options: {
        type: token.type,
        description: token.description,
      },
      shouldUpdateDocument: false,
    });
    setNewTokens(newTokens.filter((t) => t.name !== token.name));
  }, [newTokens, activeTokenSet, createSingleToken]);

  const handleUpdateSingleClick = React.useCallback((token) => () => {
    // Go through each token that needs to be updated
    editSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      options: {
        type: token.type,
        description: token.description,
      },
      shouldUpdateDocument: false,
    });
    setUpdatedTokens(updatedTokens.filter((t) => t.name !== token.name));
  }, [updatedTokens, editSingleToken, activeTokenSet]);

  const handleClose = React.useCallback(() => {
    dispatch.tokenState.resetImportedTokens();
  }, [dispatch]);

  React.useEffect(() => {
    setNewTokens(importedTokens.newTokens);
    setUpdatedTokens(importedTokens.updatedTokens);
  }, [importedTokens.newTokens, importedTokens.updatedTokens]);

  if (!newTokens.length && !updatedTokens.length) return null;

  return (
    <Modal
      full
      title="Import Styles"
      large
      showClose
      isOpen={newTokens.length > 0 || updatedTokens.length > 0}
      close={handleClose}
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
            <Button variant="secondary" id="button-import-create-all" onClick={handleCreateNewClick}>
              Create all
            </Button>
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
              <ImportToken
                key={token.name}
                name={token.name}
                value={token.value}
                description={token.description}
                updateAction="Create"
                removeToken={handleIgnoreNewToken(token)}
                updateToken={handleCreateSingleClick(token)}
              />
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
            <Button variant="secondary" id="button-import-update-all" onClick={handleUpdateClick}>
              Update all
            </Button>
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
              <ImportToken
                key={token.name}
                name={token.name}
                value={token.value}
                oldValue={token.oldValue}
                description={token.description}
                oldDescription={token.oldDescription}
                updateAction="Update"
                removeToken={handleIgnoreExistingToken(token)}
                updateToken={handleUpdateSingleClick(token)}
              />
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
          <Button variant="secondary" id="button-import-close" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" id="button-import-all" onClick={handleImportAllClick}>
            Import all
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}
