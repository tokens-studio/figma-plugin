import React from 'react';
import { render, resetStore, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import Footer from './Footer';
import pjs from '../../../package.json';
import { StorageProviderType } from '@/constants/StorageProviderType';

jest.mock('@/hooks/useChangedState', () => ({
  useChangedState: () => ({
    changedPushState: {},
    changedPullState: {},
    hasChanges: true,
  }),
}));

jest.mock('./DirtyStateBadgeWrapper', () => ({
  DirtyStateBadgeWrapper: ({ badge, children }: { badge: boolean; children: React.ReactNode }) => (
    <div data-testid={badge ? 'dirty-badge-visible' : 'dirty-badge-hidden'}>
      {children}
    </div>
  ),
}));

describe('Footer', () => {
  beforeEach(() => {
    resetStore();
  });

  it('displays current version number', () => {
    const { getByText } = render(<Footer />, { store });
    expect(getByText(`V ${pjs.version}`)).toBeInTheDocument();
  });

  it('shows branch selector for users on a free plan', () => {
    const { getByText } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    waitFor(() => {
      expect(getByText('test-branch')).toBeInTheDocument();
    });
  });

  it('shows push button when user is able to push', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch', filePath: 'tokens.json' });

    waitFor(() => {
      const pushButton = getByTestId('footer-push-button');

      expect(pushButton).toBeInTheDocument();
      expect(pushButton).not.toBeDisabled();
    });
  });

  it('disables push button when user is not able to push', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    store.dispatch.tokenState.setEditProhibited(true);

    waitFor(() => {
      const pushButton = getByTestId('footer-push-button');

      expect(pushButton).toBeInTheDocument();
      expect(pushButton).toBeDisabled();
    });
  });

  it('shows pull button when user is able to pull', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    waitFor(() => {
      const pullButton = getByTestId('footer-pull-button');

      expect(pullButton).toBeInTheDocument();
      expect(pullButton).not.toBeDisabled();
    });
  });

  it('hides push badge when push is disabled', async () => {
    const { getByTestId, queryByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    store.dispatch.tokenState.setEditProhibited(true);

    await waitFor(() => {
      const pushButton = getByTestId('footer-push-button');
      expect(pushButton).toBeDisabled();
    });

    expect(queryByTestId('dirty-badge-visible')).toBeNull();
  });
});
