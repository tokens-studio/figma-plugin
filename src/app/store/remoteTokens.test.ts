import { renderHook } from '@testing-library/react-hooks';
import { Selector } from 'reselect';
import { waitFor } from '@testing-library/react';
import useRemoteTokens from './remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import {
  themesListSelector,
  tokensSelector,
} from '@/selectors';
import { notifyToUI } from '@/plugin/notifiers';
import { ErrorMessages } from '@/constants/ErrorMessages';

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
const mockCreateBranch = jest.fn();
const mockSave = jest.fn();
const mockSetCollapsedTokenSets = jest.fn();

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
      };
    case themesListSelector:
      return [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ];
    default:
      return {};
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
      setShowConfirm: mockSetShowConfirm,
    },
    tokenState: {
      setLastSyncedState: mockSetLastSyncedState,
      setTokenData: mockSetTokenData,
      setEditProhibited: mockSetEditProhibited,
      setCollapsedTokenSets: mockSetCollapsedTokenSets,
    },
    branchState: {
      setBranches: mockSetBranches,
    },
  })),
  useSelector: (selector: Selector) => mockSelector(selector),
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
      createBranch: mockCreateBranch,
    }
  )),
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
      createBranch: mockCreateBranch,
      assignProjectId: jest.fn().mockImplementation(() => ({
        retrieve: mockRetrieve,
        canWrite: mockCanWrite,
        changePath: mockChangePath,
        selectBranch: mockSelectBrach,
        enableMultiFile: mockEnableMultiFile,
        assignProjectId: mockAssignProjectId,
        fetchBranches: mockFetchBranches,
        save: mockSave,
        createBranch: mockCreateBranch,
      })),
    }
  )),
}));
jest.mock('../../storage/JSONBinTokenStorage', () => ({
  JSONBinTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  )),
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
      createBranch: mockCreateBranch,
    }
  )),
}));
jest.mock('../../storage/UrlTokenStorage', () => ({
  UrlTokenStorage: jest.fn().mockImplementation(() => (
    {
      retrieve: mockRetrieve,
    }
  )),
}));
jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));
jest.mock('../hooks/usePushDialog', () => ({
  __esModule: true,
  default: () => ({
    pushDialog: mockPushDialog,
  }),
}));
jest.mock('../../plugin/notifiers', (() => ({
  notifyToUI: jest.fn(),
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
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  contexts.forEach((context) => {
    it(`Pull tokens from ${context.provider}`, async () => {
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

  contexts.forEach((context, index) => {
    it(`Restore storedProvider from ${context.provider}, should pull tokens if the user agree`, async () => {
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
              },
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
      } else {
        expect(mockStartJob).toBeCalledWith({
          isInfinite: true,
          name: 'ui_pulltokens',
        });
      }
    });
  });

  contexts.forEach((context) => {
    it(`Restore storedProvider from ${context.provider}, should push tokens if there is no content`, async () => {
      mockFetchBranches.mockImplementationOnce(() => (
        Promise.resolve(['main'])
      ));
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(null)
      ));
      await waitFor(() => { result.current.restoreStoredProvider(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        expect(mockPushDialog).toBeCalledTimes(1);
      } else {
        expect(mockStartJob).toBeCalledWith({
          isInfinite: true,
          name: 'ui_pulltokens',
        });
      }
    });
  });

  contexts.forEach((context) => {
    it(`push tokens to ${context.provider}`, async () => {
      mockRetrieve.mockImplementation(() => (
        Promise.resolve(null)
      ));
      mockPushDialog.mockImplementation(() => (
        Promise.resolve({
          customBranch: 'development',
          commitMessage: 'Initial commit',
        })
      ));
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials); });
        expect(mockPushDialog).toBeCalledTimes(2);
        expect(mockPushDialog.mock.calls[1][0]).toBe('success');
      }
    });
  });

  contexts.forEach((context) => {
    it(`push tokens to ${context.provider}, should return noting to commit if the content is same`, async () => {
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        await waitFor(() => { result.current.pushTokens(context as StorageTypeCredentials); });
        expect(notifyToUI).toBeCalledWith('Nothing to commit');
      }
    });
  });

  contexts.forEach((context) => {
    if (context === gitHubContext || context === gitLabContext || context === adoContext) {
      it(`Add newProviderItem to ${context.provider}, should push tokens and return token data if there is no content`, async () => {
        mockFetchBranches.mockImplementationOnce(() => (
          Promise.resolve(['main'])
        ));
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(null)
        ));
        mockPushDialog.mockImplementation(() => (
          Promise.resolve({
            customBranch: 'development',
            commitMessage: 'Initial commit',
          })
        ));
        await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
        expect(mockPushDialog).toBeCalledTimes(2);
        expect(mockPushDialog.mock.calls[1][0]).toBe('success');
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          metadata: {},
          themes: [{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: 'enabled',
            },
          }],
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
    } else {
      it(`Add newProviderItem to ${context.provider}, should pull tokens and return error message if there is no content`, async () => {
        mockRetrieve.mockImplementation(() => (
          Promise.resolve(null)
        ));
        if (context === urlContext) {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.URL_CREDNETIAL_ERROR,
          });
        } else {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.JSONBIN_CREDNETIAL_ERROR,
          });
        }
      });
    }
  });

  contexts.forEach((context, index) => {
    if (context === gitHubContext || context === gitLabContext || context === adoContext) {
      it(`Add newProviderItem to ${context.provider}, should pull tokens and notify that no tokens stored on remote if there is no tokens on remote`, async () => {
        mockFetchBranches.mockImplementation(() => (
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
                  id: 'light',
                  name: 'Light',
                  selectedTokenSets: {
                    global: 'enabled',
                  },
                },
              ],
            },
          )
        ));
        mockConfirm.mockImplementation(() => (
          Promise.resolve(true)
        ));
        await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
        expect(notifyToUI).toBeCalledTimes(2);
        expect(notifyToUI).toBeCalledWith(`Pulled tokens from ${contextNames[index]}`);
        expect(notifyToUI).toBeCalledWith('No tokens stored on remote');
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          metadata: {},
          themes: [{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: 'enabled',
            },
          }],
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
    } else {
      it(`Add newProviderItem to ${context.provider}, should pull tokens and return error message if there is no tokens on remote`, async () => {
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
              tokens: null,
            },
          )
        ));
        if (context === urlContext) {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.URL_CREDNETIAL_ERROR,
          });
        } else {
          expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
            errorMessage: ErrorMessages.JSONBIN_CREDNETIAL_ERROR,
          });
        }
      });
    }
  });

  contexts.forEach((context) => {
    it(`Add newProviderItem to ${context.provider}, should pull tokens and return token data`, async () => {
      mockFetchBranches.mockImplementation(() => (
        Promise.resolve(['main'])
      ));
      await waitFor(() => { result.current.addNewProviderItem(context as StorageTypeCredentials); });
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          metadata: {},
          themes: [{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: 'enabled',
            },
          }],
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
      } else {
        expect(await result.current.addNewProviderItem(context as StorageTypeCredentials)).toEqual({
          metadata: {
            commitMessage: 'Initial commit',
          },
          themes: [{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: 'enabled',
            },
          }],
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
      }
    });
  });

  contexts.forEach((context) => {
    it(`create branch in ${context.provider}`, async () => {
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        mockCreateBranch.mockImplementation(() => (
          Promise.resolve(true)
        ));
        expect(await result.current.addNewBranch(context as StorageTypeCredentials, 'newBranch')).toEqual(true);
      }
    });
  });

  contexts.forEach((context) => {
    it(`fetch branchs in ${context.provider}`, async () => {
      if (context === gitHubContext || context === gitLabContext || context === adoContext) {
        mockFetchBranches.mockImplementation(() => (
          Promise.resolve(['main'])
        ));
        expect(await result.current.fetchBranches(context as StorageTypeCredentials)).toEqual(['main']);
      } else {
        expect(await result.current.fetchBranches(context as StorageTypeCredentials)).toEqual(null);
      }
    });
  });
});
