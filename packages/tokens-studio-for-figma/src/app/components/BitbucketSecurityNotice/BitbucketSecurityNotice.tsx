import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@tokens-studio/ui';
import { WarningTriangleSolid } from 'iconoir-react';
import { styled } from '@/stitches.config';
import { Modal } from '../Modal/Modal';
import { Dispatch } from '@/app/store';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { Tabs } from '@/constants/Tabs';
import { activeTabSelector } from '@/selectors/activeTabSelector';
import { apiProvidersSelector } from '@/selectors/apiProvidersSelector';
import { showBitbucketMigrationDialogSelector } from '@/selectors/showBitbucketMigrationDialogSelector';
import { legacyOnlyLicenseSelector } from '@/selectors/legacyOnlyLicenseSelector';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useTermsUpdatePending } from '../TermsUpdateModal';
import { shouldShowLegacyLicenseNotice } from '../LegacyLicenseSignInNotice';
import type { RootState } from '@/app/store';
import type { StorageTypeCredentials } from '@/types/StorageType';

export const BITBUCKET_SECURITY_NOTICE_URL = 'https://tokens.studio/security-advisory';
export const BITBUCKET_SECURITY_NOTICE_KEY = 'bitbucketSecurityNoticeViews2026';
// The notice shows on this many plugin launches, or until the advisory is opened, whichever comes first.
export const BITBUCKET_SECURITY_NOTICE_MAX_VIEWS = 3;
export const BITBUCKET_SETUP_GUIDE_URL = 'https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket';
const SECURITY_EMAIL = 'security@tokens.studio';

const Body = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  lineHeight: 1.6,
  '& ol': {
    margin: 0,
    listStyle: 'decimal',
    paddingLeft: '$5',
    display: 'flex',
    flexDirection: 'column',
    gap: '$2',
  },
  '& a': {
    color: 'inherit',
    textDecoration: 'underline',
  },
});

const ModalFooterRight = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '$3',
});

const WarningIcon = styled(WarningTriangleSolid, {
  color: '$warningFg',
});

type NoticeConditions = {
  // The user had a saved Bitbucket API token when the plugin finished loading. Decided once per launch, so adding or
  // replacing a token later in the session doesn't open the notice.
  hadApiTokenAtLaunch: boolean;
  // Launches the notice has already been shown on, saved across sessions. Opening the advisory sets it to the max.
  views: number;
  // Already shown in this session: keeps the third showing open even though it brought views to the max.
  shownThisSession: boolean;
  dismissed: boolean;
  // The app is still loading, or another startup dialog is open or still to come.
  blocked: boolean;
};

/**
 * Whether the user has a saved Bitbucket sync that uses an API token. Only API tokens were saved into files: app
 * passwords never were, and someone who only opens a file synced with Bitbucket has no token of their own to replace.
 */
export function hasBitbucketApiToken(apiProviders: StorageTypeCredentials[]): boolean {
  return (apiProviders ?? []).some((provider) => provider.provider === StorageProviderType.BITBUCKET
    && typeof provider.apiToken === 'string' && provider.apiToken.trim() !== '');
}

/**
 * Whether to show the Bitbucket security notice: only to users who had a Bitbucket API token saved at launch, on up
 * to three launches, until they open the advisory or save a Bitbucket sync. Closing it hides it for this session only.
 */
export function shouldShowBitbucketSecurityNotice({
  hadApiTokenAtLaunch, views, shownThisSession, dismissed, blocked,
}: NoticeConditions): boolean {
  if (dismissed || blocked || !hadApiTokenAtLaunch) return false;
  return shownThisSession || views < BITBUCKET_SECURITY_NOTICE_MAX_VIEWS;
}

export default function BitbucketSecurityNotice() {
  const dispatch = useDispatch<Dispatch>();
  const activeTab = useSelector(activeTabSelector);
  const apiProviders = useSelector(apiProvidersSelector);
  const migrationDialogOpen = useSelector(showBitbucketMigrationDialogSelector);
  const termsUpdatePending = useTermsUpdatePending();
  const legacyOnlyLicense = useSelector(legacyOnlyLicenseSelector);
  const legacyLicenseNoticeDismissed = useSelector((state: RootState) => state.uiState.legacyLicenseNoticeDismissed);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const views = useSelector((state: RootState) => state.settings?.[BITBUCKET_SECURITY_NOTICE_KEY] ?? 0);
  // Kept in component state on purpose: closing the notice only lasts for this session.
  const [dismissed, setDismissed] = useState(false);
  const [shownThisSession, setShownThisSession] = useState(false);
  // Guards the count synchronously: the store update re-renders before the state update above lands.
  const countedThisSession = useRef(false);
  // Null until loading ends, then fixed for the session.
  const [hadApiTokenAtLaunch, setHadApiTokenAtLaunch] = useState<boolean | null>(null);
  const isLoading = activeTab === Tabs.LOADING;
  const isCypress = typeof window !== 'undefined' && !!(window as any).Cypress;
  // The legacy license notice goes first; this one waits until it is closed.
  const legacyLicenseNoticePending = shouldShowLegacyLicenseNotice({
    legacyOnlyLicense, isAuthenticated, dismissed: legacyLicenseNoticeDismissed, blocked: false,
  });

  useEffect(() => {
    if (hadApiTokenAtLaunch === null && !isLoading) {
      setHadApiTokenAtLaunch(hasBitbucketApiToken(apiProviders));
    }
  }, [hadApiTokenAtLaunch, isLoading, apiProviders]);

  const open = shouldShowBitbucketSecurityNotice({
    hadApiTokenAtLaunch: !!hadApiTokenAtLaunch,
    views,
    shownThisSession,
    dismissed,
    blocked: isLoading || migrationDialogOpen || termsUpdatePending || legacyLicenseNoticePending || isCypress,
  });

  useEffect(() => {
    // Count each launch once, the first time the notice opens in it.
    if (open && !countedThisSession.current) {
      countedThisSession.current = true;
      setShownThisSession(true);
      dispatch.settings.setBitbucketSecurityNoticeViews2026(views + 1);
    }
  }, [open, views, dispatch]);

  const handleCancel = useCallback(() => {
    setDismissed(true);
  }, []);

  const handleOpenLink = useCallback(() => {
    dispatch.settings.setBitbucketSecurityNoticeViews2026(BITBUCKET_SECURITY_NOTICE_MAX_VIEWS);
    setDismissed(true);
  }, [dispatch]);

  if (!open) return null;

  return (
    <Modal
      title="Action needed: replace your Bitbucket API token"
      icon={<WarningIcon />}
      isOpen={open}
      close={handleCancel}
      showClose={false}
      footer={(
        <ModalFooterRight>
          {/* Opening the guide doesn't count as seen: only the advisory hides the notice for good. */}
          {/* @ts-ignore Exception for Button to accept target */}
          <Button as="a" href={BITBUCKET_SETUP_GUIDE_URL} target="_blank" rel="noreferrer" variant="secondary">
            Bitbucket sync guide
          </Button>
          {/* @ts-ignore Exception for Button to accept target */}
          <Button as="a" href={BITBUCKET_SECURITY_NOTICE_URL} target="_blank" rel="noreferrer" variant="primary" onClick={handleOpenLink}>
            Read advisory
          </Button>
        </ModalFooterRight>
      )}
    >
      <Body>
        <p>
          We found and fixed a security issue affecting Bitbucket sync. Earlier versions of the plugin could save your
          Bitbucket API token inside the Figma files you synced, where anyone with access to those files could read it.
        </p>
        <p>
          This update removes the token from each file the next time it&apos;s opened. Copies of files made before the
          update may still contain it, so please replace your token:
        </p>
        <ol>
          <li>
            <strong>Revoke your current token</strong>
            {' '}
            in your Atlassian/Bitbucket account settings, under Security → API tokens.
          </li>
          <li>
            <strong>Create a new API token</strong>
            {' '}
            with the same permissions.
          </li>
          <li>
            <strong>Find your Bitbucket sync</strong>
            {' '}
            in the plugin: open the Settings tab and look under Sync providers.
          </li>
          <li>
            <strong>Replace the token</strong>
            {' '}
            by choosing Edit from the ⋮ menu next to your Bitbucket sync, pasting the new token, and saving.
          </li>
        </ol>
        <p>
          It takes about two minutes. Until you revoke the old token, anyone who has a copy of an affected file could use
          it to access your Bitbucket repositories.
        </p>
        <p>
          Questions? Contact
          {' '}
          <a href={`mailto:${SECURITY_EMAIL}`}>{SECURITY_EMAIL}</a>
        </p>
      </Body>
    </Modal>
  );
}
