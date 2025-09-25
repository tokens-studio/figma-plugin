import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DropdownMenu, IconButton } from '@tokens-studio/ui';
import { Check, Settings } from 'iconoir-react';
import { Dispatch } from '../store';
import { settingsStateSelector, localApiStateSelector, autoApplyThemeOnDropSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';

import { StorageProviderType } from '@/constants/StorageProviderType';

export default function SettingsDropdown() {
  const localApiState = useSelector(localApiStateSelector);
  const { t } = useTranslation(['tokens']);

  const {
    updateRemote, updateOnChange, shouldSwapStyles, shouldUpdateStyles,
  } = useSelector(
    settingsStateSelector,
    isEqual,
  );
  const autoApplyThemeOnDrop = useSelector(autoApplyThemeOnDropSelector);

  const {
    setUpdateOnChange, setUpdateRemote, setShouldSwapStyles, setShouldUpdateStyles, setAutoApplyThemeOnDrop,
  } = useDispatch<Dispatch>().settings;

  const handleUpdateOnChange = React.useCallback(() => {
    setUpdateOnChange(!updateOnChange);
  }, [updateOnChange, setUpdateOnChange]);

  const handleUpdateRemote = React.useCallback(() => {
    setUpdateRemote(!updateRemote);
  }, [updateRemote, setUpdateRemote]);

  const handleShouldSwapStyles = React.useCallback(() => {
    setShouldSwapStyles(!shouldSwapStyles);
  }, [shouldSwapStyles, setShouldSwapStyles]);

  const handleShouldUpdateStyles = React.useCallback(() => {
    setShouldUpdateStyles(!shouldUpdateStyles);
  }, [shouldUpdateStyles, setShouldUpdateStyles]);

  const handleAutoApplyThemeOnDrop = React.useCallback(() => {
    setAutoApplyThemeOnDrop(!autoApplyThemeOnDrop);
  }, [autoApplyThemeOnDrop, setAutoApplyThemeOnDrop]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild data-testid="bottom-bar-settings">
        <IconButton variant="invisible" size="small" icon={<Settings />} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content side="top" css={{ maxWidth: '300px' }}>
          <DropdownMenu.CheckboxItem
            data-testid="update-on-change"
            checked={updateOnChange}
            onCheckedChange={handleUpdateOnChange}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('update.onChange.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>{t('update.onChange.description')}</Box>
          </DropdownMenu.CheckboxItem>
          {localApiState?.provider === StorageProviderType.JSONBIN ? (
            <DropdownMenu.CheckboxItem
              data-testid="update-remote"
              checked={updateRemote}
              onCheckedChange={handleUpdateRemote}
            >
              <DropdownMenu.ItemIndicator>
                <Check />
              </DropdownMenu.ItemIndicator>
              {t('update.remoteJSONBin.title')}
              <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>{t('update.remoteJSONBin.description')}</Box>
            </DropdownMenu.CheckboxItem>
          ) : null}
          <DropdownMenu.CheckboxItem
            data-testid="swap-styles"
            checked={shouldSwapStyles}
            onCheckedChange={handleShouldSwapStyles}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('update.swapStyles.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>{t('update.swapStyles.description')}</Box>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            data-testid="should-update-styles"
            checked={shouldUpdateStyles}
            onCheckedChange={handleShouldUpdateStyles}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('update.shouldUpdateStyles.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>{t('update.shouldUpdateStyles.description')}</Box>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            data-testid="auto-apply-theme-on-drop"
            checked={autoApplyThemeOnDrop}
            onCheckedChange={handleAutoApplyThemeOnDrop}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('update.autoApplyThemeOnDrop.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>{t('update.autoApplyThemeOnDrop.description')}</Box>
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
