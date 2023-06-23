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
  const { t } = useTranslation('', { keyPrefix: 'tokens' });

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
          {t('updateOnChange')}
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            {t('updateOnChangeExplanation')}
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
            {t('updateRemoteJSONBin')}
            <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
              {t('updateRemoteJSONBinExplanation')}
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
          {t('updateStyles')}
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            {t('updateStylesExplanation')}
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
          {t('swapStyles')}
          <Box css={{ color: '$contextMenuForegroundMuted', fontSize: '$xxsmall' }}>
            {t('swapStylesExplanation')}
          </Box>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
