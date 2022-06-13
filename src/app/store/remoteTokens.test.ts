import { renderHook } from '@testing-library/react-hooks';
import useRemoteTokens from './remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import {
  themesListSelector,
  tokensSelector
} from '@/selectors';
import { Selector } from 'reselect';
import { waitFor } from '@testing-library/react';
import { notifyToUI } from '@/plugin/notifiers';

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
const mockSetApiData = jest.fn();
const mockSetLocalApiState = jest.fn();
const mockSetStorage = jest.fn();
const mockFetchBranches = jest.fn();
const mockSetBranches = jest.fn();
const mockConfirm = jest.fn();
const mockSetShowConfirm = jest.fn();
const mockPushDialog = jest.fn();
const mockPullTokens = jest.fn();
const mockSave = jest.fn();

const mockSelector = (selector: Selector) => {
  switch (selector) {
    case tokensSelector:
      return {
        global: [
          {
            value: '#ffffff',
            type: 'color',
            name: 'black',
          },
        ],
      }
    case themesListSelector:
      return [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        }
      ]
    default:
      return {}
  }
};

jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockImplementation(() => ({
    uiState: {
      startJob: mockStartJob,
      completeJob: mockCompleteJob,
      setProjectURL: mockSetProjectURL,
      setLocalApiState: mockSetLocalApiState,
      setApiData: mockSetApiData,
      setStorage: mockSetStorage,
      setShowConfirm: mockSetShowConfirm
    },
    tokenState: {
      setLastSyncedState: mockSetLastSyncedState,
      setTokenData: mockSetTokenData,
      setEditProhibited: mockSetEditProhibited
    },
    branchState: {
      setBranches: mockSetBranches
    }
  })),
  useSelector: (selector: Selector) => mockSelector(selector)
}));
jest.mock('../../storage/GithubTokenStorage', () => ({
  GithubTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      fetchBranches: mockFetchBranches,
      save: mockSave,
    }
  ))
}));
jest.mock('../../storage/GitlabTokenStorage', () => ({
  GitlabTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      save: mockSave,
      assignProjectId: jest.fn().mockImplementation(() => ({
        retrieve: mockRetrieve,
        canWrite: mockCanWrite,
        changePath: mockChangePath,
        selectBranch: mockSelectBrach,
        enableMultiFile: mockEnableMultiFile,
        assignProjectId: mockAssignProjectId,
        fetchBranches: mockFetchBranches,
        save: mockSave,
      }))
    }
  ))
}));
jest.mock('../../storage/JSONBinTokenStorage', () => ({
  JSONBinTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  ))
}));
jest.mock('../../storage/ADOTokenStorage', () => ({
  ADOTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
      canWrite: mockCanWrite,
      changePath: mockChangePath,
      selectBranch: mockSelectBrach,
      enableMultiFile: mockEnableMultiFile,
      fetchBranches: mockFetchBranches,
      save: mockSave,
    }
  ))
}));
jest.mock('../../storage/UrlTokenStorage', () => ({
  UrlTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  ))
}));
jest.mock("../hooks/useConfirm", () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm
  }),
}));
jest.mock("../hooks/usePushDialog", () => ({
  __esModule: true,
  default: () => ({
    pushDialog: mockPushDialog
  }),
}));
jest.mock("../../plugin/notifiers", (() => ({
  notifyToUI: jest.fn()
})));

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
const urlContext = {
  name: 'six7',
  id: 'six7/figma-tokens',
  provider: 'url',
  secret: 'url',
};

const contexts = [gitHubContext, gitLabContext, jsonbinContext, adoContext, urlContext];
const contextNames = ['GitHub', 'GitLab', 'jsonbin', 'ADO', 'url'];
describe('remoteTokens', () => {
  let { result } = renderHook(() => useRemoteTokens());
  beforeEach(() => {
    result = renderHook(() => useRemoteTokens()).result;
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
            }
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
  });
  afterEach(() => {
    jest.clearAllMocks();
  })

  contexts.forEach((context) => {
    it(`pull tokens from ${context.provider}`, async () => {
      expect(await result.current.pullTokens({ context: context as StorageTypeCredentials })).toEqual({
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
          }
        ],
        tokens: {
          global: [
            {
              value: '#ffffff',
              type: 'color',
              name: 'black'
            }
          ]
        }
      });
    })
  })

  contexts.forEach((context, index) => {
    it(`trying to restoreStoredProvider from ${context.provider}, notify pull tokens if a user agree`, async () => {
      mockFetchBranches.mockImplementationOnce(() => (
        Promise.resolve(['main'])
      ));
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(
          {
            metadata: {
              commitMessage: 'Initial commit',
            },
            themes: [
              {
                id: 'black',
                name: 'Black',
                selectedTokenSets: {
                  global: 'enabled',
                },
              }
            ],
            tokens: {
              global: [
                {
                  value: '#000000',
                  type: 'color',
                  name: 'white',
                },
              ],
            },
          },
        )
      ));
      mockConfirm.mockImplementation(() => (
        Promise.resolve(true)
      ));
      await waitFor(() => { result.current.restoreStoredProvider(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        expect(notifyToUI).toBeCalledTimes(1);
        expect(notifyToUI).toBeCalledWith(`Pulled tokens from ${contextNames[index]}`);
      }
      else if (context === jsonbinContext || context === urlContext) {
        expect(mockStartJob).toBeCalledWith({
          isInfinite: true,
          name: "ui_pulltokens"
        });
      }
    })
  })

  contexts.forEach((context) => {
    it(`trying to restoreStoredProvider from ${context.provider}, should push tokens if there is no file in the repo`, async () => {
      mockFetchBranches.mockImplementationOnce(() => (
        Promise.resolve(['main'])
      ));
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(null)
      ));
      await waitFor(() => { result.current.restoreStoredProvider(context as StorageTypeCredentials) });
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        expect(mockPushDialog).toBeCalledTimes(1);
      }
      else if (context === jsonbinContext || context === urlContext) {
        expect(mockStartJob).toBeCalledWith({
          isInfinite: true,
          name: "ui_pulltokens"
        });
      }
    })
  })

  contexts.forEach((context) => {
    it(`push tokens to ${context.provider}`, async () => {
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(null)
      ));
      mockPushDialog.mockImplementation(() => (
        Promise.resolve({
          customBranch: 'development',
          commitMessage: 'Initial commit'
        })
      ));
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials) });
        expect(mockPushDialog).toBeCalledTimes(2);
        expect(mockPushDialog.mock.calls[1][0]).toBe('successfully pushed');
      }
      else if (context === jsonbinContext || context === urlContext) {
        return;
      }
    })
  })
});
