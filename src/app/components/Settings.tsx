/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SyncSettings from './SyncSettings';
import Checkbox from './Checkbox';
import Heading from './Heading';
import { Dispatch } from '../store';
import Label from './Label';
import { ignoreFirstPartForStylesSelector } from '@/selectors';
import Stack from './Stack';
import Box from './Box';
import AddLicenseKey from './AddLicenseKey/AddLicenseKey';
import { Divider } from './Divider';

function Settings() {
  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleIgnoreChange = React.useCallback(
    (bool: boolean) => {
      dispatch.settings.setIgnoreFirstPartForStyles(bool);
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
          <Heading size="medium">Styles</Heading>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              id="ignoreFirstPartForStyles"
              checked={!!ignoreFirstPartForStyles}
              defaultChecked={ignoreFirstPartForStyles}
              onCheckedChange={handleIgnoreChange}
            />
            <Label htmlFor="ignoreFirstPartForStyles">Ignore first part of token name for styles</Label>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
