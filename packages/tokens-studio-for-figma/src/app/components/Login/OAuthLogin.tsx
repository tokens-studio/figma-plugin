import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '@tokens-studio/ui';
import { useAuthStore } from '@/app/store/useAuthStore';
import { styled } from '@/stitches.config';

const LoginRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

const LoginLabel = styled('span', {
  fontSize: '$small',
  fontWeight: '$sansBold',
  color: '$fgDefault',
});

const ErrorContainer = styled('div', {
  marginTop: '$4',
  padding: '$3',
  borderRadius: '$small',
  backgroundColor: '$dangerBg',
  color: '$dangerFg',
  fontSize: '$small',
});

interface OAuthLoginProps {
  onSuccess?: () => void;
}

export const OAuthLogin = ({ onSuccess }: OAuthLoginProps) => {
  const {
    loginWithOAuth,
    error: authError,
    isLoading,
    deviceCode,
    setError,
    isAuthenticated,
  } = useAuthStore();
  const { t } = useTranslation(['subscription']);

  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      onSuccess();
    }
  }, [isAuthenticated, onSuccess]);

  const handleOAuthLogin = React.useCallback(async () => {
    try {
      await loginWithOAuth();
    } catch (error) {
      // Error is already handled in the store
      console.error('OAuth login failed:', error);
    }
  }, [loginWithOAuth]);

  const handleRestartLogin = React.useCallback(() => {
    setError(null);
  }, [setError]);

  const getErrorMessage = () => {
    if (authError && authError.includes('OAuthError')) {
      // Try to extract user-friendly message if it's an OAuthError
      try {
        const error = JSON.parse(authError);
        return error.userMessage || authError;
      } catch {
        return authError;
      }
    }
    return authError;
  };

  // Default login button view
  return (
    <div style={{ width: '100%' }}>
      <LoginRow>
        <LoginLabel>{t('alreadyHaveAccount')}</LoginLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoading && !deviceCode && (
            <Text muted css={{ fontSize: '$small' }}>{t('loading')}</Text>
          )}
          <Button
            variant="secondary"
            onClick={handleOAuthLogin}
            disabled={isLoading}
          >
            {t('login')}
          </Button>
        </div>
      </LoginRow>

      {authError && (
        <ErrorContainer>
          <Text size="small">{getErrorMessage()}</Text>
          <Button variant="secondary" onClick={handleRestartLogin} css={{ marginTop: '$3', width: '100%' }}>
            {t('tryAgain')}
          </Button>
        </ErrorContainer>
      )}
    </div>
  );
};
