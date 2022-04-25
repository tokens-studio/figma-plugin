import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from './DropdownMenu';
import { UpdateMode } from '@/types/state';
import { Dispatch } from '../store';
import IconChevronDown from './icons/IconChevronDown';
import { settingsStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';

export default function ApplySelector() {
  const {
    updateMode, updateRemote, updateOnChange, updateStyles,
  } = useSelector(settingsStateSelector, isEqual);

  const {
    setUpdateMode, setUpdateOnChange, setUpdateRemote, setUpdateStyles,
  } = useDispatch<Dispatch>().settings;

  const handleApplySelection = () => {
    setUpdateMode(UpdateMode.SELECTION);
  };

  const handleApplyPage = () => {
    setUpdateMode(UpdateMode.PAGE);
  };

  const handleApplyDocument = () => {
    setUpdateMode(UpdateMode.DOCUMENT);
  };

  const handleUpdateOnChange = () => {
    setUpdateOnChange(!updateOnChange);
  };

  const handleUpdateRemote = () => {
    setUpdateRemote(!updateRemote);
  };

  const handleUpdateStyles = () => {
    setUpdateStyles(!updateStyles);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger bordered>
        <span>
          Apply to
          {' '}
          {updateMode}
        </span>
        <IconChevronDown />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuRadioGroup value={updateMode}>
          <DropdownMenuRadioItem value={UpdateMode.PAGE} onSelect={handleApplyPage}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Apply to page
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={UpdateMode.DOCUMENT} onSelect={handleApplyDocument}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Apply to document
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={UpdateMode.SELECTION} onSelect={handleApplySelection}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Apply to selection
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem checked={updateOnChange} onCheckedChange={handleUpdateOnChange}>
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Update on change
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={updateRemote} onCheckedChange={handleUpdateRemote}>
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Update remote
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={updateStyles} onCheckedChange={handleUpdateStyles}>
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Update styles
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
