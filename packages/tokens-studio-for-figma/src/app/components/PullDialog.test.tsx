import React from 'react';
import { Provider } from 'react-redux';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { render, screen, createMockStore } from '../../../tests/config/setupTest';
import PullDialog from './PullDialog';

describe('PullDialog', () => {
  it('should render initial state with pull confirmation', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: 'initial',
        storageType: {
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(screen.getByText('pullFrom')).toBeInTheDocument();
    expect(screen.getByText('override')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('pullTokens')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: 'loading',
        storageType: {
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(screen.getByText('pullFrom')).toBeInTheDocument();
  });

  it('should render error state with error message', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: 'error',
        storageType: {
          provider: StorageProviderType.GITHUB,
        },
        lastError: {
          type: 'connectivity',
          message: 'Unable to connect to GitHub. Please check your internet connection.',
          header: 'Could not load tokens from GitHub',
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(screen.getByText('couldNotLoadTokens')).toBeInTheDocument();
    expect(screen.getByText('Could not load tokens from GitHub')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to GitHub. Please check your internet connection.')).toBeInTheDocument();
  });

  it('should render error state with credential error', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: 'error',
        storageType: {
          provider: StorageProviderType.GITLAB,
        },
        lastError: {
          type: 'credential',
          message: 'Invalid credentials provided',
          header: 'Authentication failed',
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(screen.getByText('couldNotLoadTokens')).toBeInTheDocument();
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials provided')).toBeInTheDocument();
  });

  it('should render error state without lastError', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: 'error',
        storageType: {
          provider: StorageProviderType.BITBUCKET,
        },
        lastError: null,
      },
    });

    render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(screen.getByText('couldNotLoadTokens')).toBeInTheDocument();
  });

  it('should return null for undefined mode', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: undefined,
        storageType: {
          provider: StorageProviderType.GITHUB,
        },
      },
    });

    const { container } = render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render error state with parsing error', () => {
    const mockStore = createMockStore({
      uiState: {
        showPullDialog: 'error',
        storageType: {
          provider: StorageProviderType.GITHUB,
        },
        lastError: {
          type: 'parsing',
          message: 'Unexpected token } in JSON at position 10',
          header: 'Failed to parse token file',
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <PullDialog />
      </Provider>,
    );

    expect(screen.getByText('couldNotLoadTokens')).toBeInTheDocument();
    expect(screen.getByText('Failed to parse token file')).toBeInTheDocument();
    expect(screen.getByText('Unexpected token } in JSON at position 10')).toBeInTheDocument();
  });
});
