import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
import { ImportToken } from '@/types/tokens';
import Text from './Text';
import { UpdateTokenPayload } from '@/types/payloads';
import Accordion from './Accordion';
import { Count } from './Count';

function NewOrExistingToken({
  token,
  updateAction,
  removeToken,
  updateToken,
}: {
  token: ImportToken;
  updateAction: string;
  removeToken: (token: ImportToken) => void;
  updateToken: (token: ImportToken) => void;
}) {
  const { t } = useTranslation(['tokens']);
  const onRemoveToken = React.useCallback(() => {
    removeToken(token);
  }, [removeToken, token]);

  const onUpdateToken = React.useCallback(() => {
    updateToken(token);
  }, [updateToken, token]);

  const importedTokens = useSelector(importedTokensSelector);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const allParents = [...new Set([...importedTokens.newTokens.map((t: ImportToken) => t.parent), ...importedTokens.updatedTokens.map((t) => t.parent)])];
  const isMultiParent = allParents.length > 1;

  return (
    <Stack direction="row" justify="between">
      <Stack direction="column" gap={1}>
        <Stack direction="row" gap={2}>
          {isMultiParent && (<Text size="small" muted>{token.parent}</Text>)}
          <Text bold size="small">{token.name}</Text>
        </Stack>
        <Stack direction="row" align="center" gap={1}>
          <Box css={{
            padding: '$2',
            wordBreak: 'break-all',
            fontWeight: '$bold',
            borderRadius: '$small',
            fontSize: '$xsmall',
            backgroundColor: '$successBg',
            color: '$successFg',
          }}
          >
            {typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
          </Box>
          {token.oldValue ? (
            <Box css={{
              padding: '$2',
              wordBreak: 'break-all',
              fontWeight: '$bold',
              borderRadius: '$small',
              fontSize: '$xsmall',
              backgroundColor: '$dangerBg',
              color: '$dangerFg',
            }}
            >
              {typeof token.oldValue === 'object' ? JSON.stringify(token.oldValue) : token.oldValue}
            </Box>
          ) : null}
        </Stack>
        {(token.description || token.oldDescription) && (
          <Text size="small">
            {token.description}
            {' '}
            {token.oldDescription ? ` (before: ${token.oldDescription})` : ''}
          </Text>
        )}
      </Stack>
      <Stack direction="row" align="center" gap={1}>
        <IconButton dataCy="imported-tokens-dialog-update-button" tooltip={updateAction} icon={<AddIcon />} onClick={onUpdateToken} />
        <IconButton dataCy="imported-tokens-dialog-remove-button" tooltip={t('ignore')} icon={<TrashIcon />} onClick={onRemoveToken} />
      </Stack>
    </Stack>
  );
}

export default function ImportedTokensDialog() {
  const dispatch = useDispatch<Dispatch>();
  const { editSingleToken, createSingleToken, importMultipleTokens } = useManageTokens();
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const importedTokens = useSelector(importedTokensSelector);
  const [newTokens, setNewTokens] = React.useState(importedTokens.newTokens);
  const [updatedTokens, setUpdatedTokens] = React.useState(importedTokens.updatedTokens);

  const { t } = useTranslation(['tokens']);

  const handleIgnoreExistingToken = React.useCallback((token) => {
    setUpdatedTokens((updatedTokens.filter((updatedToken) => updatedToken.name !== token.name)));
  }, [setUpdatedTokens, updatedTokens]);

  const handleIgnoreNewToken = React.useCallback((token) => {
    setNewTokens(newTokens.filter((newToken) => newToken.name !== token.name));
  }, [setNewTokens, newTokens]);

  const handleCreateAllClick = React.useCallback(() => {
    // Create new tokens according to styles
    importMultipleTokens(newTokens as UpdateTokenPayload[]);
    setNewTokens([]);
  }, [newTokens, importMultipleTokens]);

  const handleUpdateAllClick = React.useCallback(() => {
    // Go through each token that needs to be updated
    importMultipleTokens(updatedTokens as UpdateTokenPayload[]);
    setUpdatedTokens([]);
  }, [updatedTokens, importMultipleTokens]);

  const handleImportAllClick = React.useCallback(() => {
    // Perform both actions for all the tokens
    importMultipleTokens([...newTokens, ...updatedTokens] as UpdateTokenPayload[]);
    setNewTokens([]);
    setUpdatedTokens([]);
  }, [importMultipleTokens, newTokens, updatedTokens]);

  const handleCreateSingleClick = React.useCallback((token) => {
    // Create new tokens according to styles
    createSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    });
    setNewTokens(newTokens.filter((newToken) => newToken.name !== token.name));
  }, [newTokens, activeTokenSet, createSingleToken]);

  const handleUpdateSingleClick = React.useCallback((token) => {
    // Go through each token that needs to be updated
    editSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    });
    setUpdatedTokens(updatedTokens.filter((updatedToken) => updatedToken.name !== token.name));
  }, [updatedTokens, editSingleToken, activeTokenSet]);

  const handleClose = React.useCallback(() => {
    dispatch.tokenState.resetImportedTokens();
  }, [dispatch]);

  // If the imported tokens change, update the state
  React.useEffect(() => {
    setNewTokens(importedTokens.newTokens);
    setUpdatedTokens(importedTokens.updatedTokens);
  }, [importedTokens.newTokens, importedTokens.updatedTokens]);

  return (
    <Modal
      title="Import"
      large
      showClose
      isOpen={newTokens.length > 0 || updatedTokens.length > 0}
      close={handleClose}
      stickyFooter
      footer={(
        <Stack direction="row" gap={2}>
          <Button variant="secondary" id="button-import-close" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button variant="secondary" id="button-import-create-all" onClick={handleCreateAllClick}>
            {t('createAll')}
          </Button>
          <Button variant="primary" id="button-import-all" onClick={handleImportAllClick}>
            {t('importAll')}
          </Button>
        </Stack>
      )}
    >
      <Stack direction="column" gap={6}>
        {newTokens.length > 0 && (
          <Accordion
            label="New Tokens"
            isOpenByDefault
            extra={(
              <Stack direction="row" gap={2} align="center">
                <Count count={newTokens.length} />
                {' '}
                <Button variant="secondary" id="button-import-update-all" onClick={handleCreateAllClick}>
                  {t('createAll')}
                </Button>
              </Stack>
            )}
          >
            {
              newTokens.slice(0, 4).map((token) => (
                <NewOrExistingToken
                  key={token.parent + token.name}
                  token={token}
                  updateAction="Create New"
                  removeToken={handleIgnoreNewToken}
                  updateToken={handleCreateSingleClick}
                />
              ))
}
            {' '}
            {newTokens.length > 4 && (
            <Button
              css={{ marginBlockStart: '$3' }}
              variant="secondary"
              id="new-show-more"
              disabled
            >
              Review all
              {' '}
              {newTokens.length}
              {' '}
              coming soon
            </Button>
            )}

          </Accordion>
        )}
        {updatedTokens.length > 0 && (
          <Accordion
            label="Updated Tokens"
            isOpenByDefault
            extra={(
              <Stack direction="row" gap={2} align="center">
                <Count count={updatedTokens.length} />
                {' '}
                <Button variant="secondary" id="button-import-update-all" onClick={handleUpdateAllClick}>
                  {t('updateAll')}
                </Button>
              </Stack>
            )}
          >
            {
              updatedTokens.slice(0, 4).map((token) => (
                <NewOrExistingToken
                  key={token.parent + token.name}
                  token={token}
                  updateAction="Update Existing"
                  removeToken={handleIgnoreExistingToken}
                  updateToken={handleUpdateSingleClick}
                />
              ))
            }
            { updatedTokens.length > 4 && (

            <Button css={{ marginBlockStart: '$3' }} variant="secondary" id="new-show-more" disabled>
              Review all
              {' '}
              {updatedTokens.length}
              {' '}
              coming soon
            </Button>
            )}
          </Accordion>
        )}
      </Stack>
    </Modal>
  );
}
