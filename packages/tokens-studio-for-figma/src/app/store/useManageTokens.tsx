import { useDispatch, useStore } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { SingleToken, TokenToRename } from '@/types/tokens';
import { Dispatch, RootState } from '../store';
import useConfirm from '../hooks/useConfirm';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  DeleteTokenPayload, DuplicateTokenGroupPayload, DuplicateTokenPayload, UpdateTokenPayload,
} from '@/types/payloads';
import useTokens from './useTokens';
import { StyleOptions } from '@/constants/StyleOptions';
import { ColorModifier } from '@/types/Modifier';
import { wrapTransaction } from '@/profiling/transaction';

// @TODO this typing could be more strict in the future

export type EditSingleTokenData = {
  parent: string;
  type: TokenTypes;
  name: string;
  value: SingleToken['value'];
  description?: string;
  oldName?: string;
  shouldUpdateDocument?: boolean;
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      [key: string]: any;
      id?: string;
      modify?: ColorModifier
    }
  }
};

export type CreateSingleTokenData = {
  parent: string;
  type: TokenTypes;
  name: string;
  value: SingleToken['value'];
  description?: string;
  shouldUpdateDocument?: boolean;
  $extensions?: {
    [key: string]: any;
    'studio.tokens'?: {
      id?: string;
      modify?: ColorModifier
    }
  }
};

type Choice = { key: string; label: string; enabled?: boolean, unique?: boolean };

export default function useManageTokens() {
  const store = useStore<RootState>();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const { removeStylesFromTokens } = useTokens();
  const {
    editToken, createToken, deleteToken, duplicateToken, deleteTokenGroup, renameTokenGroup, duplicateTokenGroup, renameTokenAcrossSets, deleteDuplicateTokens,
  } = dispatch.tokenState;

  const editSingleToken = useCallback(async (data: EditSingleTokenData) => {
    const {
      parent, type, name, value, description, oldName, shouldUpdateDocument = true, $extensions,
    } = data;
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_EDITSINGLETOKEN,
      isInfinite: true,
    });

    // should be a setting which users can toggle on / off to disable auto-sync after each token change
    const shouldUpdate = true;
    if (shouldUpdate) {
      editToken({
        parent,
        name,
        type,
        value,
        description,
        oldName,
        shouldUpdate: shouldUpdateDocument,
        $extensions,
      } as UpdateTokenPayload);
      if (oldName) {
        dispatch.tokenState.renameStyleNamesToCurrentTheme([{ oldName, newName: name }]);
        dispatch.tokenState.renameVariableNamesToThemes([{ oldName, newName: name }]);
      }
    }
    dispatch.uiState.completeJob(BackgroundJobs.UI_EDITSINGLETOKEN);
  }, [editToken, dispatch.uiState, dispatch.tokenState]);

  const createSingleToken = useCallback(async (data: CreateSingleTokenData) => {
    const {
      parent, type, name, value, description, shouldUpdateDocument = true, $extensions,
    } = data;
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATESINGLETOKEN,
      isInfinite: true,
    });
    // should be a setting which users can toggle on / off to disable auto-sync after each token change
    const shouldUpdate = true;

    // Importing a variable token can make a new set
    if (!store.getState().tokenState.tokens[parent]) {
      dispatch.tokenState.addTokenSet(parent);
    }

    if (shouldUpdate) {
      createToken({
        parent,
        name,
        type,
        value,
        description,
        shouldUpdate: shouldUpdateDocument,
        $extensions,
      } as UpdateTokenPayload);
    }
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATESINGLETOKEN);
  }, [createToken, dispatch.uiState, dispatch.tokenState, store]);

  const duplicateSingleToken = useCallback(async (data: DuplicateTokenPayload) => {
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_DUPLICATETOKEN,
      isInfinite: true,
    });
    duplicateToken(data);
    dispatch.uiState.completeJob(BackgroundJobs.UI_DUPLICATETOKEN);
  }, [duplicateToken, dispatch.uiState]);

  const deleteSingleToken = useCallback(async (data: DeleteTokenPayload) => {
    const choices: Choice[] = [];
    if (store.getState().tokenState.themes.length > 0 && data.type && [TokenTypes.COLOR, TokenTypes.TYPOGRAPHY, TokenTypes.BOX_SHADOW].includes(data?.type)) {
      choices.push({
        key: StyleOptions.REMOVE, label: 'Delete associated style',
      });
    }

    const userConfirmation = await confirm({
      text: 'Delete token?',
      description: `Are you sure you want to delete the token "${data.path}"?`,
      choices,
      confirmAction: 'Delete',
      variant: 'danger',
    });
    if (userConfirmation) {
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_DELETETOKEN,
        isInfinite: true,
      });
      deleteToken(data); // This triggers an updateDocument call as expected
      if (Array.isArray(userConfirmation.data) && userConfirmation.data.includes(StyleOptions.REMOVE)) {
        removeStylesFromTokens(data);
      }
      dispatch.uiState.completeJob(BackgroundJobs.UI_DELETETOKEN);
      dispatch.tokenState.removeStyleNamesFromThemes(data.path, data.parent); // TODO: This triggers an updateDocument call
      dispatch.tokenState.removeVariableNamesFromThemes(data.path, data.parent); // TODO: This triggers an updateDocument call - its own!
    }
  }, [confirm, deleteToken, dispatch.uiState]);

  const deleteGroup = useCallback(async (path: string, type: string) => {
    const userConfirmation = await confirm({
      text: 'Delete group?',
      description: 'Are you sure you want to delete this group?',
      variant: 'danger',
      confirmAction: 'Delete',
    });
    if (userConfirmation) {
      const activeTokenSet = activeTokenSetSelector(store.getState());
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_DELETETOKENGROUP,
        isInfinite: true,
      });
      deleteTokenGroup({ parent: activeTokenSet, path, type });
      dispatch.uiState.completeJob(BackgroundJobs.UI_DELETETOKENGROUP);
    }
  }, [store, confirm, deleteTokenGroup, dispatch.uiState]);

  const deleteDuplicates = useCallback(async (duplicates: { set: string, path: string, index: number }[]) => {
    const userConfirmation = await confirm({
      formId: 'confirmDeleteDuplicates',
      text: 'Delete duplicate tokens?',
      description: 'Are you sure you want to delete duplicate tokens, keeping only the selected ones?',
      variant: 'danger',
      confirmAction: 'Delete',
    });
    if (userConfirmation) {
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_DELETETOKENGROUP,
        isInfinite: true,
      });
      duplicates?.forEach((duplicate) => {
        const { set, path, index } = duplicate;
        deleteDuplicateTokens({ parent: set, path, index });
      });
      dispatch.uiState.completeJob(BackgroundJobs.UI_DELETETOKENGROUP);
    }
  }, [confirm, deleteDuplicateTokens, dispatch.uiState]);

  const renameGroup = useCallback(async (oldName: string, newName: string, type: string): Promise<TokenToRename[]> => {
    const activeTokenSet = activeTokenSetSelector(store.getState());
    const tokens = tokensSelector(store.getState());
    await renameTokenGroup({
      parent: activeTokenSet, oldName, newName, type,
    });
    const tokensInParent = tokens[activeTokenSet] ?? [];
    const tokensToRename = tokensInParent
      .filter((token) => token.name.startsWith(oldName) && token.type === type)
      .map((filteredToken) => ({
        oldName: filteredToken.name,
        newName: filteredToken.name.replace(oldName, newName),
      }));
    dispatch.tokenState.renameStyleNamesToCurrentTheme(tokensToRename);
    dispatch.tokenState.renameVariableNamesToThemes(tokensToRename);
    return tokensToRename;
  }, [store, renameTokenGroup, dispatch.tokenState]);

  const duplicateGroup = useCallback((data: Omit<DuplicateTokenGroupPayload, 'parent'>) => {
    const activeTokenSet = activeTokenSetSelector(store.getState());

    dispatch.uiState.startJob({ name: BackgroundJobs.UI_DUPLICATETOKENGROUP, isInfinite: true });
    duplicateTokenGroup({
      parent: activeTokenSet, oldName: data.oldName, newName: data.newName, tokenSets: data.tokenSets, type: data.type,
    });
    dispatch.uiState.completeJob(BackgroundJobs.UI_DUPLICATETOKENGROUP);
  }, [store, duplicateTokenGroup, dispatch.uiState]);

  const renameTokensAcrossSets = useCallback(async (oldName: string, newName: string, type: string, tokenSets: string[]) => {
    await renameTokenAcrossSets({
      oldName, newName, type, tokenSets,
    });
  }, [renameTokenAcrossSets]);

  const importMultipleTokens = useCallback(async ({ multipleUpdatedTokens, multipleNewTokens }: { multipleUpdatedTokens?: EditSingleTokenData[], multipleNewTokens?: CreateSingleTokenData[] }) => {
    wrapTransaction({ name: 'importVariables' }, () => {
      dispatch.uiState.startJob({ name: BackgroundJobs.UI_RENAME_TOKEN_ACROSS_SETS, isInfinite: true });

      const hasUpdatedTokens = multipleUpdatedTokens && multipleUpdatedTokens.length > 0;
      const hasNewTokens = multipleNewTokens && multipleNewTokens.length > 0;

      if (hasUpdatedTokens) {
        dispatch.tokenState.editMultipleTokens(multipleUpdatedTokens);
      }

      if (hasNewTokens) {
        dispatch.tokenState.createMultipleTokens(multipleNewTokens);
      }

      dispatch.uiState.completeJob(BackgroundJobs.UI_RENAME_TOKEN_ACROSS_SETS);
    });
  }, [dispatch.uiState, dispatch.tokenState]);

  return useMemo(() => ({
    editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken, renameGroup, duplicateGroup, renameTokensAcrossSets, importMultipleTokens, deleteDuplicates,
  }), [editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken, renameGroup, duplicateGroup, renameTokensAcrossSets, importMultipleTokens, deleteDuplicates]);
}
