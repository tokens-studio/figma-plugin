import React from 'react';
import { Provider } from 'react-redux';
import {
  act, fireEvent, render, createMockStore,
} from '../../../tests/config/setupTest';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import BranchSelector from './BranchSelector';

const mockPullTokens = jest.fn();
const mockFetchBranches = jest.fn();
const mockSetStorageType = jest.fn();
const mockConfirm = jest.fn();
let mockHasChanges = false;

jest.mock('../store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({ pullTokens: mockPullTokens, fetchBranches: mockFetchBranches, getBranchLifecycle: () => ({ switchBranch: mockPullTokens }) }),
}));
jest.mock('@/app/store/useStorage', () => ({
  __esModule: true,
  default: () => ({ setStorageType: mockSetStorageType }),
}));
jest.mock('@/app/hooks/useConfirm', () => ({ __esModule: true, default: () => ({ confirm: mockConfirm }) }));
jest.mock('@/hooks/useChangedState', () => ({ useChangedState: () => ({ hasChanges: mockHasChanges }) }));
jest.mock('@/AsyncMessageChannel', () => ({ AsyncMessageChannel: { ReactInstance: { message: jest.fn() } } }));
jest.mock('./BranchSelectorPopover', () => ({
  BranchSelectorPopover: ({ onBranchSelected, onCreateBranchFromSelected, currentBranch }: {
    onBranchSelected: (branch: string) => void;
    onCreateBranchFromSelected: (branch: string) => void;
    currentBranch: string;
  }) => {
    const { useCallback } = jest.requireActual<typeof import('react')>('react');
    const switchBranch = useCallback(() => onBranchSelected('feature/next'), [onBranchSelected]);
    const createBranch = useCallback(() => onCreateBranchFromSelected('feature/next'), [onCreateBranchFromSelected]);
    return (
      <>
        <span>{currentBranch}</span>
        <button type="button" onClick={switchBranch}>Switch branch</button>
        <button type="button" onClick={createBranch}>Create from branch</button>
      </>
    );
  },
}));

const context = {
  provider: StorageProviderType.GITEA as const,
  internalId: 'provider-id',
  name: 'Gitea',
  id: 'owner/repo',
  secret: 'test-token',
  baseUrl: 'https://git.example.com',
  branch: 'main',
  filePath: 'tokens.json',
  commitSha: 'old-sha',
};

function setup() {
  const store = createMockStore({
    uiState: { api: context, localApiState: context, storageType: context },
    tokenState: { tokens: { unchanged: [] } },
    branchState: { branches: ['main', 'feature/next'] },
  });
  const clearTokens = jest.spyOn(store.dispatch.tokenState, 'setEmptyTokens');
  const result = render(<Provider store={store}><BranchSelector /></Provider>);
  return { store, result, clearTokens };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockHasChanges = false;
});

it.each([
  null,
  { status: 'failure', errorMessage: 'Cannot connect' },
])('retains tokens and branch configuration when the branch pull does not load tokens: %o', async (response) => {
  mockPullTokens.mockResolvedValue(response);
  const { store, result, clearTokens } = setup();
  await act(async () => { fireEvent.click(result.getByRole('button', { name: 'Switch branch' })); });
  expect(clearTokens).not.toHaveBeenCalled();
  expect(store.getState().tokenState.tokens).toEqual({ unchanged: [] });
  expect(store.getState().uiState.api).toEqual(context);
  expect(store.getState().uiState.localApiState).toEqual(context);
  expect(mockSetStorageType).not.toHaveBeenCalled();
  expect(AsyncMessageChannel.ReactInstance.message).not.toHaveBeenCalled();
  expect(result.getByText('main')).toBeInTheDocument();
});

it('carries the pulled revision into persisted credentials instead of restoring the old branch revision', async () => {
  mockPullTokens.mockResolvedValue({
    status: 'success', tokens: { next: [] }, themes: [], commitSha: 'next-sha', defaultBranch: 'trunk',
  });
  const { store, result, clearTokens } = setup();
  await act(async () => { fireEvent.click(result.getByRole('button', { name: 'Switch branch' })); });
  const expected = {
    ...context, branch: 'feature/next', commitSha: 'next-sha', defaultBranch: 'trunk',
  };
  expect(clearTokens).not.toHaveBeenCalled();
  expect(store.getState().uiState.api).toEqual(expected);
  expect(store.getState().uiState.localApiState).toEqual(expected);
  expect(mockSetStorageType).toHaveBeenCalledWith({ provider: expected, shouldSetInDocument: true });
  expect(AsyncMessageChannel.ReactInstance.message).toHaveBeenCalledWith({ type: AsyncMessageTypes.CREDENTIALS, credential: expected });
});
