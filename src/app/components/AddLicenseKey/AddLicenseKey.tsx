/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '../Box';
import Input from '../Input';
import Button from '../Button';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import Heading from '../Heading';
import Stack from '../Stack';
import { Dispatch } from '@/app/store';
import { featureFlagsSelector } from '@/selectors';

export default function AddLicenseKey() {
  const dispatch = useDispatch<Dispatch>();
  const licenseKey = useSelector(licenseKeySelector);
  const [key, setLicenseKey] = useState(licenseKey);

  const addKey = useCallback(() => {
    if (key) {
      postToFigma({
        type: MessageToPluginTypes.SET_LICENSE_KEY,
        licenseKey: key,
      });
      dispatch.uiState.setLicenseKey(key);
    }
  }, [key, dispatch]);

  return (
    <Stack direction="column" css={{ padding: '$4 0' }}>
      <Heading>License key</Heading>
      <Box css={{
        padding: '$4', display: 'flex', alignItems: 'center', width: '100%', paddingRight: '$9',
      }}
      >
        <Box css={{ flexGrow: 1, marginRight: '$4' }}>
          <Input
            name="license-key"
            type="text"
            value={key || ''}
            full
            onChange={(ev) => {
              setLicenseKey(ev.target.value);
            }}
          />
        </Box>
        <Button variant="secondary" onClick={addKey} disabled={licenseKey === key}>
          Add license addKey
        </Button>
      </Box>
    </Stack>
  );
}
