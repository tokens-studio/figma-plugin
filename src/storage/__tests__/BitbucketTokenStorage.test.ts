import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { BitbucketTokenStorage } from '../BitbucketTokenStorage';

const mockListBranches = jest.fn();
const mockCanWrite = jest.fn();
const mockCreateOrUpdateFiles = jest.fn();
const mockGetAuthedUser = jest.fn();

jest.mock('bitbucket', () => ({
  Bitbucket: jest.fn().mockImplementation(() => ({
    users: {
      canWrite: mockCanWrite,
      getAuthedUser: mockGetAuthedUser,
    },
    repositories: {
      listBranches: mockListBranches,
      createOrUpdateFiles: mockCreateOrUpdateFiles,
    },
  })),
}));

describe('BitbucketTokenStorage', () => {
  const storageProvider = new BitbucketTokenStorage('', 'MattOliver', 'testing-repo-atlassian');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
  });

  it('should return false if unauthenticated', async () => {
    mockGetAuthedUser.mockImplementationOnce(() => Promise.resolve({
      data: {
        username: '',
      },
    }));

    expect(await storageProvider.canWrite()).toBe(false);
  });

  it('should be able to write', async () => {
    mockListBranches.mockImplementationOnce(() => Promise.resolve({
      data: [{ name: 'main' }],
    }));
    mockCreateOrUpdateFiles.mockImplementationOnce(() => Promise.resolve({
      data: {
        content: {},
      },
    }));

    storageProvider.changePath('data/tokens.json');
    await storageProvider.write([
      {
        type: 'metadata',
        path: 'metadata.json',
        data: {
          commitMessage: 'Initial commit',
        },
      },
      {
        type: 'themes',
        path: '$themes.json',
        data: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
            },
          },
        ],
      },
      {
        type: 'tokenSet',
        name: 'global',
        path: 'global.json',
        data: {
          red: {
            type: TokenTypes.COLOR,
            name: 'red',
            value: '#ff0000',
          },
        },
      },
    ]);

    expect(mockCreateOrUpdateFiles).toBeCalledWith({
      branch: 'main',
      owner: 'MattOliver',
      repo: 'figma-tokens-testing',
      createBranch: false,
      changes: [
        {
          message: 'Initial commit',
          files: {
            'data/tokens.json': JSON.stringify(
              {
                $themes: [
                  {
                    id: 'light',
                    name: 'Light',
                    selectedTokenSets: {
                      global: TokenSetStatus.ENABLED,
                    },
                  },
                ],
                global: {
                  red: {
                    type: TokenTypes.COLOR,
                    name: 'red',
                    value: '#ff0000',
                  },
                },
              },
              null,
              2,
            ),
          },
        },
      ],
    });
  });

  it('should fetch branches as a simple list', async () => {
    mockListBranches.mockImplementationOnce(() => Promise.resolve([{ name: 'main' }, { name: 'different-branch' }]));

    expect(await storageProvider.fetchBranches()).toEqual(['main', 'different-branch']);
  });

  it('should try to create a branch', async () => {
    // TODO
    expect((await 1) + 1).toEqual(3);
  });

  it('create a branch should return false when it is failed', async () => {
    // TODO
    expect((await 1) + 1).toEqual(3);
  });

  it('canWrite should return true if user has admin or write permissions', async () => {
    // TODO
    expect((await 1) + 1).toEqual(3);
  });
  it('can read from Git in a multifile format', async () => {
    // TODO
    expect((await 1) + 1).toEqual(3);
  });
  it('should return an empty array when reading results in an error', async () => {
    // TODO
    expect((await 1) + 1).toEqual(3);
  });
  it('should be able to write a multifile structure', async () => {
    // TODO
    expect((await 1) + 1).toEqual(3);
  });
});
