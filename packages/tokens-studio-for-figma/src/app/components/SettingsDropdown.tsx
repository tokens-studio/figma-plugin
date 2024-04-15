import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { CheckIcon, GearIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, IconButton } from '@tokens-studio/ui';
import { Dispatch } from '../store';
import { settingsStateSelector, localApiStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import Box from './Box';

import { StorageProviderType } from '@/constants/StorageProviderType';

export default function SettingsDropdown() {
  const localApiState = useSelector(localApiStateSelector);
  const { t } = useTranslation(['tokens']);

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
      <DropdownMenu.Trigger asChild data-testid="bottom-bar-settings">
        <IconButton variant="invisible" size="small" icon={<GearIcon />} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" css={{ maxWidth: '300px' }}>
          <DropdownMenu.CheckboxItem
            data-testid="update-on-change"
            checked={updateOnChange}
            onCheckedChange={handleUpdateOnChange}
          >
            <DropdownMenu.ItemIndicator>
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
            {t('update.onChange.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.onChange.description')}
            </Box>
          </DropdownMenu.CheckboxItem>
          {localApiState?.provider === StorageProviderType.JSONBIN ? (
            <DropdownMenu.CheckboxItem
              data-testid="update-remote"
              checked={updateRemote}
              onCheckedChange={handleUpdateRemote}
            >
              <DropdownMenu.ItemIndicator>
                <CheckIcon />
              </DropdownMenu.ItemIndicator>
              {t('update.remoteJSONBin.title')}
              <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
                {t('update.remoteJSONBin.description')}
              </Box>
            </DropdownMenu.CheckboxItem>
          ) : null}
          <DropdownMenu.CheckboxItem
            data-testid="update-styles"
            checked={updateStyles}
            onCheckedChange={handleUpdateStyles}
          >
            <DropdownMenu.ItemIndicator>
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
            {t('update.styles.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.styles.description')}
            </Box>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            data-testid="swap-styles"
            checked={shouldSwapStyles}
            onCheckedChange={handleShouldSwapStyles}
          >
            <DropdownMenu.ItemIndicator>
              <CheckIcon />
            </DropdownMenu.ItemIndicator>
            {t('update.swapStyles.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.swapStyles.description')}
            </Box>
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
