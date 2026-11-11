import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, fireEvent, render, screen, waitFor,
} from '../../../../tests/config/setupTest';
import { Tabs } from '@/constants/Tabs';
import { useAuthStore } from '@/app/store/useAuthStore';
import { track } from '@/utils/analytics';
import type { LegacyOnlyLicense } from '@/utils/licenseApi';
import LegacyLicenseSignInNotice, { shouldShowLegacyLicenseNotice } from '.';

jest.mock('@/utils/analytics', () => ({ track: jest.fn(), identify: jest.fn() }));

const REMOVED_KEY: LegacyOnlyLicense = { primaryStatus: 404, primaryReason: 'status' };
const originalLoginWithOAuth = useAuthStore.getState().loginWithOAuth;
const signedOut = {
  isAuthenticated: false, isPro: false, user: null, loginWithOAuth: originalLoginWithOAuth,
};
const account = {
  id: 'u1', uuid: 'u1', firstName: '', lastName: '', email: 'jan@example.test', avatar: '', fullName: '',
};

describe('shouldShowLegacyLicenseNotice', () => {
  const base = {
    legacyOnlyLicense: REMOVED_KEY,
    isAuthenticated: false,
    dismissed: false,
    blocked: false,
  };

  it('shows for a signed-out user whose key Studio does not hold and legacy accepted', () => {
    expect(shouldShowLegacyLicenseNotice(base)).toBe(true);
  });

  it('does not show when the key did not take the legacy-only path', () => {
    // Studio 200, a Studio timeout/transport error, or legacy rejecting the key all leave this null.
    expect(shouldShowLegacyLicenseNotice({ ...base, legacyOnlyLicense: null })).toBe(false);
  });

  it('does not show while signed in: the account decides Pro, not the key', () => {
    expect(shouldShowLegacyLicenseNotice({ ...base, isAuthenticated: true })).toBe(false);
  });

  it('does not show once dismissed, or while another startup dialog is pending', () => {
    expect(shouldShowLegacyLicenseNotice({ ...base, dismissed: true })).toBe(false);
    expect(shouldShowLegacyLicenseNotice({ ...base, blocked: true })).toBe(false);
  });
});

describe('LegacyLicenseSignInNotice', () => {
  beforeEach(() => {
    (track as jest.Mock).mockClear();
    act(() => {
      useAuthStore.setState(signedOut);
    });
  });

  afterEach(() => {
    act(() => {
      useAuthStore.setState(signedOut);
    });
  });

  const renderNotice = ({
    legacyOnlyLicense = REMOVED_KEY as LegacyOnlyLicense | null,
    termsSeen = true,
    activeTab = Tabs.START,
  } = {}) => render(
    <Provider store={createMockStore({
      userState: { legacyOnlyLicense },
      settings: { seenTermsUpdate2026Subprocessors: termsSeen },
      uiState: { activeTab },
    })}
    >
      <LegacyLicenseSignInNotice />
    </Provider>,
  );

  it('shows the notice and tracks it with the fallback status', () => {
    renderNotice();

    expect(screen.getByText('legacySignIn.title')).toBeInTheDocument();
    expect(screen.getByText('legacySignIn.body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'legacySignIn.needHelp' })).toHaveAttribute('href', 'mailto:support@tokens.studio');
    expect(track).toHaveBeenCalledWith('Legacy license sign-in notice shown', {
      endpoint: 'validate-license',
      primaryStatus: 404,
      primaryReason: 'status',
    });
  });

  it('stays hidden when the key validated without the legacy-only path', () => {
    renderNotice({ legacyOnlyLicense: null });

    expect(screen.queryByText('legacySignIn.title')).not.toBeInTheDocument();
    expect(track).not.toHaveBeenCalled();
  });

  it.each([
    ['with Pro', true],
    ['without Pro', false],
  ])('stays hidden for a signed-in account %s', (_label, isPro) => {
    act(() => {
      useAuthStore.setState({ isAuthenticated: true, isPro, user: account });
    });
    renderNotice();

    expect(screen.queryByText('legacySignIn.title')).not.toBeInTheDocument();
    expect(track).not.toHaveBeenCalled();
  });

  it('waits until the terms update and the loading screen are out of the way', () => {
    const { unmount } = renderNotice({ termsSeen: false });
    expect(screen.queryByText('legacySignIn.title')).not.toBeInTheDocument();
    unmount();

    renderNotice({ activeTab: Tabs.LOADING });
    expect(screen.queryByText('legacySignIn.title')).not.toBeInTheDocument();
  });

  it('closes on Later without signing in', () => {
    const loginWithOAuth = jest.fn().mockResolvedValue(undefined);
    act(() => {
      useAuthStore.setState({ loginWithOAuth });
    });
    renderNotice();

    fireEvent.click(screen.getByRole('button', { name: 'legacySignIn.later' }));

    expect(screen.queryByText('legacySignIn.title')).not.toBeInTheDocument();
    expect(loginWithOAuth).not.toHaveBeenCalled();
  });

  it('starts the sign-in flow on Sign in, tracks the click and closes', async () => {
    const loginWithOAuth = jest.fn().mockResolvedValue(undefined);
    act(() => {
      useAuthStore.setState({ loginWithOAuth });
    });
    renderNotice();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'legacySignIn.signIn' }));
    });

    expect(loginWithOAuth).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('Legacy license sign-in notice sign in clicked', {
      endpoint: 'validate-license',
      primaryStatus: 404,
      primaryReason: 'status',
    });
    expect(screen.queryByText('legacySignIn.title')).not.toBeInTheDocument();
  });

  it('brings the notice back when sign-in fails or is cancelled', async () => {
    const loginWithOAuth = jest.fn().mockRejectedValue(new Error('Authorization cancelled by user'));
    act(() => {
      useAuthStore.setState({ loginWithOAuth });
    });
    renderNotice();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'legacySignIn.signIn' }));
    });

    await waitFor(() => expect(screen.getByText('legacySignIn.title')).toBeInTheDocument());
    // Shown once per session, so coming back is not tracked again.
    expect((track as jest.Mock).mock.calls.filter(([name]) => name === 'Legacy license sign-in notice shown')).toHaveLength(1);
  });
});
