import { useDispatch, useSelector } from 'react-redux';
import { SingleToken } from '@/types/tokens';
import { Dispatch } from '../store';
import useConfirm from '../hooks/useConfirm';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { activeTokenSetSelector } from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';

// @TODO use hooks

export default function useManageTokens() {
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const {
    editToken, createToken, deleteToken, duplicateToken, deleteTokenGroup,
  } = useDispatch<Dispatch>().tokenState;

  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  async function editSingleToken(data: {
    parent: string;
    name: string;
    value: SingleToken;
    options?: { description?: string; type: TokenTypes };
    oldName?: string;
    shouldUpdateDocument?: boolean;
  }) {
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
  }

  async function createSingleToken(data: {
    parent: string;
    name: string;
    value: SingleToken;
    options?: { description?: string; type: TokenType };
    newGroup?: boolean;
    shouldUpdateDocument?: boolean;
  }) {
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
  }

  async function duplicateSingleToken(data) {
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_DUPLICATETOKEN,
      isInfinite: true,
    });
    duplicateToken(data);
    dispatch.uiState.completeJob(BackgroundJobs.UI_DUPLICATETOKEN);
  }

  async function deleteSingleToken(data) {
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
  }

  async function deleteGroup(path) {
    const userConfirmation = await confirm({
      text: 'Delete group?',
      description: 'Are you sure you want to delete this group?',
    });
    if (userConfirmation) {
      dispatch.uiState.startJob({
        name: BackgroundJobs.UI_DELETETOKENGROUP,
        isInfinite: true,
      });
      deleteTokenGroup({ parent: activeTokenSet, path });
      dispatch.uiState.completeJob(BackgroundJobs.UI_DELETETOKENGROUP);
    }
  }

  return {
    editSingleToken, createSingleToken, deleteSingleToken, deleteGroup, duplicateSingleToken,
  };
}
