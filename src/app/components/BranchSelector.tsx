import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import {
  BranchSwitchMenu,
  BranchSwitchMenuContent,
  BranchSwitchMenuItem,
  BranchSwitchMenuItemIndicator,
  BranchSwitchMenuMainTrigger,
  BranchSwitchMenuTrigger,
  BranchSwitchMenuRadioGroup,
  BranchSwitchMenuRadioItem,
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

export default function BranchSelector() {
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
  const [startBranch, setStartBranch] = useState(null);
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

  const hasChanges = React.useMemo(() => checkForChanges(), [lastSyncedState, tokens]);

  const askUserIfPushChanges : (() => Promise<boolean>) = React.useCallback(async () => {
    const { result } = await confirm({
      text: 'You have unsaved changes',
      description: <div>
        If you create or switch your branch without pushing your local changes
        <br />
        {' '}
        to your repository, the changes will be lost.
      </div>,
      confirmAction: 'Discard changes',
      cancelAction: 'Cancel',
    });
    return result;
  }, []);

  const createBranchByChange = () => {
    setMenuOpened(false);
    setIsCurrentChanges(true);
    setStartBranch(currentBranch);
    setCreateBranchModalVisible(true);
  };

  const createNewBranchFrom = async (branch: string) => {
    setMenuOpened(false);
    
    if (hasChanges && await askUserIfPushChanges()) {
      await pushTokens();
    }

    setStartBranch(branch);
    setCreateBranchModalVisible(true);
  };

  const changeAndPull = async (branch: string) => {
    setMenuOpened(false);
    setCurrentBranch(branch);
    dispatch.uiState.setApiData({ ...apiData, branch });
    dispatch.uiState.setLocalApiState({ ...localApiState, branch });
    await pullTokens({ context: { ...apiData, branch }, usedTokenSet });
  };

  const onBranchSelected = async (branch: string) => {
    if (hasChanges) {
      if (await askUserIfPushChanges()) {
        await changeAndPull(branch);
      } else setMenuOpened(false);
    } else {
      await changeAndPull(branch);
    }
  };

  // @params
  /*
  ** branch: branch name which is just created.
  ** branches: a list of branch names before new branch is created.
  */
  const onCreateBranchModalSuccess = (branch: string, branches: string[]) => {
    setCreateBranchModalVisible(false);
    setCurrentBranch(branch);

    dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
    dispatch.uiState.setApiData({ ...apiData, branch });
    dispatch.uiState.setLocalApiState({ ...localApiState, branch });
  };

  const BranchSwitchMenuRadioElement = ({ branch, index } : { branch: string, index:number }) => {
    const onSelect = React.useCallback(() => onBranchSelected(branch), [branch]);
    return (
      <BranchSwitchMenuRadioItem key={`radio_${index}`} value={branch} onSelect={onSelect}>
        <BranchSwitchMenuItemIndicator>
          <CheckIcon />
        </BranchSwitchMenuItemIndicator>
        <GitBranchIcon size={12} />
        {` ${branch}`}
      </BranchSwitchMenuRadioItem>
    );
  };

  const BranchSwitchMenuItemElement = ({ branch, index } : { branch: string, index: number }) => {
    const onSelect = React.useCallback(() => createNewBranchFrom(branch), [branch]);
    return (
      <BranchSwitchMenuItem key={`menu_item_${index}`} onSelect={onSelect}>
        <GitBranchIcon size={12} />
        {` ${branch}`}
      </BranchSwitchMenuItem>
    );
  };

  return (
    <>
      {currentBranch
        ? (
          <BranchSwitchMenu open={menuOpened} onOpenChange={() => setMenuOpened(!menuOpened)}>
            <BranchSwitchMenuMainTrigger>
              <GitBranchIcon size={16} />
              <span>{currentBranch}</span>
            </BranchSwitchMenuMainTrigger>

            <BranchSwitchMenuContent side="top" sideOffset={5}>
              <BranchSwitchMenuRadioGroup value={currentBranch}>
                {branchState.branches.length > 0
                  && branchState.branches.map((branch, index) => <BranchSwitchMenuRadioElement branch={branch} index={index} />)}
              </BranchSwitchMenuRadioGroup>
              <BranchSwitchMenu>
                <BranchSwitchMenuTrigger>
                  Create new branch from
                  <ChevronRightIcon />
                </BranchSwitchMenuTrigger>
                <BranchSwitchMenuContent side="left">
                  {hasChanges && 
                  <BranchSwitchMenuItem onSelect={createBranchByChange}>
                    Current changes
                  </BranchSwitchMenuItem>}
                  {branchState.branches.length > 0 && branchState.branches.map((branch, index) => <BranchSwitchMenuItemElement branch={branch} index={index} />)}
                </BranchSwitchMenuContent>
              </BranchSwitchMenu>
              <BranchSwitchMenuArrow offset={12} />
            </BranchSwitchMenuContent>
            {createBranchModalVisible && (
              <CreateBranchModal
                isOpen={createBranchModalVisible}
                onClose={() => setCreateBranchModalVisible(false)}
                onSuccess={onCreateBranchModalSuccess}
                startBranch={startBranch}
                isCurrentChanges={isCurrentChanges}
              />
            )}
          </BranchSwitchMenu>
        ) : <div />}
    </>
  );
}
