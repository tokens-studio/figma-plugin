import React from 'react';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import Footer from './Footer';
import * as pjs from '../../../package.json';

describe('Footer', () => {
  it('displays current version number', () => {
    const { getByText } = render(<Footer />, { store });
    expect(getByText(`V ${pjs.version}`)).toBeInTheDocument();
  });

  it('shows branch selector for users on a free plan', () => {
    const { getByText } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: AVAILABLE_PROVIDERS.GITHUB, branch: 'test-branch' });
    waitFor(() => {
      expect(getByText('test-branch')).toBeInTheDocument();
    });
  });

  it('shows push button when user is able to push', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: AVAILABLE_PROVIDERS.GITHUB, branch: 'test-branch', filePath: 'tokens.json' });

    waitFor(() => {
      const pushButton = getByTestId('footer-push-button');

      expect(pushButton).toBeInTheDocument();
      expect(pushButton).not.toBeDisabled();
    });
  });

  it('disables push button when user is not able to push', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: AVAILABLE_PROVIDERS.GITHUB, branch: 'test-branch' });
    store.dispatch.tokenState.setEditProhibited(true);

    waitFor(() => {
      const pushButton = getByTestId('footer-push-button');

      expect(pushButton).toBeInTheDocument();
      expect(pushButton).toBeDisabled();
    });
  });

  it('shows pull button when user is able to pull', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setLocalApiState({ provider: AVAILABLE_PROVIDERS.GITHUB, branch: 'test-branch' });
    waitFor(() => {
      const pullButton = getByTestId('footer-pull-button');

      expect(pullButton).toBeInTheDocument();
      expect(pullButton).not.toBeDisabled();
    });
  });
});
