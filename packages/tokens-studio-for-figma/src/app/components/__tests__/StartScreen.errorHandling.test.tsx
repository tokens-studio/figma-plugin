import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from '@/app/store';
import StartScreen from '../StartScreen';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { ErrorMessages } from '@/constants/ErrorMessages';

// Mock the track function
jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

// Mock the useRemoteTokens hook
jest.mock('@/app/store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    restoreStoredProvider: jest.fn(),
  }),
}));

describe('StartScreen Error Handling', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should show parsing error message when lastError type is parsing', () => {
    // Set up state with parsing error
    store.dispatch.uiState.setStorageType({
      provider: StorageProviderType.GITHUB,
      id: 'test-repo',
      name: 'Test Repo',
      branch: 'main',
    });
    
    store.dispatch.uiState.setLastError({
      type: 'parsing',
      message: `${ErrorMessages.JSON_PARSE_ERROR}: Unexpected token } in JSON at position 10`,
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>
    );

    // Should show the specific parsing error message
    expect(screen.getByText(/Failed to parse token file/)).toBeInTheDocument();
    expect(screen.getByText(/Unexpected token } in JSON at position 10/)).toBeInTheDocument();
  });

  it('should show credential error message when lastError type is credential', () => {
    // Set up state with credential error
    store.dispatch.uiState.setStorageType({
      provider: StorageProviderType.GITHUB,
      id: 'test-repo',
      name: 'Test Repo',
      branch: 'main',
    });
    
    store.dispatch.uiState.setLastError({
      type: 'credential',
      message: '401 Unauthorized',
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>
    );

    // Should show the default credential error message, not the specific 401 message
    expect(screen.getByText(/Unable to fetch tokens from remote storage/)).toBeInTheDocument();
    expect(screen.getByText(/incorrect credentials/)).toBeInTheDocument();
  });

  it('should show specific error message when lastError type is other', () => {
    // Set up state with other error
    store.dispatch.uiState.setStorageType({
      provider: StorageProviderType.GITHUB,
      id: 'test-repo',
      name: 'Test Repo',
      branch: 'main',
    });
    
    store.dispatch.uiState.setLastError({
      type: 'other',
      message: 'Network request failed',
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>
    );

    // Should show the specific error message
    expect(screen.getByText('Network request failed')).toBeInTheDocument();
  });

  it('should show default error message when no lastError is set', () => {
    // Set up state without error
    store.dispatch.uiState.setStorageType({
      provider: StorageProviderType.GITHUB,
      id: 'test-repo',
      name: 'Test Repo',
      branch: 'main',
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>
    );

    // Should show the default error message
    expect(screen.getByText(/Unable to fetch tokens from remote storage/)).toBeInTheDocument();
  });
});
