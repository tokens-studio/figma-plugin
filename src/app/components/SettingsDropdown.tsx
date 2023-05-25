import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { CheckIcon, GearIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuCheckboxItem,
} from './DropdownMenu';
import { Dispatch } from '../store';
import { settingsStateSelector, localApiStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import Box from './Box';
import { StorageProviderType } from '@/constants/StorageProviderType';

export default function SettingsDropdown() {
  const localApiState = useSelector(localApiStateSelector);

  const {
    updateRemote, updateOnChange, updateStyles, shouldSwapStyles,
  } = useSelector(settingsStateSelector, isEqual);

  const {
    setUpdateOnChange, setUpdateRemote, setUpdateStyles, setShouldSwapStyles,
  } = useDispatch<Dispatch>().settings;

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
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="bottom-bar-settings">
        <GearIcon />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top">
        <DropdownMenuCheckboxItem
          data-testid="update-on-change"
          checked={updateOnChange}
          onCheckedChange={handleUpdateOnChange}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Update on change
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            Applies tokens whenever you make a change (slow!)
          </Box>
        </DropdownMenuCheckboxItem>
        {localApiState?.provider === StorageProviderType.JSONBIN ? (
          <DropdownMenuCheckboxItem
            data-testid="update-remote"
            checked={updateRemote}
            onCheckedChange={handleUpdateRemote}
          >
            <DropdownMenuItemIndicator>
              <CheckIcon />
            </DropdownMenuItemIndicator>
            Update remote
            <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
              Updates JSONBin whenever you make a change
            </Box>
          </DropdownMenuCheckboxItem>
        ) : null}
        <DropdownMenuCheckboxItem
          data-testid="update-styles"
          checked={updateStyles}
          onCheckedChange={handleUpdateStyles}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Update styles
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            Updates the value of local styles when names match
          </Box>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          data-testid="swap-styles"
          checked={shouldSwapStyles}
          onCheckedChange={handleShouldSwapStyles}
        >
          <DropdownMenuItemIndicator>
            <CheckIcon />
          </DropdownMenuItemIndicator>
          Swap styles
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            Swap themes by just changing styles, requires Themes
          </Box>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
