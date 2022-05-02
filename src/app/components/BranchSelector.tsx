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
} from './BranchSwitchMenu';
import {
  branchSelector, lastSyncedStateSelector, tokensSelector, localApiStateSelector, apiSelector, usedTokenSetSelector,
} from '@/selectors';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useRemoteTokens from '../store/remoteTokens';
import useConfirm from '@/app/hooks/useConfirm';
import CreateBranchModal from './modals/CreateBranchModal';
import { Dispatch } from '../store';
import { BranchSwitchMenuRadioElement } from './BranchSwitchMenuRadioElement';

const BranchSwitchMenuItemElement: React.FC<{
  branch: string
  createNewBranchFrom: (branch: string) => void
}> = ({ branch, createNewBranchFrom }) => {
  const onSelect = React.useCallback(() => (
    createNewBranchFrom(branch)
  ), [branch, createNewBranchFrom]);

  return (
    <BranchSwitchMenuItem onSelect={onSelect}>
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

  const branchState = useSelector(branchSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const tokens = useSelector(tokensSelector);
  const localApiState = useSelector(localApiStateSelector);
  const apiData = useSelector(apiSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);

  const [currentBranch, setCurrentBranch] = useState(localApiState.branch);
  const [startBranch, setStartBranch] = useState<string | null>(null);
  const [menuOpened, setMenuOpened] = useState(false);
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [isCurrentChanges, setIsCurrentChanges] = useState(false);

  useEffect(() => {
    setCurrentBranch(localApiState.branch);
  }, [localApiState.branch, setCurrentBranch]);

  const checkForChanges = React.useCallback(() => {
    if (lastSyncedState !== JSON.stringify(convertTokensToObject(tokens), null, 2)) {
      return true;
    }
    return false;
  }, [lastSyncedState, tokens]);

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
    setMenuOpened(false);
    setIsCurrentChanges(true);
    setStartBranch(currentBranch ?? null);
    setCreateBranchModalVisible(true);
  }, [currentBranch]);

  const createNewBranchFrom = React.useCallback(async (branch: string) => {
    setMenuOpened(false);

    if (hasChanges && await askUserIfPushChanges()) {
      await pushTokens();
    }

    setStartBranch(branch);
    setCreateBranchModalVisible(true);
  }, [hasChanges, askUserIfPushChanges, pushTokens]);

  const changeAndPull = React.useCallback(async (branch: string) => {
    setMenuOpened(false);
    setCurrentBranch(branch);
    dispatch.uiState.setApiData({ ...apiData, branch });
    dispatch.uiState.setLocalApiState({ ...localApiState, branch });
    await pullTokens({ context: { ...apiData, branch }, usedTokenSet });
  }, [apiData, localApiState, pullTokens, usedTokenSet, dispatch]);

  const onBranchSelected = React.useCallback(async (branch: string) => {
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

    dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
    dispatch.uiState.setApiData({ ...apiData, branch });
    dispatch.uiState.setLocalApiState({ ...localApiState, branch });
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
          <BranchSwitchMenuMainTrigger>
            <GitBranchIcon size={16} />
            <span>{currentBranch}</span>
          </BranchSwitchMenuMainTrigger>

          <BranchSwitchMenuContent side="top" sideOffset={5}>
            <BranchSwitchMenuRadioGroup value={currentBranch}>
              {branchState.branches.length > 0
              && branchState.branches.map((branch, index) => <BranchSwitchMenuRadioElement branch={branch} index={index} branchSelected={onBranchSelected} />)}
            </BranchSwitchMenuRadioGroup>
            <BranchSwitchMenu>
              <BranchSwitchMenuTrigger>
                Create new branch from
                <ChevronRightIcon />
              </BranchSwitchMenuTrigger>
              <BranchSwitchMenuContent side="left">
                {hasChanges
              && (
              <BranchSwitchMenuItem onSelect={createBranchByChange}>
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
