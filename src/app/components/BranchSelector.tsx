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
  branchSelector,
} from '@/selectors';

export default function BranchSelector() {
  const branches = useSelector(branchSelector);
  const [currentBranch, setCurrentBranch] = useState('');

  const handleChangeBranch = (branch) => {
    setCurrentBranch(branch);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger bordered>
        <span>
          Apply to
          {' '}
          {currentBranch}
        </span>
        <IconChevronDown />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuRadioGroup value={currentBranch}>
          <DropdownMenuRadioItem value="master" onSelect={() => handleChangeBranch('master')}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Apply to page
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="sync" onSelect={() => handleChangeBranch('sync')}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Apply to document
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="frontend" onSelect={() => handleChangeBranch('frontend')}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Apply to selection
          </DropdownMenuRadioItem>
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
          <DropdownMenuContent sideOffset={10} css={{ marginLeft: '145px' }}>
            <DropdownMenuItem>Stitches</DropdownMenuItem>
            <DropdownMenuItem>Radix</DropdownMenuItem>
            <DropdownMenuItem>Modulz</DropdownMenuItem>
            <DropdownMenuItem>Twitter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
