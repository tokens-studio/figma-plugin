import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import { localApiStateSelector, branchSelector } from '@/selectors';
import { StorageProviderType } from '@/types/api';

export default function BranchSelector() {
  const branchState = useSelector(branchSelector);
  const localApiState = useSelector(localApiStateSelector);
  const [currentBranch, setCurrentBranch] = useState(localApiState.branch);
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    setCurrentBranch(localApiState.branch);
  }, [localApiState.branch, setCurrentBranch]);

  const createNewBranchFrom = (branch: string) => {
    switch (localApiState.provider) {
      case StorageProviderType.GITHUB:
        break;
      default:
        break;
    }
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
              <BranchSwitchMenuRadioItem key={index} value={branch} onSelect={() => setCurrentBranch(branch)}>
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
                  <BranchSwitchMenuItem>
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
          </BranchSwitchMenu>
        ) : <div />}
    </>
  );
}
