import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CheckIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon,
} from '@radix-ui/react-icons';
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
  branchSelector, lastSyncedStateSelector, tokensSelector, localApiStateSelector, apiSelector,
} from '@/selectors';
import convertTokensToObject from '@/utils/convertTokensToObject';
import useConfirm from '@/app/hooks/useConfirm';
import CreateBranchModal from './modals/CreateBranchModal';
import { Dispatch } from '../store';

export default function BranchSelector() {
  const { confirm } = useConfirm();
  const dispatch = useDispatch<Dispatch>();

  const branchState = useSelector(branchSelector);
  const lastSyncedState = useSelector(lastSyncedStateSelector);
  const tokens = useSelector(tokensSelector);
  const localApiState = useSelector(localApiStateSelector);
  const apiData = useSelector(apiSelector);

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

  async function askUserIfPull(branch: string): Promise<boolean> {
    const { result } = await confirm({
      text: <div>
        Do you want to create new branch from
        <GitBranchIcon size={16} />
        {' '}
        {branch}
        ?
            </div>,
      description: 'You have unsaved changes that will be lost. Are you sure?',
    });
    return result;
  }

  const createBranchByChange = () => {
    setMenuOpened(false);
    setIsCurrentChanges(true);
    setCreateBranchModalVisible(true);
  };

  const createNewBranchFrom = async (branch: string) => {
    let confirmed = true;
    if (checkForChanges()) {
      confirmed = await askUserIfPull(branch);
    }

    if (confirmed) {
      setMenuOpened(false);
      setStartBranch(branch);
      setCreateBranchModalVisible(true);
    }
  };

  const onBranchSelected = (branch: string) => {
    setCurrentBranch(branch);
    dispatch.uiState.setApiData({ ...apiData, branch });
  };

  return (
    <>
      {currentBranch
        ? (
          <BranchSwitchMenu open={menuOpened} onOpenChange={() => setMenuOpened(!menuOpened)}>
            <BranchSwitchMenuMainTrigger>
              <GitBranchIcon size={16} />
              <span>{currentBranch}</span>
              {menuOpened ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </BranchSwitchMenuMainTrigger>

            <BranchSwitchMenuContent side="top" sideOffset={5}>
              <BranchSwitchMenuRadioGroup value={currentBranch}>
                {branchState.branches.length > 0
                  && branchState.branches.map((branch, index) => (
                    <BranchSwitchMenuRadioItem key={index} value={branch} onSelect={() => onBranchSelected(branch)}>
                      <BranchSwitchMenuItemIndicator>
                        <CheckIcon />
                      </BranchSwitchMenuItemIndicator>
                      <GitBranchIcon size={12} />
                      {` ${branch}`}
                    </BranchSwitchMenuRadioItem>
                  ))}
              </BranchSwitchMenuRadioGroup>
              <BranchSwitchMenu>
                <BranchSwitchMenuTrigger>
                  Create new branch from
                  <ChevronRightIcon />
                </BranchSwitchMenuTrigger>
                <BranchSwitchMenuContent side="left">
                  <BranchSwitchMenuItem onSelect={createBranchByChange}>
                    Current changes
                  </BranchSwitchMenuItem>
                  {branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
                    <BranchSwitchMenuItem key={index} onSelect={() => createNewBranchFrom(branch)}>
                      <GitBranchIcon size={12} />
                      {` ${branch}`}
                    </BranchSwitchMenuItem>
                  ))}
                </BranchSwitchMenuContent>
              </BranchSwitchMenu>
              <BranchSwitchMenuArrow offset={12} />
            </BranchSwitchMenuContent>
            {createBranchModalVisible && (
              <CreateBranchModal
                isOpen={createBranchModalVisible}
                onClose={() => setCreateBranchModalVisible(false)}
                onSuccess={() => setCreateBranchModalVisible(false)}
                startBranch={startBranch}
                isCurrentChanges={isCurrentChanges}
              />
            )}
          </BranchSwitchMenu>
        ) : <div />}
    </>
  );
}
