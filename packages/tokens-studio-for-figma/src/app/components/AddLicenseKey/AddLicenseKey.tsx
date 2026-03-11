/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback, useEffect, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Heading, TextInput, Box, Stack, IconButton,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { styled } from '@/stitches.config';
import { Dispatch } from '@/app/store';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';
import useConfirm from '@/app/hooks/useConfirm';
import { AddLicenseSource } from '@/app/store/models/userState';
import ProBadge from '../ProBadge';
import { userIdSelector } from '@/selectors/userIdSelector';
import { ErrorMessage } from '../ErrorMessage';
import { addLicenseKey } from '@/utils/addLicenseKey';

const SectionTitle = styled('div', {
  fontSize: '12px',
  fontWeight: 600,
  color: '$fgDefault',
  marginBottom: '$3',
});

const SectionCaption = styled('p', {
  fontSize: '$xsmall',
  color: '$fgMuted',
  lineHeight: 1.5,
  margin: 0,
});

const InlineLink = styled('a', {
  color: '#5ba4f5',
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
});

interface Props {
  isCompact?: boolean;
}

export default function AddLicenseKey({ isCompact }: Props) {
  const dispatch = useDispatch<Dispatch>();
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);
  const [newKey, setLicenseKey] = useState(existingKey);
  const { confirm } = useConfirm();
  const userId = useSelector(userIdSelector);
  const { t } = useTranslation(['licence']);
  const [isMasked, setIsMasked] = useState(true);

  const toggleMask = useCallback(() => {
    setIsMasked((prev) => !prev);
  }, []);

  const addKey = useCallback(async () => {
    if (newKey) {
      await addLicenseKey(
        dispatch,
        { key: newKey, source: AddLicenseSource.UI },
        {
          userId,
        },
      );
    }
  }, [newKey, dispatch, userId]);

  const removeKey = useCallback(async () => {
    if (licenseKeyError) {
      dispatch.userState.removeLicenseKey(undefined);
    } else {
      const confirmation = await confirm({
        text: t('confirmRemove') as string,
        description: t('keepLicenseSafe'),
        confirmAction: t('removeKey') as string,
      });
      if (confirmation) {
        dispatch.userState.removeLicenseKey(undefined);
      }
    }
  }, [t, dispatch, confirm, licenseKeyError]);

  const ManageSubscriptionLink = styled('a', {
    color: '$accentDefault',
    fontSize: '$xsmall',
  });

  useEffect(() => {
    setLicenseKey(existingKey);
  }, [existingKey]);

  const onLicenseKeyChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setLicenseKey(ev.target.value.trim());
  }, []);

  const addLicenseKeyButton = !existingKey && (
    <Button variant="secondary" onClick={addKey} disabled={existingKey === newKey}>
      {t('addLicenseKey')}
    </Button>
  );

  const removeLicenseKeyButton = existingKey && <Button variant="secondary" onClick={removeKey}>{t('removeLicenseKey')}</Button>;

  return (
    <Stack direction="column" gap={3} css={{ padding: isCompact ? 0 : '0 $4' }}>
      {!isCompact ? (
        <Stack direction="row" gap={2} align="center" justify="between">
          <Heading size="medium">{t('licenseKey')}</Heading>
          <Stack direction="row" gap={2} align="center">
            <ProBadge campaign="add-license-key" />
            {existingKey && !licenseKeyError && (
              <ManageSubscriptionLink href="https://account.tokens.studio" target="_blank">
                {t('manageSubscription')}
              </ManageSubscriptionLink>
            )}
          </Stack>
        </Stack>
      ) : (
        <>
          <div style={{ marginBottom: '8px' }}>
            <SectionTitle style={{ marginBottom: 0 }}>License key</SectionTitle>
          </div>
          <SectionCaption style={{ marginBottom: '12px' }}>
            To activate plan go through registration process and then check your email or this link
            {' '}
            <InlineLink href="https://account.tokens.studio/email-login" target="_blank" rel="noreferrer">
              https://account.tokens.studio/email-login
            </InlineLink>
            {' '}
            to grab license key
          </SectionCaption>
        </>
      )}
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
          <TextInput
            type={isMasked ? 'password' : 'text'}
            trailingAction={(
              <IconButton
                variant="invisible"
                size="small"
                onClick={toggleMask}
                icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
              />
            )}
            name="license-key"
            data-testid="settings-license-key-input"
            value={newKey || ''}
            onChange={onLicenseKeyChange}
            validationStatus={licenseKeyError ? 'error' : undefined}
          />
          {licenseKeyError && (
            <Box css={{ paddingTop: '$2' }}>
              <ErrorMessage>{licenseKeyError}</ErrorMessage>
            </Box>
          )}
        </Box>
        {addLicenseKeyButton}
        {removeLicenseKeyButton}
      </Stack>
    </Stack>
  );
}
