import React from 'react';
import { useSelector } from 'react-redux';
import IconChevronDown from './icons/IconChevronDown';
import useTokens from '../store/useTokens';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from './DropdownMenu';
import { editProhibitedSelector } from '@/selectors';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);

  const { pullStyles } = useTokens();
  const { createStylesFromTokens } = useTokens();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span>
          Styles
        </span>
        <IconChevronDown />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuItem textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>Import styles</DropdownMenuItem>
        <DropdownMenuItem textValue="Create styles" onSelect={createStylesFromTokens}>Create styles</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
