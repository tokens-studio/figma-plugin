import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { CheckIcon, GearIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('');

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
          {t('tokens.update.onChange.title')}
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            {t('tokens.update.onChange.description')}
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
            {t('tokens.update.remoteJSONBin.title')}
            <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
              {t('tokens.update.remoteJSONBin.description')}
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
          {t('tokens.update.styles.title')}
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            {t('tokens.update.styles.description')}
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
          {t('tokens.update.swapStyles.title')}
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            {t('tokens.update.swapStyles.description')}
          </Box>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
