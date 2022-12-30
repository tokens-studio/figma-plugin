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
import { useFlags } from './LaunchDarkly';
import Stack from './Stack';
import Button from './Button';

type Props = {
  handleUpdate: () => void;
};

export default function ApplySelector({ handleUpdate }: Props) {
  const {
    updateMode, updateRemote, updateOnChange, updateStyles, shouldSwapStyles,
  } = useSelector(settingsStateSelector, isEqual);

  const { swapStylesAlpha } = useFlags();

  const {
    setUpdateMode, setUpdateOnChange, setUpdateRemote, setUpdateStyles, setShouldSwapStyles,
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

  const handleShouldSwapStyles = React.useCallback(() => {
    setShouldSwapStyles(!shouldSwapStyles);
  }, [shouldSwapStyles, setShouldSwapStyles]);

  return (
    <Stack direction="row">
      <Button variant="primary" onClick={handleUpdate}>
        Apply to
        {' '}
        {updateMode}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger bordered data-testid="apply-selector">
          <IconChevronDown />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top">
          <DropdownMenuRadioGroup value={updateMode}>
            <DropdownMenuRadioItem data-testid="apply-to-page" value={UpdateMode.PAGE} onSelect={handleApplyPage}>
              <DropdownMenuItemIndicator>
                <CheckIcon />
              </DropdownMenuItemIndicator>
              Apply to page
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem data-testid="apply-to-document" value={UpdateMode.DOCUMENT} onSelect={handleApplyDocument}>
              <DropdownMenuItemIndicator>
                <CheckIcon />
              </DropdownMenuItemIndicator>
              Apply to document
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem data-testid="apply-to-selection" value={UpdateMode.SELECTION} onSelect={handleApplySelection}>
              <DropdownMenuItemIndicator>
                <CheckIcon />
              </DropdownMenuItemIndicator>
              Apply to selection
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem data-testid="update-on-change" checked={updateOnChange} onCheckedChange={handleUpdateOnChange}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Auto-Apply on changes
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem data-testid="update-remote" checked={updateRemote} onCheckedChange={handleUpdateRemote}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Auto-Update remote on changes
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem data-testid="update-styles" checked={updateStyles} onCheckedChange={handleUpdateStyles}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Update styles
          </DropdownMenuCheckboxItem>
          {swapStylesAlpha && (
          <DropdownMenuCheckboxItem data-testid="swap-styles-alpha" checked={shouldSwapStyles} onCheckedChange={handleShouldSwapStyles}>
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Swap styles (Alpha)
          </DropdownMenuCheckboxItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  );
}
