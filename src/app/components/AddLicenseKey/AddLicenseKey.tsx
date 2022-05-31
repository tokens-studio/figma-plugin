/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import Box from '../Box';
import Input from '../Input';
import Button from '../Button';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import Heading from '../Heading';
import Stack from '../Stack';
import { Dispatch } from '@/app/store';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import useConfirm from '@/app/hooks/useConfirm';
import { AddLicenseSource } from '@/app/store/models/userState';
import { userIdSelector } from '@/selectors/userIdSelector';

export default function AddLicenseKey() {
  const dispatch = useDispatch<Dispatch>();
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const [newKey, setLicenseKey] = useState(existingKey);
  const { confirm } = useConfirm();
  const userId = useSelector(userIdSelector);
  const ldClient = useLDClient();

  const addKey = useCallback(() => {
    if (newKey) {
      dispatch.userState.addLicenseKey({ key: newKey, source: AddLicenseSource.UI });
    }
  }, [newKey, dispatch]);

  const removeAccessToFeatures = useCallback(() => {
    if (userId) {
      ldClient?.identify({
        key: userId,
      });
    }
  }, [userId, ldClient]);

  const removeKey = useCallback(async () => {
    const confirmation = await confirm({
      text: 'Are you sure you want to remove your license key?',
      description: `Make sure you saved a copy of the license key somewhere,                    
        as it won’t be stored on this device after you deleted it.`,
      confirmAction: 'Remove license key',
    });
    if (confirmation) {
      dispatch.userState.removeLicenseKey('');
      removeAccessToFeatures();
    }
  }, [dispatch, confirm, removeAccessToFeatures]);

  useEffect(() => {
    setLicenseKey(existingKey);
  }, [existingKey]);

  const onLicenseKeyChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(ev.target.value.trim());
  }, []);

  const removeLicenseKeyButton = existingKey && (
    <Button variant="secondary" onClick={removeKey} disabled={existingKey !== newKey}>
      Remove key
    </Button>
  );

  return (
    <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
      <Heading size="medium">License key</Heading>
      <Stack
        direction="row"
        gap={2}
        css={{
          display: 'flex',
          alignItems: 'flex-end',
          width: '100%',
        }}
      >
        <Box css={{ flexGrow: 1 }}>
          <Input
            size="large"
            name="license-key"
            type="text"
            value={newKey || ''}
            full
            onChange={onLicenseKeyChange}
            error={licenseKeyError}
          />
        </Box>

        <Button variant="primary" onClick={addKey} disabled={existingKey === newKey}>
          {existingKey ? 'Update key' : 'Add license key'}
        </Button>
        <Box>{removeLicenseKeyButton}</Box>
      </Stack>
    </Stack>
  );
}
