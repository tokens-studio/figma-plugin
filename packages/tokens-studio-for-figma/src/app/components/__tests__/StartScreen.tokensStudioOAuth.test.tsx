import React from 'react';
import { Provider } from 'react-redux';
import {
  render, screen, fireEvent, createMockStore,
} from '../../../../tests/config/setupTest';
import StartScreen from '../StartScreen';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { Tabs } from '@/constants/Tabs';
import { SIGN_IN_REQUIRED, VARIABLES_SOURCE_OF_TRUTH } from '@/app/store/providers/tokens-studio/studioAuth';

jest.mock('@/app/store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    restoreStoredProvider: jest.fn(),
    restoreProviderWithAutoPull: jest.fn(),
  }),
}));

const renderWithError = (lastError: { type: 'credential' | 'other'; header: string; message: string; code?: string }) => {
  const store = createMockStore({
    uiState: {
      storageType: {
        provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
        id: 'project-id',
        name: 'Studio project',
        internalId: 'studio-internal-id',
      } as any,
      lastError,
    },
  });
  render(
    <Provider store={store}>
      <StartScreen />
    </Provider>,
  );
  return store;
};

describe('StartScreen with Tokens Studio OAuth', () => {
  it('asks to sign in again when the sign-in has ended, and opens the Subscription tab', () => {
    const store = renderWithError({
      type: 'credential',
      header: 'Your Tokens Studio sign-in has ended',
      message: 'Sign in to Tokens Studio again to keep syncing this file.',
      code: SIGN_IN_REQUIRED,
    });

    expect(screen.getByText('Your Tokens Studio sign-in has ended')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /signInAgain|Sign in to Tokens Studio again/ }));

    expect(store.getState().uiState.activeTab).toBe(Tabs.SUBSCRIPTION);
    expect(store.getState().uiState.lastError).toBeNull();
  });

  it('offers the Subscription tab for other failures', () => {
    renderWithError({
      type: 'other',
      header: 'Could not load tokens',
      message: 'Plan limit reached',
    });

    expect(screen.getByRole('button', { name: /goToSubscription|Go to Subscription/ })).toBeInTheDocument();
  });

  it('shows no button for a project that syncs Figma variables', () => {
    renderWithError({
      type: 'other',
      header: 'Could not load tokens',
      message: 'This project syncs Figma variables, it cannot be pulled as tokens.',
      code: VARIABLES_SOURCE_OF_TRUTH,
    });

    expect(screen.getByText('This project syncs Figma variables, it cannot be pulled as tokens.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /goToSubscription|Go to Subscription|signInAgain|Sign in to Tokens Studio again/ })).not.toBeInTheDocument();
  });
});
