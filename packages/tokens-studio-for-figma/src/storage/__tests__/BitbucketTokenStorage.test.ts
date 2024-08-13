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
    // Reset the Bitbucket mock and create a new instance of BitbucketTokenStorage
    storageProvider = new BitbucketTokenStorage('mock-secret', 'MattOliver', 'figma-tokens-testing', '', 'myusername');
    storageProvider.selectBranch('main');
    jest.clearAllMocks();
    storageProvider.selectBranch('main');
    storageProvider.disableMultiFile();
  });

  it('canWrite should return false if unauthenticated', async () => {
    mockGetAuthedUser.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {},
      });
    });

    mockListPermissions.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          values: [],
        },
      });
    });

    expect(await storageProvider.canWrite()).toBe(false);
  });

  it('canWrite should return true if user has admin or write permissions', async () => {
    mockGetAuthedUser.mockImplementationOnce(() =>
      Promise.resolve({
        data: { account_id: '123' },
      }),
    );
    mockListPermissions.mockImplementationOnce(() =>
      Promise.resolve({
        data: { values: [{ permission: 'admin' }] },
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
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ global: { red: { name: 'red', type: 'color', value: '#ff0000' } } }),
    }));

    const result = await storageProvider.read();
    expect(result).toEqual([
      {
        path: '/$themes.json',
        type: 'themes',
        data: [],
      },
      {
        path: '/global.json',
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

    storageProvider.changePath('data/core.json');

    expect(result).toEqual([
      {
        path: '/$themes.json',
        type: 'themes',
        data: [],
      },
      {
        path: '/global.json',
        name: 'global',
        type: 'tokenSet',
        data: {
          red: {
            type: 'color',
            name: 'red',
            value: '#ff0000',
          },
        },
      },
    ]);

    expect(mockFetch).toBeCalledWith(
      `https://api.bitbucket.org/2.0/repositories/${storageProvider.owner}/${storageProvider.repository}/src/${storageProvider.branch}/`,
      {
        headers: {
          Authorization: `Basic ${btoa('myusername:mock-secret')}`,
        },
      },
    );
  });

  it('listBranches should fetch branches as a simple list', async () => {
    mockListBranches.mockImplementationOnce(() =>
      Promise.resolve({ data: { values: [{ name: 'main' }, { name: 'different-branch' }] } }),
    );

    expect(await storageProvider.fetchBranches()).toEqual(['main', 'different-branch']);
  });

  it('should call createBranch', async () => {
    // Arrange
    const mockCreateBranch = jest.fn().mockResolvedValue(true);
    storageProvider.createBranch = mockCreateBranch;

    // Act
    const result = await storageProvider.createBranch('new-branch');

    // Assert
    expect(result).toBe(true);
    expect(mockCreateBranch).toHaveBeenCalledTimes(1);
  });

  it('should try to create a branch', async () => {
    const result = await storageProvider.createBranch('new-branch').catch((err) => console.error(err));

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
          const files: { [key: string]: string } = {};
          if (change.files['$metadata.json']) files['$metadata.json'] = change.files['$metadata.json'];
          if (change.files['$themes.json']) files['$themes.json'] = change.files['$themes.json'];
          if (change.files['global.json']) files['global.json'] = change.files['global.json'];
          return {
            message: change.message,
            files,
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
