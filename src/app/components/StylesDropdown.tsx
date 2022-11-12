import React from 'react';
import { useSelector } from 'react-redux';
import IconChevronDown from '@/icons/chevrondown.svg';
import useTokens from '../store/useTokens';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from './DropdownMenu';
import { editProhibitedSelector, themeOptionsSelector } from '@/selectors';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const availableThemes = useSelector(themeOptionsSelector);

  const { pullStyles } = useTokens();
  const { createStylesFromTokens } = useTokens();
  const { syncStyles } = useTokens();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span>
          Styles
        </span>
        <IconChevronDown />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuItem textValue="Sync styles" disabled={availableThemes.length < 1} onSelect={syncStyles}>Sync styles</DropdownMenuItem>
        <DropdownMenuItem textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>Import styles</DropdownMenuItem>
        <DropdownMenuItem textValue="Create styles" onSelect={createStylesFromTokens}>Create styles</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
