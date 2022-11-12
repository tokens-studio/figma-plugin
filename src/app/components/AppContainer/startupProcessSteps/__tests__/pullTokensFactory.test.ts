import { StorageProviderType } from '@/constants/StorageProviderType';
import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { TokenTypes } from '@/constants/TokenTypes';
import { pullTokensFactory } from '../pullTokensFactory';
import type useConfirm from '@/app/hooks/useConfirm';
import type useRemoteTokens from '@/app/store/remoteTokens';
import { Tabs } from '@/constants/Tabs';
import type { StorageType } from '@/types/StorageType';

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
            },
          ],
        },
      },
    } as unknown as StartupMessage;

    const fn = pullTokensFactory(
      mockStore,
      mockStore.dispatch,
      {},
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
      {},
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
      {},
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
      {},
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);
    mockPullTokens.mockResolvedValueOnce({
      tokens: {
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
      {},
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

  it('should verify the API credentials without pulling if there are local changes', async () => {
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
      {},
      mockParams,
      mockUseConfirm,
      mockUseRemoteTokens,
    );

    mockFetchBranches.mockResolvedValueOnce(['main']);

    await fn();
    const state = mockStore.getState();
    expect(mockUseRemoteTokens.pullTokens).not.toBeCalled();
    expect(state.branchState.branches).toEqual(['main']);
    expect(state.tokenState.tokens).toEqual(mockParams.localTokenData?.values);
    expect(state.uiState.activeTab).toEqual(Tabs.TOKENS);
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
      {},
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
      {},
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
});
