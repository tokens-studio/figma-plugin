import React from 'react';
import { Provider } from 'react-redux';
import {
  createMockStore, fireEvent, render, screen,
} from '../../../../tests/config/setupTest';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { Tabs } from '@/constants/Tabs';
import type { StorageType, StorageTypeCredentials } from '@/types/StorageType';
import BitbucketSecurityNotice, { shouldShowBitbucketSecurityNotice, usesBitbucketSync } from '.';
import {
  BITBUCKET_SECURITY_NOTICE_MAX_VIEWS, BITBUCKET_SECURITY_NOTICE_URL, BITBUCKET_SETUP_GUIDE_URL,
} from './BitbucketSecurityNotice';

const TITLE = 'Action needed: replace your Bitbucket API token';
const LOCAL: StorageType = { provider: StorageProviderType.LOCAL };
const BITBUCKET_FILE = { provider: StorageProviderType.BITBUCKET, id: 'workspace/repo' } as StorageType;
const BITBUCKET_CREDENTIAL = {
  provider: StorageProviderType.BITBUCKET, id: 'workspace/repo', internalId: 'b', name: 'Bitbucket', secret: '',
} as StorageTypeCredentials;
const GITHUB_CREDENTIAL = {
  provider: StorageProviderType.GITHUB, id: 'o/r', internalId: 'g', name: 'GitHub', secret: '',
} as StorageTypeCredentials;

describe('usesBitbucketSync', () => {
  it('is true for a saved Bitbucket sync or a file synced with Bitbucket', () => {
    expect(usesBitbucketSync([BITBUCKET_CREDENTIAL], LOCAL)).toBe(true);
    expect(usesBitbucketSync([], BITBUCKET_FILE)).toBe(true);
  });

  it('is false for users without Bitbucket sync', () => {
    expect(usesBitbucketSync([GITHUB_CREDENTIAL], LOCAL)).toBe(false);
    expect(usesBitbucketSync([], LOCAL)).toBe(false);
    expect(usesBitbucketSync(undefined as unknown as StorageTypeCredentials[], undefined as unknown as StorageType)).toBe(false);
  });
});

describe('shouldShowBitbucketSecurityNotice', () => {
  const base = {
    apiProviders: [BITBUCKET_CREDENTIAL], storageType: LOCAL, views: 0, shownThisSession: false, dismissed: false, blocked: false,
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

  it('does not show without Bitbucket sync', () => {
    expect(shouldShowBitbucketSecurityNotice({ ...base, apiProviders: [GITHUB_CREDENTIAL] })).toBe(false);
  });
});

describe('BitbucketSecurityNotice', () => {
  let messageSpy: jest.SpyInstance;

  beforeEach(() => {
    messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockResolvedValue(undefined as any);
  });

  afterEach(() => {
    messageSpy.mockRestore();
  });

  const renderNotice = ({
    apiProviders = [BITBUCKET_CREDENTIAL],
    storageType = LOCAL,
    views = 0,
    activeTab = Tabs.START,
    showBitbucketMigrationDialog = false,
  }: {
    apiProviders?: StorageTypeCredentials[];
    storageType?: StorageType;
    views?: number;
    activeTab?: Tabs;
    showBitbucketMigrationDialog?: boolean;
  } = {}) => {
    const store = createMockStore({
      settings: { bitbucketSecurityNoticeViews2026: views },
      uiState: {
        activeTab, apiProviders, storageType, showBitbucketMigrationDialog,
      },
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

  it('shows when the open file syncs with Bitbucket', () => {
    renderNotice({ apiProviders: [], storageType: BITBUCKET_FILE });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('stays hidden for users without Bitbucket sync, and counts nothing', () => {
    const { store } = renderNotice({ apiProviders: [GITHUB_CREDENTIAL] });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(savedViews(store)).toBe(0);
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
