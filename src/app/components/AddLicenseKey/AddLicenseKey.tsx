/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

export default function AddLicenseKey() {
  const dispatch = useDispatch<Dispatch>();
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const [newKey, setLicenseKey] = useState(existingKey);
  const { confirm } = useConfirm();

  const addKey = useCallback(() => {
    if (newKey) {
      dispatch.userState.addLicenseKey({ key: newKey, source: AddLicenseSource.UI });
    }
  }, [newKey, dispatch]);

  const removeKey = useCallback(async () => {
    const confirmation = await confirm({
      text: 'Are you sure you want to remove your license key?',
      description: `Make sure you saved a copy of the license key somewhere,                    
        as it won’t be stored on this device after you deleted it.`,
      confirmAction: 'Remove license',
    });
    if (confirmation) {
      dispatch.userState.removeLicenseKey('');
    }
  }, [dispatch, confirm]);

  useEffect(() => {
    setLicenseKey(existingKey);
  }, [existingKey]);

  const onLicenseKeyChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(ev.target.value.trim());
  }, []);

  const removeLicenseKeyButton = existingKey && (
    <Button variant="secondary" onClick={removeKey} disabled={existingKey !== newKey}>
      Remove license
    </Button>
  );

  return (
    <Stack direction="column" css={{ padding: '$4 0' }}>
      <Heading>License key</Heading>
      <Box
        css={{
          padding: '$4',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          paddingRight: '$9',
        }}
      >
        <Box css={{ flexGrow: 1, marginRight: '$4' }}>
          <Input
            name="license-key"
            type="text"
            value={newKey || ''}
            full
            onChange={onLicenseKeyChange}
            error={licenseKeyError}
          />
        </Box>
        <Box
          css={{
            alignSelf: licenseKeyError ? 'flex-end' : 'auto',
          }}
        >
          <Button variant="primary" onClick={addKey} disabled={existingKey === newKey}>
            {existingKey ? 'Update license key' : 'Add license addKey'}
          </Button>
        </Box>
        <Box
          css={{
            alignSelf: licenseKeyError ? 'flex-end' : 'auto',
            marginLeft: '$2',
          }}
        >
          {removeLicenseKeyButton}
        </Box>
      </Box>
    </Stack>
  );
}
