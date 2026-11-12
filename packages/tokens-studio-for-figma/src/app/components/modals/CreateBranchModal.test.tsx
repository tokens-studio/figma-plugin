import React from 'react';
import { Provider } from 'react-redux';
import {
  render, screen, fireEvent, waitFor, createMockStore,
} from '../../../../tests/config/setupTest';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { TokenTypes } from '@/constants/TokenTypes';
import type { RemoteResponseData } from '@/types/RemoteResponseData';
import CreateBranchModal from './CreateBranchModal';

const mockAddNewBranch = jest.fn();
const mockFetchBranches = jest.fn();
const mockPullTokens = jest.fn();
const mockPushTokens = jest.fn();
jest.mock('@/app/store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    addNewBranch: mockAddNewBranch,
    fetchBranches: mockFetchBranches,
    pullTokens: mockPullTokens,
    getBranchLifecycle: (context: unknown) => jest.requireActual('@/app/store/providers/gitea/branchLifecycle').createGiteaBranchLifecycle(context, {
      pull: mockPullTokens, push: mockPushTokens, create: mockAddNewBranch, branches: mockFetchBranches,
    }),
    pushTokens: mockPushTokens,
  }),
}));
jest.mock('../Modal', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren<unknown>) => <div>{children}</div>,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue: string; message?: string }) => (
      options?.defaultValue?.replace('{{message}}', options.message ?? '') ?? key
    ),
  }),
}));

const context = {
  provider: StorageProviderType.GITEA,
  id: 'owner/repo',
  name: 'Gitea',
  internalId: 'gitea-id',
  baseUrl: 'https://git.example.com/gitea',
  secret: 'test-token',
  branch: 'main',
  filePath: 'tokens.json',
  commitSha: 'old-branch-sha',
};
const tokens = { local: [{ name: 'red', type: TokenTypes.COLOR, value: '#ff0000' }] };
const success: Extract<RemoteResponseData, { status: 'success' }> = {
  status: 'success', tokens: { remote: [] }, themes: [], branch: 'new-branch', commitSha: 'new-branch-sha',
};

function setup(isCurrentChanges = false) {
  const store = createMockStore({ uiState: { api: context, localApiState: context }, tokenState: { tokens } });
  const onSuccess = jest.fn();
  const onClose = jest.fn();
  render(<Provider store={store}><CreateBranchModal isOpen startBranch="main" isCurrentChanges={isCurrentChanges} onClose={onClose} onSuccess={onSuccess} /></Provider>);
  fireEvent.change(screen.getByPlaceholderText('branch'), { target: { value: 'new-branch' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create branch' }));
  return { store, onSuccess, onClose };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAddNewBranch.mockResolvedValue(true);
  mockFetchBranches.mockResolvedValue(['main', 'new-branch']);
  mockPullTokens.mockResolvedValue(success);
  mockPushTokens.mockResolvedValue(success);
});

it('does not push or select the Gitea branch when creation fails', async () => {
  mockAddNewBranch.mockResolvedValue(false);
  const { store, onSuccess } = setup(true);
  await waitFor(() => expect(screen.getByTestId('provider-modal-error')).toBeInTheDocument());
  expect(mockPushTokens).not.toHaveBeenCalled();
  expect(onSuccess).not.toHaveBeenCalled();
  expect(store.getState().tokenState.tokens).toEqual(tokens);
  expect(store.getState().uiState.api).toEqual(context);
});

it('keeps local tokens when the new Gitea branch pull fails', async () => {
  mockPullTokens.mockResolvedValue({ status: 'failure', errorMessage: 'Cannot connect to Gitea' });
  const { store, onSuccess } = setup();
  await waitFor(() => expect(screen.getByTestId('provider-modal-error')).toHaveTextContent('Cannot connect to Gitea'));
  expect(onSuccess).not.toHaveBeenCalled();
  expect(store.getState().tokenState.tokens).toEqual(tokens);
  expect(store.getState().uiState.api).toEqual(context);
});

it('uses the existing source revision when pushing current changes to a new Gitea branch', async () => {
  const { onSuccess } = setup(true);
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('new-branch', ['main', 'new-branch'], success));
  expect(mockPushTokens).toHaveBeenCalledWith({ ...context, branch: 'new-branch' }, { branch: 'new-branch', commitMessage: '' });
  expect(mockPullTokens).not.toHaveBeenCalled();
});

it('passes the confirmed Gitea revision to branch selection after a successful pull', async () => {
  const { onSuccess } = setup();
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('new-branch', ['main', 'new-branch'], success));
});

it('preserves the Gitea configuration and tokens when the branch operation throws', async () => {
  mockAddNewBranch.mockRejectedValue(new Error('Check the Gitea URL, network and CORS settings'));
  const { store, onSuccess } = setup(true);
  await waitFor(() => expect(screen.getByTestId('provider-modal-error')).toHaveTextContent('CORS settings'));
  expect(onSuccess).not.toHaveBeenCalled();
  expect(mockPushTokens).not.toHaveBeenCalled();
  expect(store.getState().tokenState.tokens).toEqual(tokens);
  expect(store.getState().uiState.api).toEqual(context);
});
