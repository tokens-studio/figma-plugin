import { StorageProviderType } from '@/constants/StorageProviderType';
import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { TokenTypes } from '@/constants/TokenTypes';
import { pullTokensFactory } from '../pullTokensFactory';
import type useConfirm from '@/app/hooks/useConfirm';
import type useRemoteTokens from '@/app/store/remoteTokens';
import { Tabs } from '@/constants/Tabs';
import type { StorageType } from '@/types/StorageType';
import { categorizeError } from '@/utils/error/categorizeError';
import { ErrorMessages } from '@/constants/ErrorMessages';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('@/profiling/transaction', () => ({
  wrapTransaction: jest.fn((opts, fn) => fn()),
  spanTransaction: jest.fn((opts, fn) => fn()),
}));

jest.mock('@/utils/error/categorizeError');

const mockCategorizeError = categorizeError as jest.MockedFunction<typeof categorizeError>;

mockCategorizeError.mockReturnValue({
  type: 'other',
  message: 'An error occurred',
});

describe('pullTokensFactory', () => {
  const mockConfirm = jest.fn();
  const mockFetchBranches = jest.fn();
  const mockPullTokens = jest.fn();

  const mockStorageType: StorageType = {
    id: 'github',
    internalId: 'github',
    name: 'Github',
    provider: StorageProviderType.GITHUB,
    branch: 'main',
    filePath: 'data/tokens.json',
  };

  const mockUseConfirm = {
    confirm: mockConfirm,
  } as unknown as ReturnType<typeof useConfirm>;

  const mockUseRemoteTokens = {
    fetchBranches: mockFetchBranches,
    pullTokens: mockPullTokens,
  } as unknown as ReturnType<typeof useRemoteTokens>;

  it('should set local tokens when using LOCAL type', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.LOCAL,
        },
      },
    });

    const mockParams = {
      localTokenData: {
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.red',
              value: '#ff0000',
              $extensions: {
                'studio.tokens': {
                  id: 'mock-uuid',
                },
              },
            },
          ],
        },
      },
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    await fn();
    const state = mockStore.getState();
    expect(mockUseRemoteTokens.pullTokens).not.toBeCalled();
    expect(state.tokenState.tokens).toEqual(mockParams.localTokenData?.values);
    expect(state.uiState.activeTab).toEqual(Tabs.TOKENS);
  });

  it('should show the start tab if there are no local tokens', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.LOCAL,
        },
      },
    });

    const mockParams = {
      localTokenData: {
        values: {
        },
      },
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    await fn();
    const state = mockStore.getState();
    expect(mockUseRemoteTokens.pullTokens).not.toBeCalled();
    expect(state.uiState.activeTab).toEqual(Tabs.START);
  });

  it('should pull remote tokens', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: mockStorageType,
      },
    });

    const mockParams = {
      localTokenData: {
        checkForChanges: false,
        values: {
        },
      },
      localApiProviders: [
        { ...mockStorageType, secret: 'secret' },
      ],
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);
    mockPullTokens.mockResolvedValueOnce({
      tokens: {
        global: [
          {
            type: TokenTypes.COLOR,
            name: 'colors.red',
            value: '#ff0000',
          },
        ],
      },
      themes: [],
      metadata: {},
    });

    await fn();
    const state = mockStore.getState();
    expect(state.branchState.branches).toEqual(['main']);
    expect(state.uiState.api).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(state.uiState.localApiState).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(mockPullTokens).toBeCalledTimes(1);
    expect(state.uiState.activeTab).toEqual(Tabs.TOKENS);
  });

  it('should pull remote tokens and go to Tokens tab if there are no tokens in the remote storage', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: mockStorageType,
      },
    });

    const mockParams = {
      localTokenData: {
        checkForChanges: false,
        values: {
        },
      },
      localApiProviders: [
        { ...mockStorageType, secret: 'secret' },
      ],
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);
    mockPullTokens.mockResolvedValueOnce({
      tokens: {
        global: [
          {
            value: '12px',
            type: 'spacing',
            description: 'first spacing here',
            name: '1-spacing-token',
          },
          {
            value: '#ff00ff',
            type: 'color',
            name: '1-color-token',
          },
          {
            value: '12px',
            type: 'fontSizes',
            name: '1-font-size-token',
          },
        ],
      },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    });

    await fn();
    const state = mockStore.getState();
    expect(state.branchState.branches).toEqual(['main']);
    expect(state.uiState.api).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(state.uiState.localApiState).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(mockPullTokens).toBeCalledTimes(1);
    expect(state.uiState.activeTab).toEqual(Tabs.TOKENS);
  });

  it('should go to Start if the file on the remote cannot be read', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: mockStorageType,
      },
    });

    const mockParams = {
      localTokenData: {
        checkForChanges: false,
        values: {
        },
      },
      localApiProviders: [
        { ...mockStorageType, secret: 'secret' },
      ],
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);
    mockPullTokens.mockResolvedValueOnce(null);

    await fn();
    const state = mockStore.getState();
    expect(state.branchState.branches).toEqual(['main']);
    expect(state.uiState.api).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(state.uiState.localApiState).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(mockPullTokens).toBeCalledTimes(1);
    expect(state.uiState.activeTab).toEqual(Tabs.START);
  });

  it('should verify the API credentials and pull even if there are local changes', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: mockStorageType,
      },
    });

    const mockParams = {
      localTokenData: {
        checkForChanges: true,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.red',
              value: '#ff0000',
              $extensions: {
                'studio.tokens': {
                  id: 'mock-uuid',
                },
              },
            },
          ],
        },
      },
      localApiProviders: [
        { ...mockStorageType, secret: 'secret' },
      ],
    } as unknown as StartupMessage;

    mockConfirm.mockResolvedValueOnce(true);

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);

    await fn();
    const state = mockStore.getState();
    expect(mockUseRemoteTokens.pullTokens).toBeCalledTimes(1);
    expect(state.branchState.branches).toEqual(['main']);
    expect(state.tokenState.tokens).toEqual(mockParams.localTokenData?.values);
    expect(state.uiState.activeTab).toEqual(Tabs.TOKENS);
    expect(state.tokenState.remoteData).toEqual({ metadata: null, themes: [], tokens: {} });
  });

  it('should go to start tab if the localTokenData is missing somehow', async () => {
    const mockStore = createMockStore({
      uiState: {
      },
    });

    const mockParams = {
      localTokenData: null,
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    await fn();
    const state = mockStore.getState();
    expect(mockUseRemoteTokens.pullTokens).not.toBeCalled();
    expect(state.uiState.activeTab).toEqual(Tabs.START);
  });

  it('should be able to handle errors when pulling tokens', async () => {
    const mockStore = createMockStore({
      uiState: {
        storageType: mockStorageType,
      },
    });

    const mockParams = {
      localTokenData: {
        checkForChanges: false,
        values: {},
      },
      localApiProviders: [
        { ...mockStorageType, secret: 'secret' },
      ],
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);
    mockPullTokens.mockRejectedValueOnce(new Error('error'));

    await fn();
    const state = mockStore.getState();
    expect(state.branchState.branches).toEqual(['main']);
    expect(state.uiState.api).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(state.uiState.localApiState).toEqual({ ...mockStorageType, secret: 'secret' });
    expect(mockPullTokens).toBeCalledTimes(1);
    expect(state.uiState.activeTab).toEqual(Tabs.START);
  });

  it('should categorize JSON parsing errors correctly', () => {
    const jsonError = new SyntaxError('Unexpected token } in JSON at position 10');

    mockCategorizeError.mockReturnValue({
      type: 'parsing',
      message: `${ErrorMessages.JSON_PARSE_ERROR}: Unexpected token } in JSON at position 10`,
    });

    const result = categorizeError(jsonError);

    expect(result.type).toBe('parsing');
    expect(result.message).toContain(ErrorMessages.JSON_PARSE_ERROR);
    expect(result.message).toContain('Unexpected token } in JSON at position 10');
  });

  it('should categorize credential errors correctly', () => {
    const credentialError = new Error('401 Unauthorized');

    mockCategorizeError.mockReturnValue({
      type: 'credential',
      message: '401 Unauthorized',
    });

    const result = categorizeError(credentialError);

    expect(result.type).toBe('credential');
    expect(result.message).toBe('401 Unauthorized');
  });

  it('should categorize other errors correctly', () => {
    const networkError = new Error('Network request failed');

    mockCategorizeError.mockReturnValue({
      type: 'other',
      message: 'Network request failed',
    });

    const result = categorizeError(networkError);

    expect(result.type).toBe('other');
    expect(result.message).toBe('Network request failed');
  });
});
