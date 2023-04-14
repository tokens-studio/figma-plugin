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
  BranchSwitchMenuRadioItem,
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
import Input from './Input';
import Box from './Box';

const MINIMUM_BRANCH_LENGTH = 5;

const BranchSwitchMenuItemElement: React.FC<{
  branch: string
  createNewBranchFrom: (branch: string) => void
}> = ({ branch, createNewBranchFrom }) => {
  const onSelect = React.useCallback(() => (
    createNewBranchFrom(branch)
  ), [branch, createNewBranchFrom]);

  return (
    <BranchSwitchMenuRadioItem
      data-cy={`branch-selector-create-branch-from-branch-${branch}`}
      onSelect={onSelect}
      value={branch}
    >
      <Box>
        <GitBranchIcon size={12} />
        {` ${branch}`}
      </Box>
    </BranchSwitchMenuRadioItem>
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
  const [subMenuOpened, setSubMenuOpened] = useState(false);
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [isCurrentChanges, setIsCurrentChanges] = useState(false);
  const [searchTextForBaseBranch, setSearchTextForBaseBranch] = useState('');
  const [searchTextForCreateBranch, setSearchTextForCreateBranch] = useState('');

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
    setSearchTextForBaseBranch('');
  }, [menuOpened]);

  const handleToggleSubMenu = React.useCallback(() => {
    setSubMenuOpened(!subMenuOpened);
    setSearchTextForCreateBranch('');
  }, [subMenuOpened]);

  const handleCloseModal = React.useCallback(() => {
    setCreateBranchModalVisible(false);
  }, []);

  const handleSearchTextForBaseBranchChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setSearchTextForBaseBranch(e.target.value);
  }, []);

  const handleSearchTextForCreateBranchChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    setSearchTextForCreateBranch(e.target.value);
  }, []);

  const handleKeyDown = React.useCallback((event) => {
    console.log('key down');
    event.stopPropagation();
  }, []);

  return (
    currentBranch
      ? (
        <BranchSwitchMenu open={menuOpened} onOpenChange={handleToggleMenu}>
          <BranchSwitchMenuMainTrigger data-cy="branch-selector-menu-trigger">
            <GitBranchIcon size={16} />
            <span>{currentBranch}</span>
          </BranchSwitchMenuMainTrigger>

          <BranchSwitchMenuContent side="top" sideOffset={5} onKeyDown={handleKeyDown}>
            {!gitBranchSelector && (
            <>
              <BranchSwitchMenuItem css={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Upgrade to Pro</span>
                <ProBadge compact />
              </BranchSwitchMenuItem>
              <BranchSwitchMenuSeparator />
            </>
            )}
            {
              branchState.branches.length > MINIMUM_BRANCH_LENGTH && (
                <Input
                  full
                  value={searchTextForBaseBranch}
                  onChange={handleSearchTextForBaseBranchChange}
                  type="text"
                  autofocus
                  name="base-branch-filter"
                  placeholder="Search branch"
                />
              )
            }
            <BranchSwitchMenuRadioGroup className="content content-dark scroll-container" css={{ maxHeight: '$dropdownMaxHeight', overflowY: 'auto' }} value={currentBranch}>
              {branchState.branches.length > 0
                && branchState.branches.filter((b) => b.includes(searchTextForBaseBranch)).map((branch, index) => (
                  <BranchSwitchMenuRadioElement
                    disabled={!gitBranchSelector}
                    key={`radio_${seed(index)}`}
                    branch={branch}
                    branchSelected={onBranchSelected}
                    onKeyDown={handleKeyDown}
                  />
                ))}
            </BranchSwitchMenuRadioGroup>
            <BranchSwitchMenu open={subMenuOpened} onOpenChange={handleToggleSubMenu}>
              <BranchSwitchMenuTrigger data-cy="branch-selector-create-new-branch-trigger" disabled={!gitBranchSelector}>
                Create new branch from
                <ChevronRightIcon />
              </BranchSwitchMenuTrigger>
              <BranchSwitchMenuContent side="right" sideOffset={5} align="end">
                { branchState.branches.length > MINIMUM_BRANCH_LENGTH && (
                  <Input
                    full
                    value={searchTextForCreateBranch}
                    onChange={handleSearchTextForCreateBranchChange}
                    type="text"
                    autofocus
                    name="create-branch-filter"
                    placeholder="Search branch"
                  />
                )}
                <BranchSwitchMenuRadioGroup className="content content-dark scroll-container" css={{ maxHeight: '$dropdownMaxHeight', overflowY: 'auto' }}>
                  {hasChanges && (
                    <BranchSwitchMenuRadioItem data-cy="branch-selector-create-new-branch-from-current-change" onSelect={createBranchByChange} value={currentBranch}>
                      Current changes
                    </BranchSwitchMenuRadioItem>
                  )}
                  {branchState.branches.length > 0 && branchState.branches.filter((b) => b.includes(searchTextForCreateBranch)).map((branch, index) => (
                    <BranchSwitchMenuItemElement key={seed(index)} branch={branch} createNewBranchFrom={createNewBranchFrom} />
                  ))}
                </BranchSwitchMenuRadioGroup>
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
