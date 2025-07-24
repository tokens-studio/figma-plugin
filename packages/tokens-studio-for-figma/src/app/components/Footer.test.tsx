import React from 'react';
import { render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import Footer from './Footer';
import pjs from '../../../package.json';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('Footer', () => {
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

  it('shows "Open in Studio" button when using Tokens Studio storage', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setStorage({
      provider: StorageProviderType.TOKENS_STUDIO,
      orgId: 'test-org',
      id: 'test-project',
      name: 'Test Project',
      baseUrl: 'https://app.tokens.studio',
    });

    waitFor(() => {
      const openStudioButton = getByTestId('footer-open-studio-button');
      expect(openStudioButton).toBeInTheDocument();
      expect(openStudioButton).not.toBeDisabled();
    });
  });

  it('does not show "Open in Studio" button when not using Tokens Studio storage', () => {
    store.dispatch.uiState.setStorage({
      provider: StorageProviderType.GITHUB,
      id: 'test/repo',
      name: 'Test Repo',
      branch: 'main',
      filePath: 'tokens.json',
    });
    
    const { queryByTestId } = render(<Footer />, { store });
    
    const openStudioButton = queryByTestId('footer-open-studio-button');
    expect(openStudioButton).not.toBeInTheDocument();
  });

  it('opens studio URL when "Open in Studio" button is clicked', () => {
    const { getByTestId } = render(<Footer />, { store });
    store.dispatch.uiState.setStorage({
      provider: StorageProviderType.TOKENS_STUDIO,
      orgId: 'test-org',
      id: 'test-project',
      name: 'Test Project',
      baseUrl: 'https://app.tokens.studio',
    });

    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    waitFor(() => {
      const openStudioButton = getByTestId('footer-open-studio-button');
      openStudioButton.click();

      expect(mockOpen).toHaveBeenCalledWith(
        'https://app.tokens.studio/org/test-org/project/test-project',
        '_blank'
      );
    });
  });
});
