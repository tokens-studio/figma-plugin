/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { CheckedState } from '@radix-ui/react-checkbox';
import SyncSettings from '../SyncSettings';
import Checkbox from '../Checkbox';
import Heading from '../Heading';
import { Dispatch } from '../../store';
import Label from '../Label';
import { ignoreFirstPartForStylesSelector, prefixStylesWithThemeNameSelector } from '@/selectors';
import Stack from '../Stack';
import Box from '../Box';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import { track } from '@/utils/analytics';

function Settings() {
  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const prefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleIgnoreChange = React.useCallback(
    (state: CheckedState) => {
      track('setIgnoreFirstPartForStyles', { value: state });
      dispatch.settings.setIgnoreFirstPartForStyles(!!state);
    },
    [dispatch.settings],
  );

  const handlePrefixWithThemeNameChange = React.useCallback(
    (state: CheckedState) => {
      track('setPrefixStylesWithThemeName', { value: state });

      dispatch.settings.setPrefixStylesWithThemeName(!!state);
    },
    [dispatch.settings],
  );

  return (
    <Box className="content scroll-container">
      <Stack direction="column" gap={4} css={{ padding: '$3 0' }}>
        <AddLicenseKey />
        <Divider />
        <SyncSettings />
        <Divider />
        <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
          <Heading size="small">Styles</Heading>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              id="ignoreFirstPartForStyles"
              checked={!!ignoreFirstPartForStyles}
              defaultChecked={ignoreFirstPartForStyles}
              onCheckedChange={handleIgnoreChange}
            />
            <Label htmlFor="ignoreFirstPartForStyles">Ignore first part of token name for styles</Label>
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              id="prefixStylesWithThemeName"
              checked={!!prefixStylesWithThemeName}
              defaultChecked={prefixStylesWithThemeName}
              onCheckedChange={handlePrefixWithThemeNameChange}
            />
            <Label htmlFor="prefixStylesWithThemeName">Prefix styles with active theme name</Label>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
