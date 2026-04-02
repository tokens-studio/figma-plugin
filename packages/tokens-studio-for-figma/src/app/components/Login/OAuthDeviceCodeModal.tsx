import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Text, Stack, Box,
} from '@tokens-studio/ui';
import { useAuthStore } from '@/app/store/useAuthStore';
import Modal from '../Modal';
import { styled } from '@/stitches.config';

const UserCodeDisplay = styled('div', {
  padding: '$4',
  backgroundColor: '$bgSubtle',
  borderRadius: '$medium',
  border: '1px solid $borderSubtle',
  width: '100%',
  textAlign: 'center',
  margin: '$4 0',
});

export const OAuthDeviceCodeModal = () => {
  const {
    deviceCode,
    setError,
  } = useAuthStore();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { t } = useTranslation(['subscription']);

  // Update countdown timer for device code expiration
  useEffect(() => {
    let interval: number | null = null;
    if (deviceCode) {
      const updateTimer = () => {
        const remaining = Math.max(0, deviceCode.expiresAt - Date.now());
        setTimeRemaining(Math.floor(remaining / 1000)); // Convert to seconds

        if (remaining <= 0) {
          setTimeRemaining(null);
        }
      };

      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    } else {
      setTimeRemaining(null);
    }

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [deviceCode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = React.useCallback(() => {
    setError(null);
  }, [setError]);

  const handleOpenVerificationUrl = React.useCallback(() => {
    if (deviceCode?.verificationUri) {
      window.open(deviceCode.verificationUri, '_blank');
    }
  }, [deviceCode?.verificationUri]);

  if (!deviceCode) return null;

  return (
    <Modal
      isOpen={!!deviceCode}
      close={handleCancel}
      title={t('authorizationRequired')}
      size="large"
      showClose
    >
      <Stack direction="column" gap={4} css={{ padding: '$4', alignItems: 'center' }}>
        <Text size="small" muted css={{ textAlign: 'center' }}>
          {t('browserTabOpened')}
        </Text>

        <UserCodeDisplay>
          <Text
            bold
            css={{
              fontFamily: 'monospace',
              letterSpacing: '0.2em',
              fontSize: '24px',
            }}
          >
            {deviceCode.userCode}
          </Text>
        </UserCodeDisplay>

        <Button
          variant="primary"
          onClick={handleOpenVerificationUrl}
          css={{ width: '100%', justifyContent: 'center' }}
        >
          {t('openAuthorizationPage')}
        </Button>

        <Box css={{ textAlign: 'center' }}>
          <Text size="xsmall" muted>
            {t('verificationLink')}
          </Text>
          <Box css={{ marginTop: '$1' }}>
            <a
              href={deviceCode.verificationUri}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--colors-interaction)', fontSize: '11px', wordBreak: 'break-all' }}
            >
              {deviceCode.verificationUri}
            </a>
          </Box>
        </Box>

        {timeRemaining !== null && (
          <Text
            size="small"
            css={{
              textAlign: 'center',
              color: timeRemaining < 60 ? '$dangerFg' : '$fgMuted',
            }}
          >
            {t('codeExpiresIn')}
            {' '}
            {formatTime(timeRemaining)}
          </Text>
        )}

        <Stack direction="row" justify="center" align="center" gap={2} css={{ marginTop: '$2' }}>
          <Box css={{
            width: 8, height: 8, borderRadius: '50%', backgroundColor: '$interaction', animation: 'pulse 1.5s infinite',
          }}
          />
          <Text size="small" muted>
            {t('waitingForAuthorization')}
          </Text>
        </Stack>
      </Stack>
    </Modal>
  );
};
