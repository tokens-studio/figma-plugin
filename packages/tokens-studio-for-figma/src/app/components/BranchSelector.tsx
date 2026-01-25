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
} from '@/selectors';
import useRemoteTokens from '../store/remoteTokens';
import useConfirm from '@/app/hooks/useConfirm';
import useStorage from '@/app/store/useStorage';
import { Dispatch } from '../store';
import { isGitProvider } from '@/utils/is';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageTypeCredentials } from '@/types/StorageType';
import { track } from '@/utils/analytics';
import CreateBranchModal from './modals/CreateBranchModal';
import Modal from './Modal';

import { BranchSelectorPopover } from './BranchSelectorPopover';
import { useChangedState } from '@/hooks/useChangedState';

export default function BranchSelector() {
  const { confirm } = useConfirm();
  const {
    pullTokens,
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

  const handleOpenChangePopover = React.useCallback((open: boolean) => {
    setIsPopoverOpen(open);
  }, []);

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

      if (hasChanges && (await askUserIfPushChanges())) {
        // User chose to discard changes - clear local token state
        dispatch.tokenState.setEmptyTokens();
      }

      setStartBranch(branch);
      setCreateBranchModalVisible(true);
    },
    [hasChanges, askUserIfPushChanges, dispatch],
  );

  const changeAndPull = React.useCallback(
    async (branch: string) => {
      if (isGitProvider(apiData) && isGitProvider(localApiState)) {
        setIsSwitchingBranch(true);
        try {
          // Clear local token state BEFORE pulling to prevent bleed
          dispatch.tokenState.setEmptyTokens();
          // Pull tokens from new branch BEFORE switching UI state
          await pullTokens({
            context: { ...apiData, branch }, usedTokenSet, activeTheme, updateLocalTokens: true, skipConfirmation: true,
          });
          // Now update UI state to show the new branch with already-loaded tokens
          setCurrentBranch(branch);
          dispatch.uiState.setApiData({ ...apiData, branch });
          dispatch.uiState.setLocalApiState({ ...localApiState, branch });
          AsyncMessageChannel.ReactInstance.message({
            type: AsyncMessageTypes.CREDENTIALS,
            credential: { ...apiData, branch },
          });
          setStorageType({ provider: { ...apiData, branch } as StorageTypeCredentials, shouldSetInDocument: true });
        } finally {
          setIsSwitchingBranch(false);
        }
      }
    },
    [apiData, localApiState, dispatch, pullTokens, usedTokenSet, activeTheme, setStorageType],
  );

  const onBranchSelected = React.useCallback(
    async (branch: string) => {
      track('Branch changed');
      if (hasChanges) {
        if (await askUserIfPushChanges()) {
          await changeAndPull(branch);
        }
      } else {
        await changeAndPull(branch);
      }
    },
    [askUserIfPushChanges, changeAndPull, hasChanges],
  );

  const onCreateBranchModalSuccess = React.useCallback(
    (branch: string, branches: string[]) => {
      setCreateBranchModalVisible(false);
      setCurrentBranch(branch);
      if (isGitProvider(apiData) && isGitProvider(localApiState)) {
        dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
        dispatch.uiState.setApiData({ ...apiData, branch });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch });
      }
    },
    [dispatch, apiData, localApiState],
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
