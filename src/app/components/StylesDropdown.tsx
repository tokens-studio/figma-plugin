import React from 'react';
import { useSelector } from 'react-redux';
import IconChevronDown from '@/icons/chevrondown.svg';
import useTokens from '../store/useTokens';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from './DropdownMenu';
import { editProhibitedSelector, themeOptionsSelector } from '@/selectors';
import Box from './Box';

export default function StylesDropdown() {
  const editProhibited = useSelector(editProhibitedSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const {
    pullStyles, createStylesFromTokens, syncStyles, createVariables, syncVariables,
  } = useTokens();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span>
          Styles & Variables
        </span>
        <Box css={{ flexShrink: 0 }}>
          <IconChevronDown />
        </Box>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuItem textValue="Sync styles" disabled={availableThemes.length < 1} onSelect={syncStyles}>Sync styles</DropdownMenuItem>
        <DropdownMenuItem textValue="Import styles" disabled={editProhibited} onSelect={pullStyles}>Import styles</DropdownMenuItem>
        <DropdownMenuItem textValue="Create styles" onSelect={createStylesFromTokens}>Create styles</DropdownMenuItem>
        <DropdownMenuItem textValue="Create variables" onSelect={createVariables}>Create variables</DropdownMenuItem>
        <DropdownMenuItem textValue="Sync variables" disabled={availableThemes.length < 1} onSelect={syncVariables}>Sync variables</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
