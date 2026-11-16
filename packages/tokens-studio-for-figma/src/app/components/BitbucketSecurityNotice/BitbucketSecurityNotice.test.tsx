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
import { BITBUCKET_SECURITY_NOTICE_URL, BITBUCKET_SETUP_GUIDE_URL } from './BitbucketSecurityNotice';

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
    apiProviders: [BITBUCKET_CREDENTIAL], storageType: LOCAL, seen: false, dismissed: false, blocked: false,
  };

  it('shows for a Bitbucket user who has not opened the link', () => {
    expect(shouldShowBitbucketSecurityNotice(base)).toBe(true);
  });

  it('does not show once the link was opened, after Cancel, or while blocked', () => {
    expect(shouldShowBitbucketSecurityNotice({ ...base, seen: true })).toBe(false);
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
    seen = false,
    activeTab = Tabs.START,
    showBitbucketMigrationDialog = false,
  }: {
    apiProviders?: StorageTypeCredentials[];
    storageType?: StorageType;
    seen?: boolean;
    activeTab?: Tabs;
    showBitbucketMigrationDialog?: boolean;
  } = {}) => render(
    <Provider store={createMockStore({
      settings: { seenBitbucketSecurityNotice2026: seen },
      uiState: {
        activeTab, apiProviders, storageType, showBitbucketMigrationDialog,
      },
    })}
    >
      <BitbucketSecurityNotice />
    </Provider>,
  );

  it('shows to Bitbucket users with a link to the advisory', () => {
    renderNotice();

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read advisory' })).toHaveAttribute('href', BITBUCKET_SECURITY_NOTICE_URL);
  });

  it('shows when the open file syncs with Bitbucket', () => {
    renderNotice({ apiProviders: [], storageType: BITBUCKET_FILE });

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('stays hidden for users without Bitbucket sync', () => {
    renderNotice({ apiProviders: [GITHUB_CREDENTIAL] });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('stays hidden once the link was opened', () => {
    renderNotice({ seen: true });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('waits for the loading screen and the Bitbucket migration dialog', () => {
    const { unmount } = renderNotice({ activeTab: Tabs.LOADING });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    unmount();

    renderNotice({ showBitbucketMigrationDialog: true });
    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it('closes on Escape without saving, so it shows again next time', () => {
    renderNotice();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(messageSpy).not.toHaveBeenCalled();

    // A new session starts with the notice again.
    renderNotice();
    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });

  it('has no Remind me later button', () => {
    renderNotice();

    expect(screen.queryByRole('button', { name: 'Remind me later' })).not.toBeInTheDocument();
  });

  it('opens the Bitbucket sync guide without saving, so it shows again next time', () => {
    renderNotice();

    const guide = screen.getByRole('link', { name: 'Bitbucket sync guide' });
    expect(guide).toHaveAttribute('href', BITBUCKET_SETUP_GUIDE_URL);
    fireEvent.click(guide);

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(messageSpy).not.toHaveBeenCalled();
  });

  it('links to the security contact', () => {
    renderNotice();

    expect(screen.getByRole('link', { name: 'security@tokens.studio' })).toHaveAttribute('href', 'mailto:security@tokens.studio');
  });

  it('has no Sync settings button', () => {
    renderNotice();

    expect(screen.queryByRole('button', { name: 'Sync settings' })).not.toBeInTheDocument();
  });

  it('saves that the link was opened and never shows again', () => {
    renderNotice();

    fireEvent.click(screen.getByRole('link', { name: 'Read advisory' }));

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: AsyncMessageTypes.SET_UI,
      seenBitbucketSecurityNotice2026: true,
    }));
  });
});
