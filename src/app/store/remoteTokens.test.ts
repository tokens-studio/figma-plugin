import { renderHook, act } from '@testing-library/react-hooks';
import useRemoteTokens from './remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import { GithubTokenStorage } from '@/storage/GithubTokenStorage';
import { uiState } from './models/uiState';

const mockSelector = jest.fn().mockImplementation(() => ({}));
const mockStartJob = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockImplementation(() => ({
    uiState: {
      startJob: mockStartJob,
    },
  })),
  useSelector: () => mockSelector(),
}));

describe('remoteTokens', () => {
  // const mockPullTokens = jest.fn();
  // jest.mock('./remoteTokens', () => {
  //   return jest.fn(() => ({
  //     pullTokens: mockPullTokens
  //   }))
  // });
  let { result } = renderHook(() => useRemoteTokens());
  beforeEach(() => {
    result = renderHook(() => useRemoteTokens()).result;
  });

  const gitHubContext = {
    branch: 'main',
    filePath: 'data/tokens.json',
    id: 'six7/figma-tokens',
    provider: 'github',
    secret: '',
  };

  it('pull tokens from GitHub', async () => {
    const storageProvider = new GithubTokenStorage('', 'six7', 'figma-tokens');

    storageProvider.canWrite = jest.fn().mockImplementationOnce(() => (
      Promise.resolve(true)
    ));

    storageProvider.retrieve = jest.fn().mockImplementationOnce(() => (
      Promise.resolve(
        {
          metadata: null,
          themes: [],
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

    // expect(await mockPullTokens({ context: gitHubContext as StorageTypeCredentials })).toEqual({
    //   metadata: null,
    //   themes: [],
    //   tokens: {
    //     global: [
    //       {
    //         value: '#ffffff',
    //         type: 'color',
    //         name: 'black'
    //       }
    //     ]
    //   }
    // });

    // expect(await ({ context: gitHubContext as StorageTypeCredentials })).toBeCalled();
    act(() => {
      result.current.pullTokens({ context: gitHubContext as StorageTypeCredentials });
    });

    expect(await result.current.pullTokens({ context: gitHubContext as StorageTypeCredentials })).toBeInstanceOf(Function);
    // expect(await result.current.pullTokens({ context: gitHubContext as StorageTypeCredentials })).toEqual({
    //   metadata: null,
    //   themes: [],
    //   tokens: {
    //     global: [
    //       {
    //         value: '#ffffff',
    //         type: 'color',
    //         name: 'black'
    //       }
    //     ]
    //   }
    // });
  });
});
