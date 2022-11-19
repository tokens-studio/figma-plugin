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
import { Dispatch } from '../store';
import IconChevronDown from '@/icons/chevrondown.svg';
import { settingsStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { UpdateMode } from '@/constants/UpdateMode';

export default function ApplySelector() {
  const {
    updateMode, updateRemote, updateOnChange, updateStyles, swapStyles,
  } = useSelector(settingsStateSelector, isEqual);

  const { swapStylesAlpha } = useFlags();

  const {
    setUpdateMode, setUpdateOnChange, setUpdateRemote, setUpdateStyles, setSwapStyles,
  } = useDispatch<Dispatch>().settings;

  const handleApplySelection = React.useCallback(() => {
    setUpdateMode(UpdateMode.SELECTION);
  }, [setUpdateMode]);

  const handleApplyPage = React.useCallback(() => {
    setUpdateMode(UpdateMode.PAGE);
  }, [setUpdateMode]);

  const handleApplyDocument = React.useCallback(() => {
    setUpdateMode(UpdateMode.DOCUMENT);
  }, [setUpdateMode]);

  const handleUpdateOnChange = React.useCallback(() => {
    setUpdateOnChange(!updateOnChange);
  }, [updateOnChange, setUpdateOnChange]);

  const handleUpdateRemote = React.useCallback(() => {
    setUpdateRemote(!updateRemote);
  }, [updateRemote, setUpdateRemote]);

  const handleUpdateStyles = React.useCallback(() => {
    setUpdateStyles(!updateStyles);
  }, [updateStyles, setUpdateStyles]);

  const handleSwapStyles = React.useCallback(() => {
    setSwapStyles(!swapStyles);
  }, [swapStyles, setSwapStyles]);

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
        {swapStylesAlpha && (
        <DropdownMenuCheckboxItem checked={swapStyles} onCheckedChange={handleSwapStyles}>
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Swap styles (Alpha)
        </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
