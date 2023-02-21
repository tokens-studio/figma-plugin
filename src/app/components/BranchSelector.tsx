import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import { useUIDSeed } from 'react-uid';
import {
  BranchSwitchMenu,
  BranchSwitchMenuContent,
  BranchSwitchMenuItem,
  BranchSwitchMenuMainTrigger,
  BranchSwitchMenuTrigger,
  BranchSwitchMenuRadioGroup,
  BranchSwitchMenuArrow,
  BranchSwitchMenuSeparator,
} from './BranchSwitchMenu';
import {
  branchSelector,
  lastSyncedStateSelector,
  tokensSelector,
  localApiStateBranchSelector,
  apiSelector,
  usedTokenSetSelector,
  localApiStateSelector,
  themesListSelector,
  activeThemeSelector,
  storageTypeSelector,
} from '@/selectors';
import useRemoteTokens from '../store/remoteTokens';
import useConfirm from '@/app/hooks/useConfirm';
import useStorage from '@/app/store/useStorage';
import CreateBranchModal from './modals/CreateBranchModal';
import { Dispatch } from '../store';
import { BranchSwitchMenuRadioElement } from './BranchSwitchMenuRadioElement';
import { isGitProvider } from '@/utils/is';
import { compareLastSyncedState } from '@/utils/compareLastSyncedState';
import { useFlags } from './LaunchDarkly';
import ProBadge from './ProBadge';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageTypeCredentials } from '@/types/StorageType';
import { track } from '@/utils/analytics';

const BranchSwitchMenuItemElement: React.FC<{
  branch: string
  createNewBranchFrom: (branch: string) => void
}> = ({ branch, createNewBranchFrom }) => {
  const onSelect = React.useCallback(() => (
    createNewBranchFrom(branch)
  ), [branch, createNewBranchFrom]);

  return (
    <BranchSwitchMenuItem data-cy={`branch-selector-create-branch-from-branch-${branch}`} onSelect={onSelect}>
      <GitBranchIcon size={12} />
      {` ${branch}`}
    </BranchSwitchMenuItem>
  );
};

export default function BranchSelector() {
  const seed = useUIDSeed();
  const { confirm } = useConfirm();
  const { pullTokens, pushTokens } = useRemoteTokens();
  const dispatch = useDispatch<Dispatch>();
  const { gitBranchSelector } = useFlags();
  const { setStorageType } = useStorage();

  const branchState = useSelector(branchSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);

  const storageType = useSelector(storageTypeSelector);
  const localApiState = useSelector(localApiStateSelector);
  const localApiStateBranch = useSelector(localApiStateBranchSelector);
  const apiData = useSelector(apiSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);

  const [currentBranch, setCurrentBranch] = useState(localApiStateBranch);
  const [startBranch, setStartBranch] = useState<string | null>(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [isCurrentChanges, setIsCurrentChanges] = useState(false);

  useEffect(() => {
    setCurrentBranch(localApiStateBranch);
  }, [localApiStateBranch, setCurrentBranch]);

  const checkForChanges = React.useCallback(() => {
    const tokenSetOrder = Object.keys(tokens);
    const defaultMetadata = isGitProvider(storageType) ? { tokenSetOrder } : {};
    const hasChanged = !compareLastSyncedState(
      tokens,
      themes,
      defaultMetadata,
      lastSyncedState,
      [{}, [], defaultMetadata],
    );
    return hasChanged;
  }, [lastSyncedState, tokens, themes, storageType]);

  const hasChanges = React.useMemo(() => checkForChanges(), [checkForChanges]);

  const askUserIfPushChanges = React.useCallback(async () => {
    const confirmResult = await confirm({
      text: 'You have unsaved changes',
      description: (
        <div>
          If you create or switch your branch without pushing your local changes
          <br />
          {' '}
          to your repository, the changes will be lost.
        </div>
      ),
      confirmAction: 'Discard changes',
      cancelAction: 'Cancel',
    });
    if (confirmResult) {
      return confirmResult.result;
    }
    return null;
  }, [confirm]);

  const createBranchByChange = React.useCallback(() => {
    track('Create new branch from current changes');
    setMenuOpened(false);
    setIsCurrentChanges(true);
    setStartBranch(currentBranch ?? null);
    setCreateBranchModalVisible(true);
  }, [currentBranch]);

  const createNewBranchFrom = React.useCallback(async (branch: string) => {
    track('Create new branch from specific branch');
    setMenuOpened(false);

    if (hasChanges && await askUserIfPushChanges()) {
      await pushTokens();
    }

    setStartBranch(branch);
    setCreateBranchModalVisible(true);
  }, [hasChanges, askUserIfPushChanges, pushTokens]);

  const changeAndPull = React.useCallback(async (branch: string) => {
    if (isGitProvider(apiData) && isGitProvider(localApiState)) {
      setMenuOpened(false);
      setCurrentBranch(branch);
      dispatch.uiState.setApiData({ ...apiData, branch });
      dispatch.uiState.setLocalApiState({ ...localApiState, branch });
      await pullTokens({ context: { ...apiData, branch }, usedTokenSet, activeTheme });
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: { ...apiData, branch },
      });
      setStorageType({ provider: { ...apiData, branch } as StorageTypeCredentials, shouldSetInDocument: true });
    }
  }, [apiData, localApiState, pullTokens, usedTokenSet, activeTheme, dispatch]);

  const onBranchSelected = React.useCallback(async (branch: string) => {
    track('Branch changed');
    if (hasChanges) {
      if (await askUserIfPushChanges()) {
        await changeAndPull(branch);
      } else setMenuOpened(false);
    } else {
      await changeAndPull(branch);
    }
  }, [hasChanges, askUserIfPushChanges, changeAndPull]);

  // @params
  /*
  ** branch: branch name which is just created.
  ** branches: a list of branch names before new branch is created.
  */
  const onCreateBranchModalSuccess = React.useCallback((branch: string, branches: string[]) => {
    setCreateBranchModalVisible(false);
    setCurrentBranch(branch);
    if (isGitProvider(apiData) && isGitProvider(localApiState)) {
      dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
      dispatch.uiState.setApiData({ ...apiData, branch });
      dispatch.uiState.setLocalApiState({ ...localApiState, branch });
    }
  }, [dispatch, apiData, localApiState]);

  const handleToggleMenu = React.useCallback(() => {
    setMenuOpened(!menuOpened);
  }, [menuOpened]);

  const handleCloseModal = React.useCallback(() => {
    setCreateBranchModalVisible(false);
  }, []);

  return (
    currentBranch
      ? (
        <BranchSwitchMenu open={menuOpened} onOpenChange={handleToggleMenu}>
          <BranchSwitchMenuMainTrigger data-cy="branch-selector-menu-trigger">
            <GitBranchIcon size={16} />
            <span>{currentBranch}</span>
          </BranchSwitchMenuMainTrigger>

          <BranchSwitchMenuContent side="top" sideOffset={5}>
            {!gitBranchSelector && (
            <>
              <BranchSwitchMenuItem css={{ display: 'flex', justifyContent: 'space-between' }}>

                <span>Upgrade to Pro</span>
                <ProBadge compact />

              </BranchSwitchMenuItem>
              <BranchSwitchMenuSeparator />
            </>
            )}
            <BranchSwitchMenuRadioGroup className="content content-dark scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }} value={currentBranch}>
              {branchState.branches.length > 0
                && branchState.branches.map((branch, index) => <BranchSwitchMenuRadioElement disabled={!gitBranchSelector} key={`radio_${seed(index)}`} branch={branch} branchSelected={onBranchSelected} />)}
            </BranchSwitchMenuRadioGroup>
            <BranchSwitchMenu>
              <BranchSwitchMenuTrigger data-cy="branch-selector-create-new-branch-trigger" disabled={!gitBranchSelector}>
                Create new branch from
                <ChevronRightIcon />
              </BranchSwitchMenuTrigger>
              <BranchSwitchMenuContent className="content scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }} side="right" align="end">
                {hasChanges
                  && (
                    <BranchSwitchMenuItem data-cy="branch-selector-create-new-branch-from-current-change" onSelect={createBranchByChange}>
                      Current changes
                    </BranchSwitchMenuItem>
                  )}
                {branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
                  <BranchSwitchMenuItemElement
                    key={seed(index)}
                    branch={branch}
                    createNewBranchFrom={createNewBranchFrom}
                  />
                ))}
              </BranchSwitchMenuContent>
            </BranchSwitchMenu>
            <BranchSwitchMenuArrow offset={12} />
          </BranchSwitchMenuContent>
          {(createBranchModalVisible && startBranch) && (
            <CreateBranchModal
              isOpen={createBranchModalVisible}
              onClose={handleCloseModal}
              onSuccess={onCreateBranchModalSuccess}
              startBranch={startBranch}
              isCurrentChanges={isCurrentChanges}
            />
          )}
        </BranchSwitchMenu>
      ) : <div />
  );
}
