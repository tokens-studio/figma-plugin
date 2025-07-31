import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IconButton, Button } from '@tokens-studio/ui';
import Modal from './Modal';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import {
  activeTokenSetSelector, importedTokensSelector, importedThemesSelector, themesListSelector, renamedCollectionsSelector,
} from '@/selectors';
import Stack from './Stack';
import AddIcon from '@/icons/add.svg';
import TrashIcon from '@/icons/trash.svg';
import Box from './Box';
import { ImportToken } from '@/types/tokens';
import Text from './Text';
import Accordion from './Accordion';
import { Count } from './Count';
import { track } from '@/utils/analytics';

function NewOrExistingToken({
  token,
  updateAction,
  removeToken,
  updateToken,
  index,
}: {
  token: ImportToken;
  updateAction: string;
  index: number;
  removeToken: (token: ImportToken, index: number) => void;
  updateToken: (token: ImportToken, index: number) => void;
}) {
  const { t } = useTranslation(['general', 'tokens']);
  const onRemoveToken = React.useCallback(() => {
    removeToken(token, index);
  }, [removeToken, token, index]);

  const onUpdateToken = React.useCallback(() => {
    updateToken(token, index);
  }, [updateToken, token, index]);

  const importedTokens = useSelector(importedTokensSelector);

  const allParents = [...new Set([...importedTokens.newTokens.map((newToken: ImportToken) => newToken.parent), ...importedTokens.updatedTokens.map((updatedToken) => updatedToken.parent)])];
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
            fontWeight: '$sansBold',
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
              fontWeight: '$sansBold',
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
        <IconButton variant="invisible" size="small" data-testid="imported-tokens-dialog-update-button" tooltip={updateAction} icon={<AddIcon />} onClick={onUpdateToken} />
        <IconButton variant="invisible" size="small" data-testid="imported-tokens-dialog-remove-button" tooltip={t('ignore')} icon={<TrashIcon />} onClick={onRemoveToken} />
      </Stack>
    </Stack>
  );
}

export default function ImportedTokensDialog() {
  const dispatch = useDispatch<Dispatch>();
  const { editSingleToken, createSingleToken, importMultipleTokens } = useManageTokens();
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const themes = useSelector(themesListSelector);
  const importedTokens = useSelector(importedTokensSelector);
  const importedThemes = useSelector(importedThemesSelector);
  const renamedCollections = useSelector(renamedCollectionsSelector);
  const [newThemes, setNewThemes] = React.useState(importedThemes.newThemes);
  const [updatedThemes, setUpdatedThemes] = React.useState(importedThemes.updatedThemes);
  const [newTokens, setNewTokens] = React.useState(importedTokens.newTokens);
  const [updatedTokens, setUpdatedTokens] = React.useState(importedTokens.updatedTokens);

  const { t } = useTranslation(['tokens']);

  const handleIgnoreExistingToken = React.useCallback((token, index) => {
    const tokens = updatedTokens.filter((updatedToken) => updatedTokens.indexOf(updatedToken) !== index);
    setUpdatedTokens(tokens);
  }, [setUpdatedTokens, updatedTokens]);

  const handleIgnoreNewToken = React.useCallback((token, index) => {
    setNewTokens(newTokens.filter((newToken) => newTokens.indexOf(newToken) !== index));
  }, [setNewTokens, newTokens]);

  const handleCreateAllClick = React.useCallback(() => {
    const multipleNewTokens = newTokens.map((token) => ({
      parent: token.parent || activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    }));

    // Create new Tokens
    importMultipleTokens({ multipleNewTokens });
    setNewTokens([]);
  }, [activeTokenSet, importMultipleTokens, newTokens]);

  const handleUpdateAllClick = React.useCallback(() => {
    const multipleUpdatedTokens = updatedTokens.map((token) => ({
      parent: token.parent || activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    }));

    // Update all existing tokens
    importMultipleTokens({ multipleUpdatedTokens });
    setUpdatedTokens([]);
  }, [updatedTokens, importMultipleTokens, activeTokenSet]);

  const handleImportAllClick = React.useCallback(() => {
    const multipleUpdatedTokens = updatedTokens.map((token) => ({
      parent: token.parent || activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    }));

    const multipleNewTokens = newTokens.map((token) => ({
      parent: token.parent || activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    }));

    if (newThemes.length > 0 || updatedThemes.length > 0) {
      dispatch.tokenState.setThemes([
        ...themes.filter((theme) => !updatedThemes.some((updatedTheme) => updatedTheme.group === theme.group)),
        ...newThemes,
        ...updatedThemes,
      ]);
    }

    // Apply renamed collections cleanup if there were any renames
    if (renamedCollections && renamedCollections.length > 0) {
      dispatch.tokenState.handleRenamedCollections(renamedCollections);
      // Clear the renamed collections after applying them
      dispatch.tokenState.setRenamedCollections(null);
    }

    // Update all existing tokens, and create new ones
    importMultipleTokens({ multipleUpdatedTokens, multipleNewTokens });

    const combinedTokens = [...multipleUpdatedTokens, ...multipleNewTokens];

    const uniqueCollectionCount = combinedTokens.reduce((acc, token) => {
      if (token.parent && !acc.includes(token.parent)) {
        acc.push(token.parent);
      }
      return acc;
    }, [] as string[]).length;

    track('Import variables', {
      totalCount: multipleUpdatedTokens.length + multipleNewTokens.length,
      updatedCount: multipleUpdatedTokens.length,
      newCount: multipleNewTokens.length,
      colorTokens: combinedTokens.filter((token) => token.type === 'color').length,
      textTokens: combinedTokens.filter((token) => token.type === 'text').length,
      numberTokens: combinedTokens.filter((token) => token.type === 'number').length,
      booleanTokens: combinedTokens.filter((token) => token.type === 'boolean').length,
      dimensionTokens: combinedTokens.filter((token) => token.type === 'dimension').length,
      collectionCount: uniqueCollectionCount,
    });

    setUpdatedTokens([]);
    setNewTokens([]);
    setNewThemes([]);
    setUpdatedThemes([]);
  }, [activeTokenSet, importMultipleTokens, newTokens, updatedTokens, themes, newThemes, updatedThemes, renamedCollections, dispatch]);

  const handleCreateSingleClick = React.useCallback((token: any) => {
    // Create new tokens according to styles
    createSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    });
    track('Import single variable', { type: token.type });
    setNewTokens(newTokens.filter((newToken) => newToken.name !== token.name));
  }, [newTokens, activeTokenSet, createSingleToken]);

  const handleUpdateSingleClick = React.useCallback((token: any) => {
    // Go through each token that needs to be updated
    editSingleToken({
      parent: activeTokenSet,
      name: token.name,
      value: token.value,
      type: token.type,
      description: token.description,
      shouldUpdateDocument: false,
    });
    track('Update single variable', { type: token.type });

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

  React.useEffect(() => {
    setNewThemes(importedThemes.newThemes);
    setUpdatedThemes(importedThemes.updatedThemes);
  }, [importedThemes.newThemes, importedThemes.updatedThemes]);

  const ListLength = 50;

  return (
    <Modal
      title={t('importVariables', { ns: 'tokens' })}
      size="large"
      showClose
      isOpen={newTokens.length > 0 || updatedTokens.length > 0}
      close={handleClose}
      stickyFooter
      footer={(
        <Stack direction="row" justify="end" gap={2}>
          <Button variant="secondary" data-testid="button-import-close" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button variant="primary" data-testid="button-import-all" onClick={handleImportAllClick}>
            {t('importAll')}
          </Button>
        </Stack>
      )}
    >
      <Stack direction="column" gap={6}>
        {newTokens.length > 0 && (
          <Accordion
            label={t('newTokens', { ns: 'tokens' })}
            isOpenByDefault
            extra={(
              <Stack direction="row" gap={2} align="center">
                <Count count={newTokens.length} />
                {' '}
                <Button variant="secondary" data-testid="button-import-create-all" onClick={handleCreateAllClick}>
                  {t('createAll', { ns: 'tokens' })}
                </Button>
              </Stack>
            )}
          >
            {
              newTokens.slice(0, ListLength - 1).map((token, index) => (
                <NewOrExistingToken
                  key={token.parent + token.name}
                  index={index}
                  token={token}
                  updateAction="Create New"
                  removeToken={handleIgnoreNewToken}
                  updateToken={handleCreateSingleClick}
                />
              ))
}
            {' '}
            {newTokens.length > ListLength && (
            <Text
              css={{ marginBlockStart: '$3' }}
              size="small"
            >
              ...
              {' '}
              {t('and', { ns: 'general' })}
              {' '}
              {newTokens.length - ListLength}
              {' '}
              {t('more', { ns: 'general' })}

            </Text>
            )}

          </Accordion>
        )}
        {updatedTokens.length > 0 && (
          <Accordion
            label={t('existingTokens', { ns: 'tokens' })}
            isOpenByDefault
            extra={(
              <Stack direction="row" gap={2} align="center">
                <Count count={updatedTokens.length} />
                {' '}
                <Button variant="secondary" data-testid="button-import-update-all" onClick={handleUpdateAllClick}>
                  {t('updateAll')}
                </Button>
              </Stack>
            )}
          >
            {
              updatedTokens.slice(0, ListLength).map((token, index) => (
                <NewOrExistingToken
                  key={token.parent + token.name}
                  token={token}
                  index={index}
                  updateAction="Update Existing"
                  removeToken={handleIgnoreExistingToken}
                  updateToken={handleUpdateSingleClick}
                />
              ))
            }
            { updatedTokens.length > 4 && (

            <Text css={{ marginBlockStart: '$3' }} size="small">
              ...
              {' '}
              {t('and', { ns: 'general' })}
              {' '}
              {updatedTokens.length - ListLength}
              {' '}
              {t('more', { ns: 'general' })}
            </Text>
            )}
          </Accordion>
        )}
      </Stack>
    </Modal>
  );
}
