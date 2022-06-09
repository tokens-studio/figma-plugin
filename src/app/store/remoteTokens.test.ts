import { renderHook } from '@testing-library/react-hooks';
import useRemoteTokens from './remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';

const mockSelector = jest.fn().mockImplementation(() => ({}));
const mockStartJob = jest.fn();
const mockRetrieve = jest.fn();
const mockCanWrite = jest.fn();
const mockChangePath = jest.fn();
const mockSelectBrach = jest.fn();
const mockEnableMultiFile = jest.fn();
const mockSetLastSyncedState = jest.fn();
const mockSetTokenData = jest.fn();
const mockSetEditProhibited = jest.fn();
const mockCompleteJob = jest.fn();
const mockAssignProjectId = jest.fn();
const mockSetProjectURL = jest.fn();
mockRetrieve.mockImplementation(() => (
  Promise.resolve(
    {
      metadata: {
        commitMessage: 'Initial commit',
      },
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
    },
  )
));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockImplementation(() => ({
    uiState: {
      startJob: mockStartJob,
      completeJob: mockCompleteJob,
      setProjectURL: mockSetProjectURL,
    },
    tokenState: {
      setLastSyncedState: mockSetLastSyncedState,
      setTokenData: mockSetTokenData,
      setEditProhibited: mockSetEditProhibited,
    },
  })),
  useSelector: () => mockSelector(),
}));
jest.mock('@/storage/GithubTokenStorage', () => ({
  GithubTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
    }
  )),
}));
jest.mock('@/storage/GitlabTokenStorage', () => ({
  GitlabTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      assignProjectId: mockAssignProjectId,
    }
  )),
}));
jest.mock('@/storage', () => ({
  JSONBinTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  )),
}));

const gitHubContext = {
  branch: 'main',
  filePath: 'data/tokens.json',
  id: 'six7/figma-tokens',
  provider: 'github',
  secret: 'github',
};
const gitLabContext = {
  branch: 'main',
  filePath: 'data/tokens.json',
  id: 'six7/figma-tokens',
  provider: 'gitlab',
  secret: 'gitlab',
};
const jsonbinContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'jsonbin',
  secret: 'jsonbin',
};
const adoContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'ado',
  secret: 'ado',
};

describe('remoteTokens', () => {
  let { result } = renderHook(() => useRemoteTokens());
  beforeEach(() => {
    result = renderHook(() => useRemoteTokens()).result;
  });

  it('pull tokens from GitHub', async () => {
    expect(await result.current.pullTokens({ context: gitHubContext as StorageTypeCredentials })).toEqual({
      metadata: {
        commitMessage: 'Initial commit',
      },
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
    });
  });

  it('pull tokens from GitLab', async () => {
    mockAssignProjectId.mockImplementation(() => ({
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      assignProjectId: mockAssignProjectId,
    }));
    expect(await result.current.pullTokens({ context: gitLabContext as StorageTypeCredentials })).toEqual({
      metadata: {
        commitMessage: 'Initial commit',
      },
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
    });
  });

  it('pull tokens from jsonbin', async () => {
    expect(await result.current.pullTokens({ context: jsonbinContext as StorageTypeCredentials })).toEqual({
      metadata: {
        commitMessage: 'Initial commit',
      },
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
    });
  });

  it('pull tokens from ADO', async () => {
    expect(await result.current.pullTokens({ context: jsonbinContext as StorageTypeCredentials })).toEqual({
      metadata: {
        commitMessage: 'Initial commit',
      },
      themes: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      tokens: {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      },
    });
  });
});
