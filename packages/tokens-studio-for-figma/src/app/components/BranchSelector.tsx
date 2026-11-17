import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Spinner, Stack, Heading,
} from '@tokens-studio/ui';
import {
  branchSelector,
  localApiStateBranchSelector,
  apiSelector,
  usedTokenSetSelector,
  localApiStateSelector,
  activeThemeSelector,
  editProhibitedSelector,
} from '@/selectors';
import useRemoteTokens from '../store/remoteTokens';
import useConfirm from '@/app/hooks/useConfirm';
import useStorage from '@/app/store/useStorage';
import { Dispatch } from '../store';
import { isGitProvider } from '@/utils/is';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { getSyncedCredentials } from '@/utils/getSyncedCredentials';
import type { RemoteResponseData } from '@/types/RemoteResponseData';
import { StorageTypeCredentials } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { track } from '@/utils/analytics';
import CreateBranchModal from './modals/CreateBranchModal';
import Modal from './Modal';

import { BranchSelectorPopover } from './BranchSelectorPopover';
import { useChangedState } from '@/hooks/useChangedState';

export default function BranchSelector() {
  const { confirm } = useConfirm();
  const {
    pullTokens,
    fetchBranches,
    getBranchLifecycle,
  } = useRemoteTokens();
  const dispatch = useDispatch<Dispatch>();
  const { setStorageType } = useStorage();
  const { hasChanges } = useChangedState();

  const branchState = useSelector(branchSelector);
  const localApiState = useSelector(localApiStateSelector);
  const localApiStateBranch = useSelector(localApiStateBranchSelector);
  const apiData = useSelector(apiSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const { t } = useTranslation(['branch', 'licence']);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(localApiStateBranch);
  const [startBranch, setStartBranch] = useState<string | null>(null);
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [isCurrentChanges, setIsCurrentChanges] = useState(false);
  const [isSwitchingBranch, setIsSwitchingBranch] = useState(false);

  const handleCloseModal = React.useCallback(() => {
    setCreateBranchModalVisible(false);
  }, []);

  const handleCloseSwitchingModal = React.useCallback(() => {
    // Do nothing - prevent closing the modal during branch switch
  }, []);

  const handleOpenChangePopover = React.useCallback(async (open: boolean) => {
    setIsPopoverOpen(open);
    if (open) {
      if (apiData && localApiState) {
        const isTokensStudioProvider = apiData?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH && localApiState?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;
        if ((isGitProvider(apiData) && isGitProvider(localApiState)) || isTokensStudioProvider) {
          try {
            const fetchedBranches = await fetchBranches(apiData);
            if (fetchedBranches) {
              dispatch.branchState.setBranches(fetchedBranches);
            }
          } catch (error) {
            console.error('Failed to fetch branches upon opening popover:', error);
          }
        }
      }
    }
  }, [apiData, localApiState, dispatch, fetchBranches]);

  useEffect(() => {
    setCurrentBranch(localApiStateBranch);
  }, [localApiStateBranch, setCurrentBranch]);

  const askUserIfPushChanges = React.useCallback(async () => {
    const confirmResult = await confirm({
      text: t('unSavedChanges') as string,
      description: t('ifYouCreate') as string,
      confirmAction: t('discardChanges') as string,
      cancelAction: t('cancel') as string,
    });
    if (confirmResult) {
      return confirmResult.result;
    }
    return null;
  }, [confirm, t]);

  const createBranchFromCurrentChanges = React.useCallback(() => {
    track('Create new branch from current changes');
    setIsCurrentChanges(true);
    setStartBranch(currentBranch ?? null);
    setCreateBranchModalVisible(true);
  }, [currentBranch]);

  const createNewBranchFromSelected = React.useCallback(
    async (branch: string) => {
      track('Create new branch from specific branch');

      if (getBranchLifecycle?.(apiData)) {
        if (hasChanges && !(await askUserIfPushChanges())) return;
        setIsCurrentChanges(false);
        setStartBranch(branch);
        setCreateBranchModalVisible(true);
        return;
      }

      if (hasChanges && apiData?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH && (await askUserIfPushChanges())) {
        // User chose to discard changes - clear local token state
        dispatch.tokenState.setEmptyTokens();
      }

      setStartBranch(branch);
      setCreateBranchModalVisible(true);
    },
    [hasChanges, askUserIfPushChanges, dispatch, apiData, getBranchLifecycle],
  );

  const selectSyncedBranch = React.useCallback((branch: string, data: Extract<RemoteResponseData, { status: 'success' }>) => {
    const context = getSyncedCredentials({ ...apiData, branch } as StorageTypeCredentials, data);
    setCurrentBranch(branch);
    dispatch.uiState.setApiData(context);
    dispatch.uiState.setLocalApiState(context);
    AsyncMessageChannel.ReactInstance.message({ type: AsyncMessageTypes.CREDENTIALS, credential: context });
    setStorageType({ provider: context, shouldSetInDocument: true });
  }, [apiData, dispatch, setStorageType]);

  const changeAndPull = React.useCallback(
    async (branch: string) => {
      const isTokensStudioProvider = apiData?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH && localApiState?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;
      if ((isGitProvider(apiData) && isGitProvider(localApiState)) || isTokensStudioProvider) {
        setIsSwitchingBranch(true);
        try {
          const lifecycle = getBranchLifecycle?.(apiData);
          if (lifecycle) {
            const data = await lifecycle.switchBranch(branch, { usedTokenSet, activeTheme });
            if (data?.status === 'success') selectSyncedBranch(data.branch ?? branch, data);
            return;
          }
          // Clear local token state BEFORE pulling to prevent bleed
          dispatch.tokenState.setEmptyTokens();
          // Pull tokens from new branch BEFORE switching UI state
          const remoteData = await pullTokens({
            context: { ...apiData, branch }, usedTokenSet, activeTheme, updateLocalTokens: true, skipConfirmation: true,
          });
          // For Tokens Studio, the branch is identified by its changeSetId, which
          // pullTokens resolves for the newly selected branch. Carry it forward so
          // subsequent edits (e.g. deletes) target this branch and not the previous
          // one. The stale `apiData` closure still holds the old branch's changeSetId,
          // so we must not spread it back over the freshly resolved value.
          const changeSetId = remoteData?.status === 'success' ? remoteData.metadata?.changeSetId : undefined;
          if (isTokensStudioProvider && !changeSetId) {
            // We couldn't resolve the new branch's change set (e.g. the pull failed).
            // Don't switch the branch context: doing so would leave writes scoped to the
            // previous branch's changeSetId (or, if cleared, to the server default) — either
            // way silently targeting the wrong branch. pullTokens has already surfaced the error.
            return;
          }
          const nextApiData = { ...apiData, branch, ...(changeSetId ? { changeSetId } : {}) } as StorageTypeCredentials;
          // Now update UI state to show the new branch with already-loaded tokens
          setCurrentBranch(branch);
          dispatch.uiState.setApiData(nextApiData);
          dispatch.uiState.setLocalApiState({ ...localApiState, branch });
          AsyncMessageChannel.ReactInstance.message({
            type: AsyncMessageTypes.CREDENTIALS,
            credential: nextApiData,
          });
          setStorageType({ provider: nextApiData, shouldSetInDocument: true });
        } finally {
          setIsSwitchingBranch(false);
        }
      }
    },
    [apiData, localApiState, dispatch, pullTokens, usedTokenSet, activeTheme, setStorageType, getBranchLifecycle, selectSyncedBranch],
  );

  const onBranchSelected = React.useCallback(
    async (branch: string) => {
      track('Branch changed');
      if (hasChanges && !editProhibited && apiData?.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH) {
        if (await askUserIfPushChanges()) {
          await changeAndPull(branch);
        }
      } else {
        await changeAndPull(branch);
      }
    },
    [askUserIfPushChanges, changeAndPull, hasChanges, editProhibited, apiData?.provider],
  );

  const onCreateBranchModalSuccess = React.useCallback(
    (branch: string, branches: string[], data?: Extract<RemoteResponseData, { status: 'success' }>) => {
      setCreateBranchModalVisible(false);
      if (data) {
        dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
        selectSyncedBranch(branch, data);
        return;
      }
      setCurrentBranch(branch);
      const isTokensStudioProvider = apiData?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH && localApiState?.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;
      if ((isGitProvider(apiData) && isGitProvider(localApiState)) || isTokensStudioProvider) {
        dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
        dispatch.uiState.setApiData({ ...apiData, branch } as StorageTypeCredentials);
        dispatch.uiState.setLocalApiState({ ...localApiState, branch } as StorageTypeCredentials);
      }
    },
    [dispatch, apiData, localApiState, selectSyncedBranch],
  );

  return currentBranch ? (
    <>
      <BranchSelectorPopover
        isOpen={isPopoverOpen}
        onOpenChange={handleOpenChangePopover}
        onBranchSelected={onBranchSelected}
        onCreateBranchFromSelected={createNewBranchFromSelected}
        onCreateBranchFromCurrentChanges={createBranchFromCurrentChanges}
        branches={branchState.branches}
        currentBranch={currentBranch}
        editProhibited={editProhibited}
      />
      {createBranchModalVisible && startBranch && (
        <CreateBranchModal
          isOpen={createBranchModalVisible}
          onClose={handleCloseModal}
          onSuccess={onCreateBranchModalSuccess}
          startBranch={startBranch}
          isCurrentChanges={isCurrentChanges}
        />
      )}
      {isSwitchingBranch && (
        <Modal isOpen close={handleCloseSwitchingModal}>
          <Stack direction="column" gap={4} justify="center" align="center" css={{ padding: '$4 0' }}>
            <Spinner />
            <Heading size="medium">{t('switchingBranch')}</Heading>
          </Stack>
        </Modal>
      )}
    </>
  ) : (
    <div />
  );
}
