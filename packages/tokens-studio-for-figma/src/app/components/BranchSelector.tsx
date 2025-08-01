import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GitBranchIcon } from '@primer/octicons-react';
import { useUIDSeed } from 'react-uid';
import { useTranslation } from 'react-i18next';
import {
  Button, Box, Stack, Text,
} from '@tokens-studio/ui';
import { Command } from 'cmdk';
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
  const [showCreateFromMenu, setShowCreateFromMenu] = useState(false);
  const { hasChanges } = useChangedState();

  // Handle ESC key to close modal
  const handleCloseSelector = React.useCallback(() => {
    setOpen(false);
    setShowCreateFromMenu(false);
  }, []);

  useEffect(() => {
    setCurrentBranch(localApiStateBranch);
  }, [localApiStateBranch, setCurrentBranch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleCloseSelector();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleCloseSelector]);

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
    setShowCreateFromMenu(false);
  }, [open]);

  const handleShowCreateFromMenu = React.useCallback(() => {
    setShowCreateFromMenu(true);
  }, []);

  const handleBackToMain = React.useCallback(() => {
    setShowCreateFromMenu(false);
  }, []);

  const handleOverlayClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseSelector();
    }
  }, [handleCloseSelector]);

  const handleContentClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  const handleCreateBranchFromCurrentChange = React.useCallback(() => {
    createBranchByChange();
    setOpen(false);
    setShowCreateFromMenu(false);
  }, [createBranchByChange]);
  const handleCreateBranchFromSpecific = React.useCallback((branch: string) => () => {
    createNewBranchFrom(branch);
    setOpen(false);
    setShowCreateFromMenu(false);
  }, [createNewBranchFrom]);

  const handleBranchSelection = React.useCallback((branch: string) => () => {
    if (isProUser) {
      onBranchSelected(branch);
      setOpen(false);
      setShowCreateFromMenu(false);
    }
  }, [isProUser, onBranchSelected]);

  return currentBranch ? (
    <>
      <Button size="small" variant="invisible" icon={<GitBranchIcon />} onClick={handleOpenToggle} data-testid="branch-selector-menu-trigger">
        {currentBranch}
      </Button>

      {open && (
        <Box
          className="branch-selector-overlay"
          onClick={handleOverlayClick}
          css={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            className="branch-selector-content"
            css={{
              backgroundColor: '$bgDefault',
              borderRadius: '$medium',
              border: '1px solid $borderMuted',
              boxShadow: '$large',
              minWidth: '320px',
              maxWidth: '480px',
              width: '90vw',
              maxHeight: '70vh',
            }}
            onClick={handleContentClick}
          >
            <Command>
              <Box css={{ borderBottom: '1px solid $borderMuted' }}>
                <Command.Input
                  placeholder={t('searchBranches') || 'Search branches...'}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    padding: '12px 16px',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'transparent',
                    width: '100%',
                  }}
                />
              </Box>

              <Command.List style={{ maxHeight: '320px', overflow: 'auto' }}>
                <Command.Empty>
                  <Box css={{
                    padding: '$3', fontSize: '$small', color: '$fgMuted', textAlign: 'center',
                  }}
                  >
                    No branches found.
                  </Box>
                </Command.Empty>

                {!showCreateFromMenu ? (
                  <>
                    {/* Create new branch section */}
                    {!isProUser ? (
                      <Box css={{ padding: '$3', borderBottom: '1px solid $borderMuted' }}>
                        <Stack direction="row" align="center" justify="between">
                          <Text size="small">{t('upgradeToPro', { ns: 'licence' })}</Text>
                          <ProBadge campaign="branch-selector" compact />
                        </Stack>
                      </Box>
                    ) : (
                      <>
                        {hasChanges && (
                          <Command.Item
                            data-testid="branch-selector-create-new-branch-from-current-change"
                            onSelect={handleCreateBranchFromCurrentChange}
                          >
                            <Box css={{ padding: '$3', cursor: 'pointer', '&[data-selected="true"]': { backgroundColor: '$bgSubtle' } }}>
                              <Stack direction="row" align="center" gap={2}>
                                <Text>📄</Text>
                                <Text size="small">{t('currentChanges')}</Text>
                              </Stack>
                            </Box>
                          </Command.Item>
                        )}

                        <Command.Item onSelect={handleShowCreateFromMenu}>
                          <Box css={{ padding: '$3', cursor: 'pointer', '&[data-selected="true"]': { backgroundColor: '$bgSubtle' } }}>
                            <Stack direction="row" align="center" gap={2}>
                              <Text>🌿</Text>
                              <Text size="small">
                                {t('createNewBranch')}
                                ...
                              </Text>
                            </Stack>
                          </Box>
                        </Command.Item>

                        <Box css={{ height: '1px', backgroundColor: '$borderMuted', margin: '$2 0' }} />
                      </>
                    )}

                    {/* Branch selection section */}
                    <Box css={{ padding: '$2 0' }}>
                      <Box css={{ padding: '0 $3 $2 $3' }}>
                        <Text
                          size="xsmall"
                          css={{
                            color: '$fgMuted', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 600,
                          }}
                        >
                          {t('switchToBranch') || 'Switch to branch'}
                        </Text>
                      </Box>
                      {branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
                        <Command.Item
                          key={`switch-to-${seed(index)}`}
                          data-testid={`branch-switch-menu-radio-element-${branch}`}
                          disabled={!isProUser}
                          onSelect={handleBranchSelection(branch)}
                        >
                          <Box css={{
                            padding: '$3',
                            cursor: isProUser ? 'pointer' : 'not-allowed',
                            opacity: isProUser ? 1 : 0.5,
                            '&[data-selected="true"]': { backgroundColor: '$bgSubtle' },
                          }}
                          >
                            <Stack direction="row" align="center" justify="between">
                              <Text size="small">{branch}</Text>
                              {currentBranch === branch && (
                                <Text size="small" css={{ color: '$accentFg' }}>✓</Text>
                              )}
                            </Stack>
                          </Box>
                        </Command.Item>
                      ))}
                    </Box>
                  </>
                ) : (
                  /* Create from branch submenu */
                  <>
                    <Box css={{ padding: '$3', borderBottom: '1px solid $borderMuted' }}>
                      <Stack direction="row" align="center" gap={2}>
                        <Button size="small" variant="ghost" onClick={handleBackToMain}>←</Button>
                        <Text size="small" css={{ fontWeight: 600 }}>Create new branch from</Text>
                      </Stack>
                    </Box>

                    {hasChanges && (
                      <Command.Item
                        data-testid="branch-selector-create-new-branch-from-current-change"
                        onSelect={handleCreateBranchFromCurrentChange}
                      >
                        <Box css={{ padding: '$3', cursor: 'pointer', '&[data-selected="true"]': { backgroundColor: '$bgSubtle' } }}>
                          <Stack direction="row" align="center" gap={2}>
                            <Text>📄</Text>
                            <Text size="small">{t('currentChanges')}</Text>
                          </Stack>
                        </Box>
                      </Command.Item>
                    )}

                    {branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
                      <Command.Item
                        key={`create-from-${seed(index)}`}
                        data-testid={`branch-selector-create-branch-from-branch-${branch}`}
                        onSelect={handleCreateBranchFromSpecific(branch)}
                      >
                        <Box css={{ padding: '$3', cursor: 'pointer', '&[data-selected="true"]': { backgroundColor: '$bgSubtle' } }}>
                          <Text size="small">{branch}</Text>
                        </Box>
                      </Command.Item>
                    ))}
                  </>
                )}
              </Command.List>
            </Command>
          </Box>
        </Box>
      )}

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
