import React from 'react';
import { Provider } from 'react-redux';
import {
  render, fireEvent, waitFor, createMockStore,
} from '../../../tests/config/setupTest';
import BranchSelector from './BranchSelector';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useRemoteTokens from '../store/remoteTokens';

jest.mock('../store/remoteTokens', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../hooks/useIsProUser', () => ({
  __esModule: true,
  useIsProUser: () => true,
}));

const mockPullTokens = jest.fn();
const mockFetchBranches = jest.fn();

describe('BranchSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRemoteTokens as jest.Mock).mockReturnValue({
      pullTokens: mockPullTokens,
      fetchBranches: mockFetchBranches,
    });
    mockFetchBranches.mockResolvedValue(['main', 'truncation-test']);
  });

  // Regression test for: plugin realtime sync writing to `main` while a
  // different branch was selected. The Tokens Studio backend identifies a
  // branch by changeSetId, so switching branches must refresh changeSetId in
  // uiState.api/localApiState, not just the `branch` name.
  it('updates changeSetId in uiState.api when switching to a Tokens Studio OAuth branch', async () => {
    mockPullTokens.mockResolvedValue({
      status: 'success',
      tokens: {},
      themes: [],
      metadata: { changeSetId: 'truncation-test-change-set-id' },
    });

    const mockStore = createMockStore({
      uiState: {
        api: {
          provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
          id: 'project-1',
          branch: 'main',
          changeSetId: 'main-change-set-id',
        } as any,
        localApiState: {
          provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
          id: 'project-1',
          branch: 'main',
          changeSetId: 'main-change-set-id',
        } as any,
      },
      branchState: {
        branches: ['main', 'truncation-test'],
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <BranchSelector />
      </Provider>,
    );

    fireEvent.click(result.getByTestId('branch-selector-menu-trigger'));

    const branchItem = await result.findByTestId('popover-item-truncation-test');
    fireEvent.click(branchItem);

    await waitFor(() => {
      expect(mockStore.getState().uiState.api.branch).toBe('truncation-test');
    });

    expect(mockStore.getState().uiState.api.changeSetId).toBe('truncation-test-change-set-id');
    expect(mockStore.getState().uiState.localApiState.changeSetId).toBe('truncation-test-change-set-id');

    result.unmount();
  });
});
