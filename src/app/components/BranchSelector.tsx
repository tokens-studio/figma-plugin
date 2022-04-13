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
  BranchSwitchMenuSeparator,
  BranchSwitchMenuTrigger,
  BranchSwitchMenuRadioGroup,
  BranchSwitchMenuRadioItem,
  BranchSwitchMenuArrow,
} from './BranchSwitchMenu';
import { branchSelector } from '@/selectors';

export default function BranchSelector() {
  const branchState = useSelector(branchSelector);
  const [currentBranch, setCurrentBranch] = useState('');

  const handleChangeBranch = (branch: string) => {
    setCurrentBranch(branch);
  };

  return (
    <BranchSwitchMenu>
      <BranchSwitchMenuTrigger>
        <GitBranchIcon size={16} />
        <span>{currentBranch}</span>
        <ChevronUpIcon />
      </BranchSwitchMenuTrigger>

      <BranchSwitchMenuContent side="top" sideOffset={5}>
        <BranchSwitchMenuRadioGroup value={currentBranch}>
          {branchState.branches.length > 0
          && branchState.branches.map((branch, index) => (
            <BranchSwitchMenuRadioItem key={index} value={branch} onSelect={() => handleChangeBranch(branch)}>
              <BranchSwitchMenuItemIndicator>
                <CheckIcon />
              </BranchSwitchMenuItemIndicator>
              {`${branch}`}
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
            {branchState.branches.length > 0 && branchState.branches.map((branch, index) => <BranchSwitchMenuItem key={index}>{`${branch}`}</BranchSwitchMenuItem>)}
          </BranchSwitchMenuContent>
        </BranchSwitchMenu>
        <BranchSwitchMenuArrow offset={12} />
      </BranchSwitchMenuContent>
    </BranchSwitchMenu>
  );
}
