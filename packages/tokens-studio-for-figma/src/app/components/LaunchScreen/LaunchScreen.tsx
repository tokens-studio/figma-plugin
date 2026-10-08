import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { LaunchScreenLayout } from './LaunchScreenLayout';

const SLACK_URL = 'https://tokens.studio/slack';
const DOCS_URL = 'https://docs.tokens.studio/?ref=launchscreen';
const REPORT_ISSUE_URL = 'https://github.com/tokens-studio/figma-plugin/issues';

const PillButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '32px',
  paddingInline: '24px',
  borderRadius: '100px',
  whiteSpace: 'nowrap',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  letterSpacing: 'inherit',
  '&:focus-visible': {
    outline: '2px solid $focus',
    outlineOffset: '2px',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'default',
  },
  variants: {
    variant: {
      primary: {
        background: '$loadingScreenFg',
        color: '$loadingScreenBg',
        '&:hover': {
          opacity: 0.9,
        },
      },
      secondary: {
        border: '1.5px solid $loadingScreenBorder',
        color: '$loadingScreenFg',
        '&:hover': {
          borderColor: '$loadingScreenFgMuted',
        },
      },
      invisible: {
        color: '$loadingScreenFgSubtle',
        '&:hover': {
          color: '$loadingScreenFg',
        },
      },
    },
  },
});

const ErrorMessage = styled('p', {
  maxWidth: '280px',
  color: '$dangerFg',
});

const FooterLink = styled('a', {
  color: '$loadingScreenFgMuted',
  textDecoration: 'none',
  '&:hover, &:focus-visible': {
    color: '$loadingScreenFg',
  },
});

const FooterSeparator = styled('span', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '12px',
  height: '12px',
  '&::after': {
    content: '""',
    width: '2px',
    height: '2px',
    borderRadius: '100px',
    background: '$loadingScreenSeparator',
  },
});

type Props = {
  onCreateAccount?: () => void
  onLogIn?: () => void
  onContinueWithoutAccount?: () => void
  isLoggingIn?: boolean
  error?: string | null
};

export default function LaunchScreen({
  onCreateAccount, onLogIn, onContinueWithoutAccount, isLoggingIn, error,
}: Props) {
  const { t } = useTranslation(['startScreen']);

  return (
    <LaunchScreenLayout data-testid="launch-screen">
      <Stack direction="column" gap={6} align="center">
        <Stack direction="column" align="center" css={{ width: '180px', gap: '10px' }}>
          <PillButton type="button" variant="primary" onClick={onCreateAccount} data-testid="launch-screen-create-account">
            {t('createAccount')}
          </PillButton>
          <PillButton type="button" variant="secondary" onClick={onLogIn} disabled={isLoggingIn} data-testid="launch-screen-log-in">
            {t('logIn')}
          </PillButton>
          <PillButton type="button" variant="invisible" onClick={onContinueWithoutAccount} data-testid="launch-screen-continue">
            {t('continueWithoutAccount')}
          </PillButton>
        </Stack>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        <Stack direction="row" gap={1} align="center" justify="center">
          <FooterLink href={SLACK_URL} target="_blank" rel="noreferrer">{t('joinSlackShort')}</FooterLink>
          <FooterSeparator aria-hidden />
          <FooterLink href={DOCS_URL} target="_blank" rel="noreferrer">{t('docs')}</FooterLink>
          <FooterSeparator aria-hidden />
          <FooterLink href={REPORT_ISSUE_URL} target="_blank" rel="noreferrer">{t('reportIssue')}</FooterLink>
        </Stack>
      </Stack>
    </LaunchScreenLayout>
  );
}
