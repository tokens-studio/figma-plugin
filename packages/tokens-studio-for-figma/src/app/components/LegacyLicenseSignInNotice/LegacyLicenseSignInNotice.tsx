import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Link } from '@tokens-studio/ui';
import { styled } from '@/stitches.config';
import { Modal } from '../Modal/Modal';
import { useAuthStore } from '@/app/store/useAuthStore';
import { legacyOnlyLicenseSelector } from '@/selectors/legacyOnlyLicenseSelector';
import { activeTabSelector } from '@/selectors/activeTabSelector';
import { Tabs } from '@/constants/Tabs';
import { LEGACY_LICENSE_CUTOVER_DATE, LEGACY_LICENSE_SUPPORT_URL } from '@/constants/LegacyLicense';
import { TERMS_UPDATE_MODAL_KEY } from '../TermsUpdateModal';
import { track } from '@/utils/analytics';
import type { LegacyOnlyLicense } from '@/utils/licenseApi';
import type { RootState } from '@/app/store';

const ModalFooter = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$3',
});

const ModalFooterRight = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '$3',
  marginLeft: 'auto',
});

type NoticeConditions = {
  legacyOnlyLicense: LegacyOnlyLicense | null;
  isAuthenticated: boolean;
  dismissed: boolean;
  // Another startup dialog (the terms update) is still waiting to be seen, or the app is still loading.
  blocked: boolean;
};

/**
 * MIGRATION: whether to tell the user to sign in to keep Pro. Only for a key that Studio doesn't hold and the legacy
 * host accepted (see getLegacyOnlyLicense), and only while signed out: once signed in, the account decides Pro and
 * the key isn't what counts, whether or not that account is Pro. Remove with the legacy license host.
 */
export function shouldShowLegacyLicenseNotice({
  legacyOnlyLicense, isAuthenticated, dismissed, blocked,
}: NoticeConditions): boolean {
  return !!legacyOnlyLicense && !isAuthenticated && !dismissed && !blocked;
}

export default function LegacyLicenseSignInNotice() {
  const { t } = useTranslation(['licence']);
  const legacyOnlyLicense = useSelector(legacyOnlyLicenseSelector);
  const activeTab = useSelector(activeTabSelector);
  // These users are Pro by key and get the terms update first; don't stack the two dialogs.
  const termsUpdatePending = useSelector((state: RootState) => state.settings?.[TERMS_UPDATE_MODAL_KEY] === false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginWithOAuth = useAuthStore((state) => state.loginWithOAuth);
  // Kept in component state on purpose: dismissing only lasts for this session, and the next start asks again.
  const [dismissed, setDismissed] = useState(false);
  const trackedShown = useRef(false);

  const open = shouldShowLegacyLicenseNotice({
    legacyOnlyLicense,
    isAuthenticated,
    dismissed,
    blocked: activeTab === Tabs.LOADING || termsUpdatePending,
  });

  // Same `primaryStatus` / `primaryReason` as the `License API fallback` event, so the two can be joined.
  const trackingProps = useMemo(() => ({
    endpoint: 'validate-license',
    primaryStatus: legacyOnlyLicense?.primaryStatus ?? null,
    primaryReason: legacyOnlyLicense?.primaryReason ?? null,
  }), [legacyOnlyLicense]);

  useEffect(() => {
    // Once per session, like the dialog itself.
    if (open && !trackedShown.current) {
      trackedShown.current = true;
      track('Legacy license sign-in notice shown', trackingProps);
    }
  }, [open, trackingProps]);

  const handleLater = useCallback(() => {
    setDismissed(true);
  }, []);

  const handleSignIn = useCallback(async () => {
    track('Legacy license sign-in notice sign in clicked', trackingProps);
    // Make way for the sign-in flow's own dialog. Once signed in the notice stays hidden: the account decides Pro.
    setDismissed(true);
    try {
      await loginWithOAuth();
    } catch {
      // Cancelled or failed: the store holds the error. Bring the notice back so the user can retry or choose Later.
      setDismissed(false);
    }
  }, [loginWithOAuth, trackingProps]);

  if (!open) return null;

  return (
    <Modal
      title={t('legacySignIn.title')}
      isOpen={open}
      close={handleLater}
      showClose={false}
      footer={(
        <ModalFooter>
          <Link href={LEGACY_LICENSE_SUPPORT_URL} target="_blank" rel="noreferrer">
            {t('legacySignIn.needHelp')}
          </Link>
          <ModalFooterRight>
            <Button variant="secondary" onClick={handleLater}>
              {t('legacySignIn.later')}
            </Button>
            <Button variant="primary" onClick={handleSignIn}>
              {t('legacySignIn.signIn')}
            </Button>
          </ModalFooterRight>
        </ModalFooter>
      )}
    >
      <div style={{ lineHeight: 1.6 }}>
        <p>
          {LEGACY_LICENSE_CUTOVER_DATE
            ? t('legacySignIn.bodyWithDate', { date: LEGACY_LICENSE_CUTOVER_DATE })
            : t('legacySignIn.body')}
        </p>
      </div>
    </Modal>
  );
}
