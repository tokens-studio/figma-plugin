import { useDispatch, useSelector } from 'react-redux';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DropdownMenu, IconButton } from '@tokens-studio/ui';
import { Check, Settings } from 'iconoir-react';
import { Dispatch } from '../store';
import {
  settingsStateSelector, localApiStateSelector, autoApplyThemeOnDropSelector, shouldSwapFigmaModesSelector,
} from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { track } from '@/utils/analytics';

import { StorageProviderType } from '@/constants/StorageProviderType';

export default function SettingsDropdown() {
  const localApiState = useSelector(localApiStateSelector);
  const { t } = useTranslation(['tokens']);

  const {
    updateRemote, updateOnChange, shouldSwapStyles, shouldUpdateStyles,
  } = useSelector(settingsStateSelector, isEqual);
  const autoApplyThemeOnDrop = useSelector(autoApplyThemeOnDropSelector);
  const shouldSwapFigmaModes = useSelector(shouldSwapFigmaModesSelector);

  const {
    setUpdateOnChange, setUpdateRemote, setShouldSwapStyles, setShouldSwapFigmaModes, setShouldUpdateStyles, setAutoApplyThemeOnDrop,
  } = useDispatch<Dispatch>().settings;

  const handleUpdateOnChange = React.useCallback(() => {
    const newValue = !updateOnChange;
    track('updateOnChange', { value: newValue });
    setUpdateOnChange(newValue);
  }, [updateOnChange, setUpdateOnChange]);

  const handleUpdateRemote = React.useCallback(() => {
    const newValue = !updateRemote;
    track('updateRemote', { value: newValue });
    setUpdateRemote(newValue);
  }, [updateRemote, setUpdateRemote]);

  const handleShouldSwapStyles = React.useCallback(() => {
    const newValue = !shouldSwapStyles;
    track('shouldSwapStyles', { value: newValue });
    setShouldSwapStyles(newValue);
  }, [shouldSwapStyles, setShouldSwapStyles]);

  const handleShouldUpdateStyles = React.useCallback(() => {
    const newValue = !shouldUpdateStyles;
    track('shouldUpdateStyles', { value: newValue });
    setShouldUpdateStyles(newValue);
  }, [shouldUpdateStyles, setShouldUpdateStyles]);

  const handleAutoApplyThemeOnDrop = React.useCallback(() => {
    const newValue = !autoApplyThemeOnDrop;
    track('autoApplyThemeOnDrop', { value: newValue });
    setAutoApplyThemeOnDrop(newValue);
  }, [autoApplyThemeOnDrop, setAutoApplyThemeOnDrop]);

  const handleShouldSwapFigmaModes = React.useCallback(() => {
    const newValue = !shouldSwapFigmaModes;
    track('shouldSwapFigmaModes', { value: newValue });
    setShouldSwapFigmaModes(newValue);
  }, [shouldSwapFigmaModes, setShouldSwapFigmaModes]);

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
                <Check />
              </DropdownMenu.ItemIndicator>
              {t('update.remoteJSONBin.title')}
              <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
                {t('update.remoteJSONBin.description')}
              </Box>
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
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.swapStyles.description')}
            </Box>
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
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.shouldUpdateStyles.description')}
            </Box>
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
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.autoApplyThemeOnDrop.description')}
            </Box>
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            data-testid="should-swap-figma-modes"
            checked={shouldSwapFigmaModes}
            onCheckedChange={handleShouldSwapFigmaModes}
          >
            <DropdownMenu.ItemIndicator>
              <Check />
            </DropdownMenu.ItemIndicator>
            {t('update.shouldSwapFigmaModes.title')}
            <Box css={{ color: '$fgMuted', fontSize: '$xxsmall' }}>
              {t('update.shouldSwapFigmaModes.description')}
            </Box>
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
}
