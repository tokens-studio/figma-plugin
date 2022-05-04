import { useDispatch, useStore } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { SingleToken } from '@/types/tokens';
import { Dispatch, RootState } from '../store';
import useConfirm from '../hooks/useConfirm';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { activeTokenSetSelector } from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';
import { DeleteTokenPayload, UpdateTokenPayload } from '@/types/payloads';

type EditSingleTokenData = {
  parent: string;
  name: string;
  value: SingleToken;
  options?: { description?: string; type: TokenTypes };
  oldName?: string;
  shouldUpdateDocument?: boolean;
};

type CreateSingleTokenData = {
  parent: string;
  name: string;
  value: SingleToken;
  options?: { description?: string; type: TokenTypes };
  newGroup?: boolean;
  shouldUpdateDocument?: boolean;
};

export default function useManageTokens() {
  const store = useStore<RootState>();
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();
  const {
    editToken, createToken, deleteToken, duplicateToken, deleteTokenGroup, renameTokenGroup, duplicateTokenGroup,
  } = dispatch.tokenState;

  const editSingleToken = useCallback(async (data: EditSingleTokenData) => {
    const {
      parent, name, value, options, oldName, shouldUpdateDocument = true,
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
        value,
        options,
        oldName,
        shouldUpdate: shouldUpdateDocument,
      });
    }
    dispatch.uiState.completeJob(BackgroundJobs.UI_EDITSINGLETOKEN);
  }, [editToken, dispatch.uiState]);

  const createSingleToken = useCallback(async (data: CreateSingleTokenData) => {
    const {
      parent, name, value, options, newGroup = false, shouldUpdateDocument = true,
    } = data;
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATESINGLETOKEN,
      isInfinite: true,
    });
    // should be a setting which users can toggle on / off to disable auto-sync after each token change
    const shouldUpdate = true;
    if (shouldUpdate) {
      createToken({
        parent,
        name,
        value,
        options,
        newGroup,
        shouldUpdate: shouldUpdateDocument,
      });
    }
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATESINGLETOKEN);
  }, [createToken, dispatch.uiState]);

  const duplicateSingleToken = useCallback(async (data: UpdateTokenPayload) => {
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_DUPLICATETOKEN,
      isInfinite: true,
    });
    duplicateToken(data);
    dispatch.uiState.completeJob(BackgroundJobs.UI_DUPLICATETOKEN);
  }, [duplicateToken, dispatch.uiState]);

  const deleteSingleToken = useCallback(async (data: DeleteTokenPayload) => {
    const userConfirmation = await confirm({
      text: 'Delete token?',
      description: 'Are you sure you want to delete this token?',
    });
    if (userConfirmation) {
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_DELETETOKEN,
        isInfinite: true,
      });
      deleteToken(data);
      dispatch.uiState.completeJob(BackgroundJobs.UI_DELETETOKEN);
    }
  }, [confirm, deleteToken, dispatch.uiState]);

  const deleteGroup = useCallback(async (path: string) => {
    const userConfirmation = await confirm({
      text: 'Delete group?',
      description: 'Are you sure you want to delete this group?',
    });
    if (userConfirmation) {
      const activeTokenSet = activeTokenSetSelector(store.getState());
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_DELETETOKENGROUP,
        isInfinite: true,
      });
      deleteTokenGroup({ parent: activeTokenSet, path });
      dispatch.uiState.completeJob(BackgroundJobs.UI_DELETETOKENGROUP);
    }
  }, [store, confirm, deleteTokenGroup, dispatch.uiState]);

  const renameGroup = useCallback(async (path: string, newName: string, type: string) => {
    const activeTokenSet = activeTokenSetSelector(store.getState());
    const oldName = path.split('.').pop() || '';
    const newPath = path.slice(0, path.length-oldName.length);
    
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_RENAMETOKENGROUP, isInfinite: true });
<<<<<<< HEAD
    await renameTokenGroup({ parent: activeTokenSet, path: newPath, oldName: oldName, newName: newName, type: type});
    dispatch.uiState.completeJob(BackgroundJobs.UI_RENAMETOKENGROUP);
  }, [store, renameTokenGroup, dispatch.uiState]);

  const duplicateGroup = useCallback(async (path: string, type: string) => {
    const activeTokenSet = activeTokenSetSelector(store.getState());
    const oldName = path.split('.').pop() || '';
    const newPath = path.slice(0, path.length-oldName.length);

    dispatch.uiState.startJob({ name: BackgroundJobs.UI_DUPLICATETOKENGROUP, isInfinite: true});
    await duplicateTokenGroup({parent: activeTokenSet, path: newPath, oldName: oldName, type: type});
    dispatch.uiState.completeJob(BackgroundJobs.UI_DUPLICATETOKENGROUP);
  }, [store, duplicateTokenGroup, dispatch.uiState]);
  return useMemo(() => ({
    editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken, renameGroup, duplicateGroup
  }), [editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken, renameGroup, duplicateGroup]);
=======
    renameTokenGroup({ parent: activeTokenSet, path: newPath, oldName: oldName, newName: newName, type: type});
    dispatch.uiState.completeJob(BackgroundJobs.UI_RENAMETOKENGROUP);
  }, [store, renameTokenGroup, dispatch.uiState]);
  return useMemo(() => ({
    editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken, renameGroup
  }), [editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken, renameGroup]);
>>>>>>> 20bddac (resolve conflict)
}
