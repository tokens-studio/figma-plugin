import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, createMockStore } from '../../../../tests/config/setupTest';
import StartScreen from '../StartScreen';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { ErrorMessages } from '@/constants/ErrorMessages';

// Mock the useRemoteTokens hook
jest.mock('@/app/store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    restoreStoredProvider: jest.fn(),
  }),
}));

describe('StartScreen Error Handling', () => {
  it('should show parsing error message when lastError type is parsing', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          id: 'test-repo',
          name: 'Test Repo',
          branch: 'main',
          filePath: 'tokens.json',
          internalId: 'test-internal-id',
        },
        lastError: {
          type: 'parsing',
          message: `${ErrorMessages.JSON_PARSE_ERROR}: Unexpected token } in JSON at position 10`,
        },
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should show the specific parsing error message
    expect(screen.getByText(/Failed to parse token file/)).toBeInTheDocument();
    expect(screen.getByText(/Unexpected token } in JSON at position 10/)).toBeInTheDocument();
  });

  it('should show credential error message when lastError type is credential', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          id: 'test-repo',
          name: 'Test Repo',
          branch: 'main',
          filePath: 'tokens.json',
          internalId: 'test-internal-id',
        },
        lastError: {
          type: 'credential',
          message: 'Could not load tokens from GitHub. Please check your credentials.',
          header: 'Could not load tokens from GitHub',
        },
        apiProviders: [
          {
            internalId: 'test-internal-id',
            provider: StorageProviderType.GITHUB,
            name: 'Test Repo',
            id: 'test-repo',
            branch: 'main',
            filePath: 'tokens.json',
            secret: 'test-secret',
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should show the centralized credential error message
    expect(screen.getByText(/Could not load tokens from GitHub. Please check your credentials./)).toBeInTheDocument();
  });

  it('should show connectivity error message when lastError type is connectivity', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          id: 'test-repo',
          name: 'Test Repo',
          branch: 'main',
          filePath: 'tokens.json',
          internalId: 'test-internal-id',
        },
        lastError: {
          type: 'connectivity',
          message: 'Unable to connect to GitHub. Please check your internet connection or try again later.',
          header: 'Could not load tokens from GitHub',
        },
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should show the centralized connectivity error message
    expect(screen.getByText(/Unable to connect to GitHub. Please check your internet connection or try again later./)).toBeInTheDocument();
  });

  it('should show specific error message when lastError type is other', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          id: 'test-repo',
          name: 'Test Repo',
          branch: 'main',
          filePath: 'tokens.json',
          internalId: 'test-internal-id',
        },
        lastError: {
          type: 'other',
          message: 'Unknown error occurred',
        },
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should show the specific error message
    expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
  });

  it('should show default error message when no lastError is set', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          id: 'test-repo',
          name: 'Test Repo',
          branch: 'main',
          filePath: 'tokens.json',
          internalId: 'test-internal-id',
        },
        lastError: null,
        apiProviders: [], // No matching provider
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should show the default error message
    expect(screen.getByText(/unableToFetchRemoteNoCredentials/)).toBeInTheDocument();
  });
});
