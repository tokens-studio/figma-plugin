import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from './DropdownMenu';
import IconChevronDown from './icons/IconChevronDown';
import IconChevronRight from './icons/IconChevronRight';
import {
  branchSelector, storageTypeSelector, apiSelector,
} from '@/selectors';
import { StorageProviderType } from '../../types/api';
import * as GitHub from '../store/providers/github';

export default function BranchSelector() {
  const branchState = useSelector(branchSelector);
  // const storageType = useSelector(storageTypeSelector);
  // const api = useSelector(apiSelector);
  const [currentBranch, setCurrentBranch] = useState('');

  const handleChangeBranch = (branch: string) => {
    setCurrentBranch(branch);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger bordered>
        <span>{currentBranch}</span>
        <IconChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuRadioGroup value={currentBranch}>
          {branchState.branches.length > 0 && branchState.branches.map((branch, index) => (
            <DropdownMenuRadioItem key={index} value={branch} onSelect={() => handleChangeBranch(branch)}>
              <DropdownMenuItemIndicator>
                <CheckIcon />
              </DropdownMenuItemIndicator>
              Apply to
              {' '}
              {`${branch}`}
              {' '}
              branch
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenu css={{ position: 'static' }}>
          <DropdownMenuTrigger css={{
            backgroundColor: '#222222',
            color: 'white',
            '&:hover, &:focus': {
              outline: 'none',
              backgroundColor: '$interaction',
              color: '$onInteraction',
            },
          }}
          >
            create new branch from
            <IconChevronRight />
          </DropdownMenuTrigger>
          <DropdownMenuContent css={{ marginLeft: '145px' }}>
            {branchState.branches.length > 0 && branchState.branches.map((branch, index) => <DropdownMenuItem key={index}>{`${branch}`}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
