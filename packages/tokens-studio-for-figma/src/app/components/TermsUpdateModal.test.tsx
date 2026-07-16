import React from 'react';
import { Provider } from 'react-redux';
import {
  act,
  createMockStore,
  fireEvent,
  render,
  screen,
} from '../../../tests/config/setupTest';
import { Tabs } from '@/constants/Tabs';
import { useIsProUser } from '@/app/hooks/useIsProUser';
import { useAuthStore } from '@/app/store/useAuthStore';
import TermsUpdateModal from './TermsUpdateModal';

jest.mock('@/app/hooks/useIsProUser', () => ({
  useIsProUser: jest.fn(),
}));

const useIsProUserMock = useIsProUser as jest.MockedFunction<typeof useIsProUser>;

describe('TermsUpdateModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useIsProUserMock.mockReturnValue(true);
    act(() => {
      useAuthStore.setState({ isAuthenticated: false, isPro: false });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    useIsProUserMock.mockReset();
    act(() => {
      useAuthStore.setState({ isAuthenticated: false, isPro: false });
    });
  });

  const renderModal = (activeTab = Tabs.START) => {
    const store = createMockStore({
      settings: {
        seenTermsUpdate2026Subprocessors: false,
      },
      uiState: {
        activeTab,
      },
    });

    render(
      <Provider store={store}>
        <TermsUpdateModal />
      </Provider>,
    );

    return store;
  };

  it('shows the announcement for Pro users on the start screen', () => {
    renderModal();

    expect(screen.queryByText('Terms & Conditions Update')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Terms & Conditions Update')).toBeInTheDocument();
    expect(
      screen.getByText(
        'We have updated our Terms and Conditions, which will come into effect on August 14th, 2026. The changes include adding a new Subprocessor (Render.com) and improvements around our license portal. This notice is dated July 15th, 2026.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View the terms' })).toHaveAttribute('href', 'https://production.tokens.studio/legal/terms-of-service');
  });

  it('does not show the announcement to non-Pro users', () => {
    useIsProUserMock.mockReturnValue(false);
    renderModal();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Terms & Conditions Update')).not.toBeInTheDocument();
  });

  it('does not show the announcement to Tokens Studio subscription users', () => {
    act(() => {
      useAuthStore.setState({ isAuthenticated: true, isPro: true });
    });
    renderModal();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Terms & Conditions Update')).not.toBeInTheDocument();
  });

  it('shows the announcement for an authenticated user with a standalone license', () => {
    act(() => {
      useAuthStore.setState({ isAuthenticated: true, isPro: false });
    });
    renderModal();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Terms & Conditions Update')).toBeInTheDocument();
  });

  it('shows the announcement for Pro users with an existing file', () => {
    renderModal(Tabs.TOKENS);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Terms & Conditions Update')).toBeInTheDocument();
  });

  it('does not show the announcement while the application is loading', () => {
    renderModal(Tabs.LOADING);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Terms & Conditions Update')).not.toBeInTheDocument();
  });

  it('persists dismissal', () => {
    const store = renderModal();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(store.getState().settings.seenTermsUpdate2026Subprocessors).toBe(true);
  });
});
