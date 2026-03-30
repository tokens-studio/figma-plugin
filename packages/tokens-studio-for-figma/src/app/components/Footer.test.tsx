import React from 'react';
import { render, waitFor, resetStore } from '../../../tests/config/setupTest';
import { store } from '../store';
import Footer from './Footer';
import pjs from '../../../package.json';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('Footer', () => {
  beforeEach(() => {
    resetStore();
  });

  it('displays current version number', () => {
    const { getByText } = render(<Footer />, { store });
    expect(getByText(`V ${pjs.version}`)).toBeInTheDocument();
  });

  it('shows branch selector for users on a free plan', async () => {
    const { getByText } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    await waitFor(() => {
      expect(getByText('test-branch')).toBeInTheDocument();
    });
  });

  it('shows push button and dirty badge when user is able to push', async () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch', filePath: 'tokens.json' });

    await waitFor(() => {
      const pushButton = getByTestId('footer-push-button');

      expect(pushButton).toBeInTheDocument();
      expect(pushButton).not.toBeDisabled();
      expect(getByTestId('footer-push-dirty-badge')).toBeInTheDocument();
    });
  });

  it('disables push button and hides dirty badge when user is not able to push', async () => {
    const { getByTestId, queryByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    store.dispatch.tokenState.setEditProhibited(true);

    await waitFor(() => {
      const pushButton = getByTestId('footer-push-button');

      expect(pushButton).toBeInTheDocument();
      expect(pushButton).toBeDisabled();
      expect(queryByTestId('footer-push-dirty-badge')).not.toBeInTheDocument();
    });
  });

  it('shows pull button when user is able to pull', async () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: StorageProviderType.GITHUB, branch: 'test-branch' });
    await waitFor(() => {
      const pullButton = getByTestId('footer-pull-button');

      expect(pullButton).toBeInTheDocument();
      expect(pullButton).not.toBeDisabled();
    });
  });
});
