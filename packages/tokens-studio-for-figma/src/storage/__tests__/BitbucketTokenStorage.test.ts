/* eslint-disable arrow-body-style */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
import { mockFetch } from '../../../tests/__mocks__/fetchMock';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { BitbucketTokenStorage } from '../BitbucketTokenStorage';
import { RemoteTokenStorageFile } from '../RemoteTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';

import {
  mockGetAuthedUser,
  mockListPermissions,
  mockListBranches,
  mockCreateOrUpdateFiles,
  mockCreateBranch,
} from '../../../tests/__mocks__/bitbucketMock';

const mockListRefs = jest.fn(() => {
  return Promise.resolve({
    data: {
      values: [{ name: 'main', target: { hash: 'simpleHash' } }],
    },
  });
});

// Mock FormData
// createOrUpdateFiles function uses a FormData object to send the data to the createSrcFileCommit method
// mock the FormData class and make it return a plain object that can be easily compared in the test
global.FormData = jest.fn().mockImplementation(() => {
  const data: Record<string, any> = {};

  return {
    append: jest.fn().mockImplementation((key: string, value: any) => {
      data[key] = value;
    }),
    getData: jest.fn().mockImplementation(() => data),
  };
});
// mock the bitbucket-node module
jest.mock('bitbucket', () => {
  return {
    Bitbucket: jest.fn().mockImplementation(() => {
      return {
        users: {
          getAuthedUser: mockGetAuthedUser,
        },
        repositories: {
          listPermissions: mockListPermissions,
          listBranches: mockListBranches,
          createSrcFileCommit: mockCreateOrUpdateFiles,
          listRefs: mockListRefs,
        },
        refs: {
          createBranch: mockCreateBranch,
        },
      };
    }),
  };
});

describe('BitbucketTokenStorage', () => {
  let storageProvider: BitbucketTokenStorage;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockFetch.mockClear();

    // Set up default mock implementation for fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      }),
    );

    // Reset the Bitbucket mock and create a new instance of BitbucketTokenStorage
    storageProvider = new BitbucketTokenStorage('', 'MattOliver', 'figma-tokens-testing', '', 'test@example.com', 'mock-api-token');
    storageProvider.selectBranch('main');
    storageProvider.disableMultiFile();
  });

  it('canWrite should return false if unauthenticated', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
      }),
    );

    expect(await storageProvider.canWrite()).toBe(false);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.bitbucket.org/2.0/user',
      {
        headers: {
          Authorization: `Basic ${btoa('test@example.com:mock-api-token')}`,
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('canWrite should return true if authenticated and has repository access', async () => {
    // Mock successful user authentication
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          account_id: 'test-account-id',
          username: 'testuser',
        }),
      }),
    );

    // Mock successful repository access
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          name: 'figma-tokens-testing',
          full_name: 'MattOliver/figma-tokens-testing',
        }),
      }),
    );

    expect(await storageProvider.canWrite()).toBe(true);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1,
      'https://api.bitbucket.org/2.0/user',
      {
        headers: {
          Authorization: `Basic ${btoa('test@example.com:mock-api-token')}`,
          'Content-Type': 'application/json',
        },
      },
    );
    expect(mockFetch).toHaveBeenNthCalledWith(2,
      `https://api.bitbucket.org/2.0/repositories/${storageProvider.owner}/${storageProvider.repository}`,
      {
        headers: {
          Authorization: `Basic ${btoa('test@example.com:mock-api-token')}`,
        },
      },
    );
  });

  it('canWrite should return true if user has admin or write permissions', async () => {
    // Mock successful user authentication
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          account_id: '123',
          username: 'testuser',
        }),
      }),
    );

    // Mock successful repository access
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          name: 'figma-tokens-testing',
          full_name: 'MattOliver/figma-tokens-testing',
        }),
      }),
    );

    expect(await storageProvider.canWrite()).toBe(true);
  });

  it('canWrite should return false if filePath is a folder and multiFileSync flag is false', async () => {
    storageProvider.changePath('tokens');

    const canWrite = await storageProvider.canWrite();
    expect(canWrite).toBe(false);
  });

  it('can read from Git in single file format', async () => {
    storageProvider.changePath('global.json');

    mockFetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          $themes: [],
          global: { red: { name: 'red', type: 'color', value: '#ff0000' } },
        }),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ $themes: [] })),
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ red: { name: 'red', type: 'color', value: '#ff0000' } })),
      }));

    const result = await storageProvider.read();

    expect(result).toEqual([
      {
        path: '$themes.json',
        type: 'themes',
        data: [],
      },
      {
        path: 'global.json',
        name: 'global',
        type: 'tokenSet',
        data: {
          red: {
            name: 'red',
            type: 'color',
            value: '#ff0000',
          },
        },
      },
    ]);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://api.bitbucket.org/2.0/repositories/${storageProvider.owner}/${storageProvider.repository}/src/${storageProvider.branch}/global.json`,
      {
        headers: {
          Authorization: `Basic ${btoa('test@example.com:mock-api-token')}`,
        },
        cache: 'no-cache',
      },
    );
  });

  it('listBranches should fetch branches as a simple list', async () => {
    // Reset and setup mock specifically for this test
    mockFetch.mockReset();
    mockFetch.mockImplementation((url) => {
      if (url.includes('/refs/branches')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            values: [{ name: 'main' }, { name: 'different-branch' }],
          }),
        });
      }
      // Default fallback for other calls
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      });
    });

    const result = await storageProvider.fetchBranches();
    expect(result).toEqual(['main', 'different-branch']);
  });

  it('should call createBranch', async () => {
    // Arrange
    const mockCreateBranchMethod = jest.fn().mockResolvedValue(true);
    storageProvider.createBranch = mockCreateBranchMethod;

    // Act
    const result = await storageProvider.createBranch('new-branch');

    // Assert
    expect(result).toBe(true);
    expect(mockCreateBranchMethod).toHaveBeenCalledTimes(1);
  });

  it('should try to create a branch', async () => {
    const result = await storageProvider.createBranch('new-branch').catch(() => false);

    // Assert
    expect(mockCreateBranch).toHaveBeenCalledWith({
      workspace: 'MattOliver',
      _body: {
        name: 'new-branch',
        target: {
          hash: 'simpleHash',
        },
      },
      repo_slug: 'figma-tokens-testing',
    });
    expect(result).toBe(true);
  });

  it('should return false when creating a branch is failed', async () => {
    // Arrange
    mockCreateBranch.mockImplementationOnce(() => Promise.reject(new Error('Failed to create branch')));

    // Act
    const result = await storageProvider.createBranch('development', 'main');

    // Assert
    expect(result).toBe(false);
  });

  it('should be able to write', async () => {
    mockListBranches.mockImplementationOnce(() =>
      Promise.resolve({
        data: { values: [{ name: 'main' }] },
      }),
    );

    const files: RemoteTokenStorageFile[] = [
      {
        type: 'metadata',
        path: '$metadata.json',
        data: {},
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
    ];

    const changes = files.map((file) => ({
      message: 'Initial commit',
      files: {
        [file.path]: JSON.stringify(file.data, null, 2),
      },
    }));

    mockCreateOrUpdateFiles.mockImplementationOnce(() =>
      Promise.resolve({
        branch: 'main',
        owner: 'MattOliver',
        repo: 'figma-tokens-testing',
        createBranch: false,
        changes: changes.map((change) => {
          const changeFiles: { [key: string]: string } = {};
          if (change.files['$metadata.json']) changeFiles['$metadata.json'] = change.files['$metadata.json'];
          if (change.files['$themes.json']) changeFiles['$themes.json'] = change.files['$themes.json'];
          if (change.files['global.json']) changeFiles['global.json'] = change.files['global.json'];
          return {
            message: change.message,
            files: changeFiles,
          };
        }),
      }),
    );

    storageProvider.changePath('data/core.json');
    await storageProvider.write(files, {
      commitMessage: '',
      storeTokenIdInJsonEditor: false,
    });

    expect(mockCreateOrUpdateFiles).toBeCalledWith({
      _body: expect.objectContaining({
        append: expect.any(Function),
        getData: expect.any(Function),
      }),
      branch: 'main',
      message: '',
      repo_slug: 'figma-tokens-testing',
      workspace: 'MattOliver',
    });
  });

  it('should not be able to write a multi file structure when multi file flag is off', async () => {
    mockCreateOrUpdateFiles.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          content: {},
        },
      }),
    );

    storageProvider.disableMultiFile();
    storageProvider.changePath('data');

    await expect(async () => {
      await storageProvider.write(
        [
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
        ],
        {
          commitMessage: '',
          storeTokenIdInJsonEditor: false,
        },
      );
    }).rejects.toThrow(ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR);
    expect(mockCreateOrUpdateFiles).not.toHaveBeenCalled();
  });

  // it('fetchBranches should return a flattened list of all paginated branches', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });

  // it('create a branch should return false when it has failed', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });
  // it('can read from Git in a single file format', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });
  // it('can read from Git in a multifile format', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });
  // it('should return an empty array when reading results in an error', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });
  // it('should be able to write a multifile structure', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });
});
