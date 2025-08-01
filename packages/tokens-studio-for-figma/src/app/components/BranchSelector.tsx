import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GitBranchIcon } from '@primer/octicons-react';
import { useUIDSeed } from 'react-uid';
import { useTranslation } from 'react-i18next';
import { Button, DropdownMenu } from '@tokens-studio/ui';
import { Command } from 'cmdk';
import './BranchSelector.css';
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
import CreateBranchModal from './modals/CreateBranchModal';
import { Dispatch } from '../store';
import { isGitProvider } from '@/utils/is';
import ProBadge from './ProBadge';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageTypeCredentials } from '@/types/StorageType';
import { track } from '@/utils/analytics';
import { useChangedState } from '@/hooks/useChangedState';
import { useIsProUser } from '../hooks/useIsProUser';

export default function BranchSelector() {
  const seed = useUIDSeed();
  const { confirm } = useConfirm();
  const { pullTokens, pushTokens } = useRemoteTokens();
  const dispatch = useDispatch<Dispatch>();
  const isProUser = useIsProUser();
  const { setStorageType } = useStorage();

  const branchState = useSelector(branchSelector);
  const localApiState = useSelector(localApiStateSelector);
  const localApiStateBranch = useSelector(localApiStateBranchSelector);
  const apiData = useSelector(apiSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { t } = useTranslation(['branch', 'licence']);
  const [currentBranch, setCurrentBranch] = useState(localApiStateBranch);
  const [startBranch, setStartBranch] = useState<string | null>(null);
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [isCurrentChanges, setIsCurrentChanges] = useState(false);
  const [open, setOpen] = useState(false);
  const { hasChanges } = useChangedState();

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

  const createBranchByChange = React.useCallback(() => {
    track('Create new branch from current changes');
    setIsCurrentChanges(true);
    setStartBranch(currentBranch ?? null);
    setCreateBranchModalVisible(true);
  }, [currentBranch]);

  const createNewBranchFrom = React.useCallback(
    async (branch: string) => {
      track('Create new branch from specific branch');

      if (hasChanges && (await askUserIfPushChanges())) {
        await pushTokens();
      }

      setStartBranch(branch);
      setCreateBranchModalVisible(true);
    },
    [hasChanges, askUserIfPushChanges, pushTokens],
  );

  const changeAndPull = React.useCallback(
    async (branch: string) => {
      if (isGitProvider(apiData) && isGitProvider(localApiState)) {
        setCurrentBranch(branch);
        dispatch.uiState.setApiData({ ...apiData, branch });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch });
        await pullTokens({
          context: { ...apiData, branch }, usedTokenSet, activeTheme, updateLocalTokens: true,
        });
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: { ...apiData, branch },
        });
        setStorageType({ provider: { ...apiData, branch } as StorageTypeCredentials, shouldSetInDocument: true });
      }
    },
    [apiData, localApiState, pullTokens, usedTokenSet, activeTheme, dispatch],
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
    [hasChanges, askUserIfPushChanges, changeAndPull],
  );

  // @params
  /*
   ** branch: branch name which is just created.
   ** branches: a list of branch names before new branch is created.
   */
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

  const handleCloseModal = React.useCallback(() => {
    setCreateBranchModalVisible(false);
  }, []);

  const handleOpenToggle = React.useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handlePointerDownOutside = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleEscapeKeyDown = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleCreateBranchFromCurrentChange = React.useCallback(() => {
    createBranchByChange();
    setOpen(false);
  }, [createBranchByChange]);

  const handleCreateBranchFromSpecific = React.useCallback((branch: string) => () => {
    createNewBranchFrom(branch);
    setOpen(false);
  }, [createNewBranchFrom]);

  const handleBranchSelection = React.useCallback((branch: string) => () => {
    if (isProUser) {
      onBranchSelected(branch);
      setOpen(false);
    }
  }, [isProUser, onBranchSelected]);

  return currentBranch ? (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild data-testid="branch-selector-menu-trigger">
          <Button size="small" variant="invisible" icon={<GitBranchIcon />} onClick={handleOpenToggle}>
            {currentBranch}
          </Button>
        </DropdownMenu.Trigger>

        {open && (
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="top"
              sideOffset={0}
              className="content scroll-container"
              css={{ maxWidth: '70vw', padding: 0 }}
              onPointerDownOutside={handlePointerDownOutside}
              onEscapeKeyDown={handleEscapeKeyDown}
            >
              <Command style={{ width: '100%', minWidth: '240px' }}>
                <Command.Input
                  placeholder={t('searchBranches') || 'Search branches...'}
                  style={{
                    border: 'none',
                    borderBottom: '1px solid var(--figma-color-border)',
                    borderRadius: 0,
                    padding: '12px 16px',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
                <Command.List style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <Command.Empty style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--figma-color-text-secondary)' }}>
                    No branches found.
                  </Command.Empty>

                  {/* Create new branch section */}
                  <Command.Group heading={isProUser ? t('createNewBranch') : undefined} style={{ padding: 0 }}>
                    {!isProUser && (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', padding: '8px 16px', fontSize: '13px',
                      }}
                      >
                        <span>{t('upgradeToPro', { ns: 'licence' })}</span>
                        <ProBadge campaign="branch-selector" compact />
                      </div>
                    )}

                    {isProUser && hasChanges && (
                      <Command.Item
                        data-testid="branch-selector-create-new-branch-from-current-change"
                        onSelect={handleCreateBranchFromCurrentChange}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                        className="branch-command-item"
                      >
                        📄
                        {' '}
                        {t('currentChanges')}
                      </Command.Item>
                    )}

                    {isProUser && branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
                      <Command.Item
                        key={`create-from-${seed(index)}`}
                        data-testid={`branch-selector-create-branch-from-branch-${branch}`}
                        onSelect={handleCreateBranchFromSpecific(branch)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                        className="branch-command-item"
                      >
                        🌿
                        {' '}
                        {t('createFromBranch', { branch }) || `Create from ${branch}`}
                      </Command.Item>
                    ))}

                    {(isProUser && (hasChanges || branchState.branches.length > 0)) && (
                      <div style={{ height: '1px', backgroundColor: 'var(--figma-color-border)', margin: '4px 0' }} />
                    )}
                  </Command.Group>

                  {/* Branch selection section */}
                  <Command.Group heading={t('switchToBranch') || 'Switch to branch'} style={{ padding: 0 }}>
                    {branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
                      <Command.Item
                        key={`switch-to-${seed(index)}`}
                        data-testid={`branch-switch-menu-radio-element-${branch}`}
                        disabled={!isProUser}
                        onSelect={handleBranchSelection(branch)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          cursor: isProUser ? 'pointer' : 'not-allowed',
                          opacity: isProUser ? 1 : 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        className="branch-command-item"
                      >
                        <span>{branch}</span>
                        {currentBranch === branch && (
                          <span style={{ fontSize: '12px', color: 'var(--figma-color-text-brand)' }}>✓</span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </DropdownMenu>
      {createBranchModalVisible && startBranch && (
        <CreateBranchModal
          isOpen={createBranchModalVisible}
          onClose={handleCloseModal}
          onSuccess={onCreateBranchModalSuccess}
          startBranch={startBranch}
          isCurrentChanges={isCurrentChanges}
        />
      )}
    </>
  ) : (
    <div />
  );
}
