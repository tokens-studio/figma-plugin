import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, createMockStore } from '../../../../tests/config/setupTest';
import StartScreen from '../StartScreen';
import { StorageProviderType } from '@/constants/StorageProviderType';

// Mock the useRemoteTokens hook
const mockRestoreProviderWithAutoPull = jest.fn();
const mockRestoreStoredProvider = jest.fn();

jest.mock('@/app/store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    restoreStoredProvider: mockRestoreStoredProvider,
    restoreProviderWithAutoPull: mockRestoreProviderWithAutoPull,
  }),
}));

// Mock the analytics
jest.mock('@/utils/analytics', () => ({
  track: jest.fn(),
}));

describe('StartScreen Provider Selector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show provider selector when apiProviders exist and storage is local', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.LOCAL,
        },
        apiProviders: [
          {
            internalId: 'github-test',
            provider: StorageProviderType.GITHUB,
            name: 'Test GitHub Repo',
            id: 'user/repo',
            branch: 'main',
            filePath: 'tokens.json',
            secret: 'test-secret',
          },
          {
            internalId: 'gitlab-test',
            provider: StorageProviderType.GITLAB,
            name: 'Test GitLab Repo',
            id: 'user/repo',
            branch: 'main',
            filePath: 'tokens.json',
            secret: 'test-secret',
          },
        ],
        lastError: null,
      },
      tokenState: {
        themes: [],
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should show the provider selector section
    expect(screen.getByText('loadFromProvider')).toBeInTheDocument();
    expect(screen.getByText('selectProvider')).toBeInTheDocument();
    expect(screen.getByTestId('provider-selector')).toBeInTheDocument();
  });

  it('should not show provider selector when no apiProviders exist', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.LOCAL,
        },
        apiProviders: [],
        lastError: null,
      },
      tokenState: {
        themes: [],
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should not show the provider selector section
    expect(screen.queryByText('loadFromProvider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('provider-selector')).not.toBeInTheDocument();

    // Should still show the regular buttons
    expect(screen.getByText('newEmptyFile')).toBeInTheDocument();
    expect(screen.getByText('loadExample')).toBeInTheDocument();
  });

  it('should not show provider selector when storage type is not local', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          internalId: 'test-id',
        },
        apiProviders: [
          {
            internalId: 'github-test',
            provider: StorageProviderType.GITHUB,
            name: 'Test GitHub Repo',
            id: 'user/repo',
            branch: 'main',
            filePath: 'tokens.json',
            secret: 'test-secret',
          },
        ],
        lastError: null,
      },
      tokenState: {
        themes: [],
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should not show the provider selector section but show error callout instead
    expect(screen.queryByText('loadFromProvider')).not.toBeInTheDocument();
    expect(screen.queryByTestId('provider-selector')).not.toBeInTheDocument();
  });

  it('should render provider selector with correct options structure', () => {
    const store = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.LOCAL,
        },
        apiProviders: [
          {
            internalId: 'github-test',
            provider: StorageProviderType.GITHUB,
            name: 'Test GitHub Repo',
            id: 'user/repo',
            branch: 'main',
            filePath: 'tokens.json',
            secret: 'test-secret',
          },
          {
            internalId: 'gitlab-test',
            provider: StorageProviderType.GITLAB,
            name: 'Test GitLab Repo',
            id: 'user/repo',
            branch: 'main',
            filePath: 'tokens.json',
            secret: 'test-secret',
          },
        ],
        lastError: null,
      },
      tokenState: {
        themes: [],
      },
    });

    render(
      <Provider store={store}>
        <StartScreen />
      </Provider>,
    );

    // Should render the Select component with proper structure
    const selectTrigger = screen.getByTestId('provider-selector');
    expect(selectTrigger).toBeInTheDocument();

    // Should have the correct button structure for provider selection
    expect(screen.getByText('newEmptyFile')).toBeInTheDocument();
    expect(screen.getByText('loadExample')).toBeInTheDocument();
  });
});
