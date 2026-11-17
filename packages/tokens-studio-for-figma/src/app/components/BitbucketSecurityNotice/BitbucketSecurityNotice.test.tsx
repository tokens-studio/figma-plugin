import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, fireEvent, render, screen,
} from '../../../../tests/config/setupTest';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { Tabs } from '@/constants/Tabs';
import { useAuthStore } from '@/app/store/useAuthStore';
import type { StorageTypeCredentials } from '@/types/StorageType';
import type { LegacyOnlyLicense } from '@/utils/licenseApi';
import BitbucketSecurityNotice, { shouldShowBitbucketSecurityNotice, hasBitbucketApiToken } from '.';
import {
  BITBUCKET_SECURITY_NOTICE_MAX_VIEWS, BITBUCKET_SECURITY_NOTICE_URL, BITBUCKET_SETUP_GUIDE_URL,
} from './BitbucketSecurityNotice';

const TITLE = 'Action needed: replace your Bitbucket API token';
const BITBUCKET_CREDENTIAL = {
  provider: StorageProviderType.BITBUCKET, id: 'workspace/repo', internalId: 'b', name: 'Bitbucket', secret: '', apiToken: 'token',
} as StorageTypeCredentials;
const BITBUCKET_APP_PASSWORD = {
  provider: StorageProviderType.BITBUCKET, id: 'workspace/repo', internalId: 'p', name: 'Bitbucket', secret: 'app-password',
} as StorageTypeCredentials;
const GITHUB_CREDENTIAL = {
  provider: StorageProviderType.GITHUB, id: 'o/r', internalId: 'g', name: 'GitHub', secret: '',
} as StorageTypeCredentials;

describe('hasBitbucketApiToken', () => {
  it('is true for a saved Bitbucket sync with an API token', () => {
    expect(hasBitbucketApiToken([GITHUB_CREDENTIAL, BITBUCKET_CREDENTIAL])).toBe(true);
  });

  it('is false for app passwords, blank tokens and other providers', () => {
    expect(hasBitbucketApiToken([BITBUCKET_APP_PASSWORD])).toBe(false);
    expect(hasBitbucketApiToken([{ ...BITBUCKET_CREDENTIAL, apiToken: '  ' } as StorageTypeCredentials])).toBe(false);
    expect(hasBitbucketApiToken([GITHUB_CREDENTIAL])).toBe(false);
    expect(hasBitbucketApiToken(undefined as unknown as StorageTypeCredentials[])).toBe(false);
  });
});

describe('shouldShowBitbucketSecurityNotice', () => {
  const base = {
    hadApiTokenAtLaunch: true, views: 0, shownThisSession: false, dismissed: false, blocked: false,
  };

  it('shows for a Bitbucket user on the first three launches', () => {
    expect(shouldShowBitbucketSecurityNotice(base)).toBe(true);
    expect(shouldShowBitbucketSecurityNotice({ ...base, views: 2 })).toBe(true);
  });

  it('does not show once it was seen three times or the advisory was opened', () => {
    expect(shouldShowBitbucketSecurityNotice({ ...base, views: BITBUCKET_SECURITY_NOTICE_MAX_VIEWS })).toBe(false);
  });

  it('stays open on the launch that brought it to the max', () => {
    expect(shouldShowBitbucketSecurityNotice({
      ...base, views: BITBUCKET_SECURITY_NOTICE_MAX_VIEWS, shownThisSession: true,
    })).toBe(true);
  });

  it('does not show after closing it, or while blocked', () => {
    expect(shouldShowBitbucketSecurityNotice({ ...base, dismissed: true })).toBe(false);
    expect(shouldShowBitbucketSecurityNotice({ ...base, blocked: true })).toBe(false);
  });

  it('does not show without a Bitbucket API token at launch', () => {
    expect(shouldShowBitbucketSecurityNotice({ ...base, hadApiTokenAtLaunch: false })).toBe(false);
  });
});

describe('BitbucketSecurityNotice', () => {
  let messageSpy: jest.SpyInstance;

  beforeEach(() => {
    messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    messageSpy.mockRestore();
    useAuthStore.setState({ isAuthenticated: false, isPro: false });
  });

  const renderNotice = ({
    apiProviders = [BITBUCKET_CREDENTIAL],
    views = 0,
    activeTab = Tabs.START,
    showBitbucketMigrationDialog = false,
    licenseKey = '',
    legacyOnlyLicense = null,
  }: {
    apiProviders?: StorageTypeCredentials[];
    views?: number;
    activeTab?: Tabs;
    showBitbucketMigrationDialog?: boolean;
    licenseKey?: string;
    legacyOnlyLicense?: LegacyOnlyLicense | null;
  } = {}) => {
    const store = createMockStore({
      settings: { bitbucketSecurityNoticeViews2026: views, seenTermsUpdate2026Subprocessors: false },
      uiState: {
        activeTab, apiProviders, showBitbucketMigrationDialog,
      },
      userState: { licenseKey, legacyOnlyLicense },
    });
    const result = render(
      <Provider store={store}>
        <BitbucketSecurityNotice />
      </Provider>,
    );
    return { ...result, store };
  };

  const savedViews = (store: ReturnType<typeof renderNotice>['store']) => store.getState().settings.bitbucketSecurityNoticeViews2026;

  it('shows to Bitbucket users with a link to the advisory', () => {
    renderNotice();

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read advisory' })).toHaveAttribute('href', BITBUCKET_SECURITY_NOTICE_URL);
  });

  it.each([
    ['without Bitbucket sync', [GITHUB_CREDENTIAL]],
    ['with only a Bitbucket app password', [BITBUCKET_APP_PASSWORD]],
    ['without a Bitbucket credential of their own', []],
  ])('stays hidden for users %s, and counts nothing', (_, apiProviders) => {
    const { store } = renderNotice({ apiProviders });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(0);
  });

  it('decides at launch: a token added later in the session does not open it', () => {
    const { store } = renderNotice({ apiProviders: [] });

    act(() => {
      store.dispatch.uiState.setAPIProviders([BITBUCKET_CREDENTIAL]);
    });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(0);
  });

  it('decides once loading ends, from the syncs loaded by then', () => {
    const { store } = renderNotice({ activeTab: Tabs.LOADING, apiProviders: [] });

    act(() => {
      store.dispatch.uiState.setAPIProviders([BITBUCKET_CREDENTIAL]);
      store.dispatch.uiState.setActiveTab(Tabs.START);
    });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('waits for the terms update, then shows once it is seen', () => {
    const { store } = renderNotice({ licenseKey: 'key' });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(0);

    act(() => {
      store.dispatch.settings.setSeenTermsUpdate2026Subprocessors(true);
    });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(savedViews(store)).toBe(1);
  });

  it('is not held back by the terms flag for users who never get the terms update', () => {
    renderNotice({ licenseKey: '' });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('waits for the legacy license notice, then shows once it is closed', () => {
    const { store } = renderNotice({ legacyOnlyLicense: { primaryStatus: 404, primaryReason: 'status' } });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(0);

    act(() => {
      store.dispatch.uiState.setLegacyLicenseNoticeDismissed(true);
    });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('stays hidden once a Bitbucket sync is saved, before it opens', () => {
    const { store } = renderNotice({ legacyOnlyLicense: { primaryStatus: 404, primaryReason: 'status' } });

    act(() => {
      store.dispatch.settings.setBitbucketSecurityNoticeViews2026(BITBUCKET_SECURITY_NOTICE_MAX_VIEWS);
      store.dispatch.uiState.setLegacyLicenseNoticeDismissed(true);
    });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('counts one view per launch and saves it', () => {
    const { store } = renderNotice({ views: 1 });

    expect(savedViews(store)).toBe(2);
    expect(messageSpy).toHaveBeenCalledTimes(1);
    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: AsyncMessageTypes.SET_UI,
      bitbucketSecurityNoticeViews2026: 2,
    }));
  });

  it('stays open on the third launch, then never shows again', () => {
    const { store, unmount } = renderNotice({ views: BITBUCKET_SECURITY_NOTICE_MAX_VIEWS - 1 });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(savedViews(store)).toBe(BITBUCKET_SECURITY_NOTICE_MAX_VIEWS);
    unmount();

    renderNotice({ views: BITBUCKET_SECURITY_NOTICE_MAX_VIEWS });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('waits for the loading screen and the Bitbucket migration dialog, without counting a view', () => {
    const { store, unmount } = renderNotice({ activeTab: Tabs.LOADING });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(0);
    unmount();

    const { store: blockedStore } = renderNotice({ showBitbucketMigrationDialog: true });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(blockedStore)).toBe(0);
  });

  it('closes on Escape and only counts the launch', () => {
    const { store } = renderNotice();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(1);
  });

  it('opens the Bitbucket sync guide without hiding the notice', () => {
    const { store } = renderNotice();

    const guide = screen.getByRole('link', { name: 'Bitbucket sync guide' });
    expect(guide).toHaveAttribute('href', BITBUCKET_SETUP_GUIDE_URL);
    fireEvent.click(guide);

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(savedViews(store)).toBe(1);
  });

  it('only has the guide and advisory buttons', () => {
    renderNotice();

    expect(screen.queryByRole('button', { name: 'Remind me later' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sync settings' })).not.toBeInTheDocument();
  });

  it('lists the four steps to replace the token', () => {
    renderNotice();

    expect(screen.getAllByRole('listitem').map((item) => item.querySelector('strong')?.textContent)).toEqual([
      'Revoke your current token',
      'Create a new API token',
      'Find your Bitbucket sync',
      'Replace the token',
    ]);
  });

  it('links to the security contact', () => {
    renderNotice();

    expect(screen.getByRole('link', { name: 'security@tokens.studio' })).toHaveAttribute('href', 'mailto:security@tokens.studio');
  });

  it('hides for good once the advisory is opened, even on the first launch', () => {
    const { store } = renderNotice();

    fireEvent.click(screen.getByRole('link', { name: 'Read advisory' }));

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(BITBUCKET_SECURITY_NOTICE_MAX_VIEWS);
    expect(messageSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      type: AsyncMessageTypes.SET_UI,
      bitbucketSecurityNoticeViews2026: BITBUCKET_SECURITY_NOTICE_MAX_VIEWS,
    }));
  });
});
