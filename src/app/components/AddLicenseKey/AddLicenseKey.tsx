/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback, useEffect, useState, useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useTranslation } from 'react-i18next';
import Box from '../Box';
import Input from '../Input';
import Button from '../Button';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import Heading from '../Heading';
import Stack from '../Stack';
import { styled } from '@/stitches.config';
import { Dispatch } from '@/app/store';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import useConfirm from '@/app/hooks/useConfirm';
import { AddLicenseSource } from '@/app/store/models/userState';
import ProBadge from '../ProBadge';
import { userIdSelector } from '@/selectors/userIdSelector';
import { licenseDetailsSelector } from '@/selectors';
import { ldUserFactory } from '@/utils/ldUserFactory';

export default function AddLicenseKey() {
  const inputEl = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch<Dispatch>();
  const existingKey = useSelector(licenseKeySelector);
  const licenseDetails = useSelector(licenseDetailsSelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const [newKey, setLicenseKey] = useState(existingKey);
  const { confirm } = useConfirm();
  const userId = useSelector(userIdSelector);
  const ldClient = useLDClient();

  const { t } = useTranslation('', { keyPrefix: 'licence' });

  const addKey = useCallback(async () => {
    if (newKey) {
      await dispatch.userState.addLicenseKey({ key: newKey, source: AddLicenseSource.UI });
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
    if (licenseKeyError) {
      dispatch.userState.removeLicenseKey('');
    } else {
      const confirmation = await confirm({
        text: t('confirmRemove') as string,
        description: t('keepLicenceSafe'),
        confirmAction: t('removeLicenceKey') as string,
      });
      if (confirmation) {
        dispatch.userState.removeLicenseKey('');
        removeAccessToFeatures();
      }
    }
  }, [t, dispatch, confirm, removeAccessToFeatures, licenseKeyError]);

  const ManageSubscriptionLink = styled('a', {
    color: '$fgAccent',
    fontSize: '$xsmall',
  });

  useEffect(() => {
    setLicenseKey(existingKey);
  }, [existingKey]);

  useEffect(() => {
    if (userId && existingKey && licenseDetails) {
      ldClient?.identify(
        ldUserFactory(userId, licenseDetails.plan, licenseDetails.entitlements, licenseDetails.clientEmail),
      );
    }
  }, [userId, ldClient, existingKey, licenseDetails]);

  const onLicenseKeyChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(ev.target.value.trim());
  }, []);

  const addLicenseKeyButton = !existingKey && (
    <Button variant="primary" onClick={addKey} disabled={existingKey === newKey}>
      {t('addLicenseKey')}
    </Button>
  );

  const removeLicenseKeyButton = existingKey && (
    <Button variant="primary" onClick={removeKey}>
      {t('removeKey')}
    </Button>
  );

  return (
    <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
      <Stack direction="row" gap={2} align="center" justify="between">
        <Heading size="small">
          {t('License key')}
        </Heading>
        <Stack direction="row" gap={2} align="center">
          <ProBadge />
          {existingKey && !licenseKeyError && (
            <ManageSubscriptionLink href="https://account.tokens.studio" target="_blank">
              {t('Manage subscription')}
            </ManageSubscriptionLink>
          )}
        </Stack>
      </Stack>
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
            full
            size="large"
            name="license-key"
            data-testid="settings-license-key-input"
            type="password"
            inputRef={inputEl}
            isMasked
            value={newKey || ''}
            onChange={onLicenseKeyChange}
            error={licenseKeyError}
          />
        </Box>
        {addLicenseKeyButton}
        {removeLicenseKeyButton}
      </Stack>
    </Stack>
  );
}
