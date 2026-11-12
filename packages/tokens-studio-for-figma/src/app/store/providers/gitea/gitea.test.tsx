import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import { GiteaTokenStorage } from '@/storage/GiteaTokenStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { clientFactory, GiteaCredentials, useGitea } from './gitea';

let mockIsProUser = false;
const mockStorage = {
  changePath: jest.fn(),
  selectBranch: jest.fn(),
  enableMultiFile: jest.fn(),
  save: jest.fn(),
  retrieve: jest.fn(),
  fetchBranches: jest.fn(),
  canWrite: jest.fn(),
  getLatestCommitDate: jest.fn(),
  lastCommitSha: 'new-sha',
  defaultBranch: 'trunk',
};
const mockPushDialog = jest.fn();
const mockClose = jest.fn();
const mockConfirm = jest.fn();
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@/storage/GiteaTokenStorage', () => ({ GiteaTokenStorage: jest.fn().mockImplementation(() => mockStorage) }));
jest.mock('@/app/hooks/usePushDialog', () => ({ __esModule: true, default: () => ({ pushDialog: mockPushDialog, closePushDialog: mockClose }) }));
jest.mock('@/app/hooks/useConfirm', () => ({ __esModule: true, default: () => ({ confirm: mockConfirm }) }));
jest.mock('@/app/hooks/useIsProUser', () => ({ useIsProUser: () => mockIsProUser }));

const context: GiteaCredentials = {
  provider: StorageProviderType.GITEA, name: 'Gitea', id: 'owner/repo', baseUrl: 'https://git.example.com/gitea', secret: 'test-token', filePath: 'tokens.json', branch: 'main', commitSha: 'old-sha',
};
const dispatch = {
  uiState: { setLocalApiState: jest.fn(), setApiData: jest.fn() },
  tokenState: {
    setTokenData: jest.fn(), setRemoteData: jest.fn(), setLastSyncedState: jest.fn(), setEditProhibited: jest.fn(), setCollapsedTokenSets: jest.fn(),
  },
  branchState: { setBranches: jest.fn() },
};
beforeEach(() => {
  jest.clearAllMocks();
  mockIsProUser = false;
  (useDispatch as jest.Mock).mockReturnValue(dispatch);
  const values = [{ global: [] }, [], context, {}, {}, false, context];
  (useSelector as jest.Mock).mockImplementation(() => values.shift());
  mockStorage.fetchBranches.mockResolvedValue(['main']);
  mockStorage.canWrite.mockResolvedValue(true);
  mockStorage.getLatestCommitDate.mockResolvedValue(null);
  mockPushDialog.mockResolvedValue({ commitMessage: 'save', customBranch: '' });
});

it('passes repository identity and revision to storage and respects Pro gating', async () => {
  await clientFactory(context, false);
  expect(GiteaTokenStorage).toHaveBeenCalledWith('test-token', 'owner', 'repo', context.baseUrl, 'old-sha', undefined);
  expect(mockStorage.changePath).toHaveBeenCalledWith('tokens.json');
  expect(mockStorage.enableMultiFile).not.toHaveBeenCalled();
  await clientFactory(context, true);
  expect(mockStorage.enableMultiFile).toHaveBeenCalled();
});
it('rejects invalid repository identifiers before constructing a client', async () => {
  await expect(clientFactory({ ...context, id: 'owner/repo/extra' }, false)).rejects.toThrow();
  expect(GiteaTokenStorage).not.toHaveBeenCalled();
});
it('does not mark a false save as synced', async () => {
  mockStorage.save.mockResolvedValue(false);
  const { result } = renderHook(() => useGitea());
  let response;
  await act(async () => { response = await result.current.pushTokensToGitea(context); });
  expect(response).toMatchObject({ status: 'failure' });
  expect(dispatch.tokenState.setRemoteData).not.toHaveBeenCalled();
  expect(dispatch.tokenState.setLastSyncedState).not.toHaveBeenCalled();
  expect(mockClose).toHaveBeenCalled();
});
it('records the confirmed revision and retains the selected branch after a successful push', async () => {
  mockStorage.save.mockResolvedValue(true);
  const { result } = renderHook(() => useGitea());
  await act(async () => { await result.current.pushTokensToGitea(context); });
  expect(dispatch.uiState.setApiData).toHaveBeenCalledWith(expect.objectContaining({ branch: 'main', commitSha: 'new-sha' }));
  expect(dispatch.tokenState.setLastSyncedState).toHaveBeenCalled();
});
it('keeps local state when connection pull is declined', async () => {
  mockStorage.retrieve.mockResolvedValue({ status: 'success', tokens: { different: [] }, themes: [] });
  mockConfirm.mockResolvedValue(false);
  const { result } = renderHook(() => useGitea());
  let response;
  await act(async () => { response = await result.current.syncTokensWithGitea(context); });
  expect(response).toMatchObject({ status: 'failure' });
  expect(dispatch.tokenState.setTokenData).not.toHaveBeenCalled();
  expect(dispatch.tokenState.setLastSyncedState).not.toHaveBeenCalled();
  expect(dispatch.uiState.setApiData).not.toHaveBeenCalled();
});

it('restores the prior dialog context when an empty-path restore push is cancelled', async () => {
  mockPushDialog.mockResolvedValueOnce(null);
  const { result } = renderHook(() => useGitea());
  let response;
  await act(async () => { response = await result.current.pushTokensToGitea({ ...context, id: 'other/repo' }); });
  expect(response).toMatchObject({ status: 'failure' });
  expect(mockStorage.save).not.toHaveBeenCalled();
  expect(dispatch.uiState.setLocalApiState).toHaveBeenLastCalledWith(context);
  expect(dispatch.uiState.setApiData).not.toHaveBeenCalled();
});

it('does not refresh write access from an uncommitted Pro dialog draft', async () => {
  mockIsProUser = true;
  const values = [{ global: [] }, [], context, {}, {}, false, { provider: StorageProviderType.LOCAL }];
  (useSelector as jest.Mock).mockImplementation(() => values.shift());
  renderHook(() => useGitea());
  await act(async () => {});
  expect(mockStorage.canWrite).not.toHaveBeenCalled();
  expect(dispatch.tokenState.setEditProhibited).not.toHaveBeenCalled();
});
it('ignores a license access response after the committed provider effect is disposed', async () => {
  mockIsProUser = true;
  let resolveAccess: (canWrite: boolean) => void = () => {};
  mockStorage.canWrite.mockReturnValueOnce(new Promise<boolean>((resolve) => { resolveAccess = resolve; }));
  const { unmount } = renderHook(() => useGitea());
  await act(async () => {});
  unmount();
  await act(async () => { resolveAccess(false); });
  expect(dispatch.tokenState.setEditProhibited).not.toHaveBeenCalled();
});

it.each([undefined, 'stale/source'])('uses the current non-default branch as the source for a custom push branch (previous source: %s)', async (previousSourceBranch) => {
  const sourceContext = {
    ...context, branch: 'feature/source', previousSourceBranch, commitSha: 'source-sha',
  };
  mockPushDialog.mockResolvedValueOnce({ commitMessage: 'save', customBranch: 'feature/new' });
  mockStorage.save.mockResolvedValue(true);
  const { result } = renderHook(() => useGitea());
  await act(async () => { await result.current.pushTokensToGitea(sourceContext); });
  expect(GiteaTokenStorage).toHaveBeenCalledWith(sourceContext.secret, 'owner', 'repo', sourceContext.baseUrl, 'source-sha', 'feature/source');
  expect(mockStorage.selectBranch).toHaveBeenLastCalledWith('feature/new');
  expect(dispatch.uiState.setApiData).toHaveBeenCalledWith(expect.objectContaining({ branch: 'feature/new', commitSha: 'new-sha' }));
});

it('preserves an explicit source when pushing without a custom dialog branch', async () => {
  const newBranchContext = { ...context, branch: 'feature/new', previousSourceBranch: 'feature/source' };
  mockStorage.save.mockResolvedValue(true);
  const { result } = renderHook(() => useGitea());
  await act(async () => { await result.current.pushTokensToGitea(newBranchContext); });
  expect(GiteaTokenStorage).toHaveBeenCalledWith(context.secret, 'owner', 'repo', context.baseUrl, context.commitSha, 'feature/source');
});
