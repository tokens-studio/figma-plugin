import { StorageProviderType } from '@/constants/StorageProviderType';
import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { TokenTypes } from '@/constants/TokenTypes';
import { pullTokensFactory } from '../pullTokensFactory';
import type useConfirm from '@/app/hooks/useConfirm';
import type useRemoteTokens from '@/app/store/remoteTokens';

describe('pullTokensFactory', () => {
  const mockConfirm = jest.fn();
  const mockFetchBranches = jest.fn();
  const mockPullTokens = jest.fn();

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
    expect(state.tokenState.tokens).toEqual(mockParams.localTokenData?.values);
  });
});
