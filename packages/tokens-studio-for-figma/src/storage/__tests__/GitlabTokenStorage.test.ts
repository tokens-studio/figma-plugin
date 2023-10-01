import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { GitlabTokenStorage } from '../GitlabTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';

const mockGetUserName = jest.fn();
const mockGetProjects = jest.fn();
const mockGetBranches = jest.fn();
const mockCreateBranch = jest.fn();
const mockGetGroupMembers = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockGetProjectMembers = jest.fn();
const mockGetRepositories = jest.fn();
const mockGetRepositoryFiles = jest.fn();
const mockCreateCommits = jest.fn();
const mockShowCommits = jest.fn();
const mockShowRepositoryFiles = jest.fn();

jest.mock('@gitbeaker/browser', () => ({
  Gitlab: jest.fn().mockImplementation(() => ({
    Users: {
      username: mockGetUserName,
      current: mockGetCurrentUser,
    },
    Projects: {
      search: mockGetProjects,
    },
    Branches: {
      all: mockGetBranches,
      create: mockCreateBranch,
    },
    GroupMembers: {
      show: mockGetGroupMembers,
    },
    ProjectMembers: {
      show: mockGetProjectMembers,
    },
    Repositories: {
      tree: mockGetRepositories,
    },
    RepositoryFiles: {
      showRaw: mockGetRepositoryFiles,
      show: mockShowRepositoryFiles,
    },
    Commits: {
      create: mockCreateCommits,
      show: mockShowCommits,
    },
  }
  )),
}));

describe('GitlabTokenStorage', () => {
  const storageProvider = new GitlabTokenStorage('', 'figma-tokens', 'six7/figma-tokens');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
    storageProvider.changePath('tokens.json');
  });

  it('should assign projectId by searching in projects', async () => {
    const repoName = 'figma-tokens';
    const namespace = 'six7';
    mockGetUserName.mockImplementationOnce(() => (
      Promise.resolve([])
    ));

    mockGetProjects.mockImplementationOnce(() => (
      Promise.resolve(
        [{
          name: repoName,
          id: 35102363,
          path: repoName,
          path_with_namespace: `${namespace}/${repoName}`,
          namespace: {
            full_path: 'six7',
            id: 51634506,
          },
        }],
      )
    ));

    expect(
      await storageProvider.assignProjectId(),
    ).toHaveProperty('projectId', 35102363);
    expect(
      await storageProvider.assignProjectId(),
    ).toHaveProperty('groupId', 51634506);

    expect(mockGetProjects).toHaveBeenCalledWith(repoName, { membership: true });
  });

  it('should throw an error if no project is found', async () => {
    const provider = new GitlabTokenStorage('', 'test-name', 'fullPath');
    mockGetUserName.mockImplementationOnce(() => (
      Promise.resolve([])
    ));

    mockGetProjects.mockImplementationOnce(() => (
      Promise.resolve(
        [{
          name: 'name',
          id: 35102363,
          path: 'name',
          path_with_namespace: 'namespace/project',
          namespace: {
            full_path: 'six7',
            id: 51634506,
          },
        }],
      )
    ));

    await expect(provider.assignProjectId())
      .rejects
      .toThrow('Project not accessible');
  });

  it('should fetch branches as a simple list', async () => {
    mockGetBranches.mockImplementationOnce(() => (
      Promise.resolve(
        [
          { name: 'main' },
          { name: 'development' },
        ],
      )
    ));

    expect(
      await storageProvider.fetchBranches(),
    ).toEqual(
      ['main', 'development'],
    );
  });

  it('should throw an error if there is no project id when trying to fetch branches', async () => {
    const provider = new GitlabTokenStorage('', '', '');

    await expect(provider.fetchBranches())
      .rejects
      .toThrow('Project ID not assigned');
  });

  it('should try to create a branch', async () => {
    mockCreateBranch.mockImplementationOnce(() => (
      Promise.resolve({
        name: 'development',
      })
    ));
    expect(await storageProvider.createBranch('development', 'main')).toBe(true);
    expect(mockCreateBranch).toBeCalledWith(35102363, 'development', 'heads/main');
  });

  it('should throw an error if there is no project id when trying to create a branch', async () => {
    const provider = new GitlabTokenStorage('', '', '');

    await expect(provider.createBranch('newBranch'))
      .rejects
      .toThrow('Project ID not assigned');
  });

  it('create a branch should return false when it is failed', async () => {
    mockCreateBranch.mockImplementationOnce(() => (
      Promise.resolve({
      })
    ));
    expect(await storageProvider.createBranch('development', 'main')).toBe(false);
    expect(mockCreateBranch).toBeCalledWith(35102363, 'development', 'heads/main');
  });

  it('canWrite should return true if user is a collaborator by projectMember', async () => {
    mockGetCurrentUser.mockImplementationOnce(() => (
      Promise.resolve({
        id: 11289475,
        state: 'active',
      })
    ));
    mockGetGroupMembers.mockImplementationOnce(() => (
      Promise.reject(new Error())
    ));
    mockGetProjectMembers.mockImplementationOnce(() => (
      Promise.resolve({
        access_level: 50,
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockGetProjectMembers).toBeCalledWith(35102363, 11289475, { includeInherited: true });
  });

  it('canWrite should return false if user is not a collaborator', async () => {
    mockGetCurrentUser.mockImplementationOnce(() => (
      Promise.resolve({
        id: 11289475,
        state: 'active',
      })
    ));
    mockGetGroupMembers.mockImplementationOnce(() => (
      Promise.resolve({
        access_level: 20,
      })
    ));
    expect(await storageProvider.canWrite()).toBe(false);
  });

  it('canWrite should throw an error if there is no project or group id', async () => {
    const provider = new GitlabTokenStorage('', '', '');
    provider.enableMultiFile();
    await expect(provider.canWrite())
      .rejects
      .toThrow('Project ID not assigned');
  });

  it('canWrite should return false if filePath is a folder and multiFileSync flag is false', async () => {
    storageProvider.changePath('tokens');

    const canWrite = await storageProvider.canWrite();
    expect(canWrite).toBe(false);
  });

  it('can read from Git in single file format', async () => {
    mockGetRepositories.mockImplementationOnce(() => (
      Promise.resolve([])
    ));

    storageProvider.changePath('data/tokens.json');
    mockGetRepositoryFiles.mockImplementationOnce(() => (
      Promise.resolve(JSON.stringify({
        global: {
          red: {
            value: '#ff0000',
            type: 'color',
          },
          black: {
            value: '#000000',
            type: 'color',
          },
        },
        $themes: {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      }))
    ));
    expect(await storageProvider.read()).toEqual([
      {
        data: {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },

        },
        path: 'data/tokens.json/$themes.json',
        type: 'themes',
      },
      {
        name: 'global',
        path: 'data/tokens.json/global.json',
        type: 'tokenSet',
        data: {
          red: {
            value: '#ff0000', type: 'color',
          },
          black: { value: '#000000', type: 'color' },
        },
      },
    ]);
    expect(mockGetRepositoryFiles).toBeCalledWith(35102363, 'data/tokens.json', { ref: 'main' });
  });

  it('can read from Git in a multifile format', async () => {
    storageProvider.changePath('data');

    mockGetRepositories.mockImplementationOnce(() => (
      Promise.resolve([
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'global.json',
          path: 'data/global.json',
          type: 'blob',
        },
        {
          id: '3d037ff17e986f4db21aabaefca3e3ddba113d85',
          mode: '100644',
          name: '$themes.json',
          path: 'data/$themes.json',
          type: 'blob',
        },
        {
          id: '$metadata.json',
          mode: '100644',
          name: '$metadata.json',
          path: 'data/$metadata.json',
          type: 'blob',
        },
      ])
    ));

    mockGetRepositoryFiles.mockImplementation(async (projectId: number, path: string) => {
      if (path === 'data/$themes.json') {
        return JSON.stringify([{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        }]);
      }

      if (path === 'data/$metadata.json') {
        return JSON.stringify({
          tokenSetOrder: ['global'],
        });
      }

      return JSON.stringify({
        red: {
          value: '#ff0000',
          type: 'color',
        },
        black: {
          value: '#000000',
          type: 'color',
        },
      });
    });

    const received = await storageProvider.read();
    expect(received[0]).toEqual({
      data: {
        tokenSetOrder: [
          'global',
        ],
      },
      path: 'data/$metadata.json',
      type: 'metadata',
    });
    expect(received[1]).toEqual({
      data: [
        {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },
        },
      ],
      path: 'data/$themes.json',
      type: 'themes',
    });
    expect(received[2]).toEqual({
      data: {
        black: {
          type: 'color',
          value: '#000000',
        },
        red: {
          type: 'color',
          value: '#ff0000',
        },
      },
      name: 'global',
      path: 'data/global.json',
      type: 'tokenSet',
    });
  });

  it('read should throw an error if there is no project id', async () => {
    const provider = new GitlabTokenStorage('', '', '');

    await expect(provider.read())
      .rejects
      .toThrow('Missing Project ID');
  });

  it('should return a validation error', async () => {
    mockGetRepositories.mockImplementationOnce(() => (
      Promise.resolve([])
    ));

    storageProvider.changePath('data/tokens.json');
    mockGetRepositoryFiles.mockImplementationOnce(() => (
      Promise.resolve('')
    ));
    expect(await storageProvider.read()).toEqual({
      errorMessage: ErrorMessages.VALIDATION_ERROR,
    });
    expect(mockGetRepositoryFiles).toBeCalledWith(35102363, 'data/tokens.json', { ref: 'main' });
  });

  it('should return an empty array when reading results in an error', async () => {
    mockGetRepositories.mockImplementationOnce(() => (
      Promise.reject(new Error())
    ));
    expect(await storageProvider.read()).toEqual([]);
  });

  it('should be able to write', async () => {
    mockGetBranches.mockImplementation(() => (
      Promise.resolve(
        [
          { name: 'main' },
          { name: 'development' },
        ],
      )
    ));
    storageProvider.changePath('data/tokens.json');

    mockGetRepositories.mockImplementationOnce(() => (
      Promise.resolve([])
    ));

    mockCreateCommits.mockImplementationOnce(() => (
      Promise.resolve({
        message: 'create a new file',
      })
    ));

    await storageProvider.write([
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
            value: '#ff0000',
          },
        },
      },
    ], {
      commitMessage: 'Initial commit',
    });

    expect(mockCreateCommits).toBeCalledWith(
      35102363,
      'main',
      'Initial commit',
      [
        {
          action: 'create',
          content: JSON.stringify({
            $metadata: {},
            $themes: [{
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: TokenSetStatus.ENABLED,
              },
            }],
            global: {
              red: {
                type: TokenTypes.COLOR,
                value: '#ff0000',
              },
            },
          }, null, 2),
          filePath: 'data/tokens.json',
        },
      ],
      undefined,
    );
  });

  it('should be able to write, update, delete a multifile structure', async () => {
    storageProvider.enableMultiFile();
    mockGetBranches.mockImplementation(() => (
      Promise.resolve(
        [
          { name: 'main' },
          { name: 'development' },
        ],
      )
    ));
    storageProvider.changePath('data');

    mockGetRepositories.mockImplementationOnce(() => (
      Promise.resolve([
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'global.json',
          path: 'data/global.json',
          type: 'blob',
        },
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'core.json',
          path: 'data/core.json',
          type: 'blob',
        },
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'internal.json',
          path: 'data/internal.json',
          type: 'blob',
        },
        {
          id: '3d037ff17e986f4db21aabaefca3e3ddba113d85',
          mode: '100644',
          name: '$themes.json',
          path: 'data/$themes.json',
          type: 'blob',
        },
      ])
    ));

    mockCreateCommits.mockImplementationOnce(() => (
      Promise.resolve({
        message: 'create or update',
      })
    ));

    await storageProvider.write([
      {
        type: 'metadata',
        path: '$metadata.json',
        data: {
          tokenSetOrder: ['tokens'],
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
            value: '#ff0000',
          },
        },
      },
      {
        type: 'tokenSet',
        name: 'core-rename',
        path: 'core-rename.json',
        data: {
          red: {
            type: TokenTypes.COLOR,
            value: '#ff0000',
          },
        },
      },
    ], {
      commitMessage: 'Initial commit',
    });

    expect(mockCreateCommits).toBeCalledTimes(1);
    expect(mockCreateCommits).toBeCalledWith(
      35102363,
      'main',
      'Initial commit',
      [
        {
          action: 'create',
          content: JSON.stringify({
            tokenSetOrder: ['tokens'],
          }, null, 2),
          filePath: 'data/$metadata.json',
        },
        {
          action: 'update',
          content: JSON.stringify([{
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: TokenSetStatus.ENABLED,
            },
          }], null, 2),
          filePath: 'data/$themes.json',
        },
        {
          action: 'update',
          content: JSON.stringify({
            red: {
              type: TokenTypes.COLOR,
              value: '#ff0000',
            },
          }, null, 2),
          filePath: 'data/global.json',
        },
        {
          action: 'create',
          content: JSON.stringify({
            red: {
              type: TokenTypes.COLOR,
              value: '#ff0000',
            },
          }, null, 2),
          filePath: 'data/core-rename.json',
        },
        {
          action: 'delete',
          filePath: 'data/core.json',
        },
        {
          action: 'delete',
          filePath: 'data/internal.json',
        },
      ],
      undefined,
    );
  });

  it('write should throw an error if there is no project id', async () => {
    const provider = new GitlabTokenStorage('', '', '');

    await expect(provider.write([]))
      .rejects
      .toThrow('Project ID not assigned');
  });

  it('should return the committed date of a JSON file', async () => {
    mockShowRepositoryFiles.mockImplementationOnce(() => (
      Promise.resolve({
        commit_id: '1234',
      })
    ));
    mockShowCommits.mockImplementationOnce(() => (
      Promise.resolve({
        committed_date: '2022-01-31T12:34:56Z',
      })
    ));
    expect(await storageProvider.getLatestCommitDate()).toEqual('2022-01-31T12:34:56Z');
  });

  it('should return the committed date of the latest JSON file in a directory (recursive)', async () => {
    storageProvider.changePath('data');
    mockGetRepositories.mockImplementationOnce(() => (
      Promise.resolve([
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'global.json',
          path: 'data/global.json',
          type: 'blob',
        },
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'core.json',
          path: 'data/core.json',
          type: 'blob',
        },
        {
          id: 'b2ce0083a14576540b8eed3de53bc6d7a43e00e6',
          mode: '100644',
          name: 'internal.json',
          path: 'data/internal.json',
          type: 'blob',
        },
        {
          id: '3d037ff17e986f4db21aabaefca3e3ddba113d85',
          mode: '100644',
          name: '$themes.json',
          path: 'data/$themes.json',
          type: 'blob',
        },
      ])
    ));
    mockShowRepositoryFiles.mockImplementationOnce(() => (
      Promise.resolve({
        commit_id: '1234',
      })
    ));
    mockShowCommits.mockImplementationOnce(() => (
      Promise.resolve({
        committed_date: '2022-01-31T12:34:56Z',
      })
    ));
    expect(await storageProvider.getLatestCommitDate()).toEqual('2022-01-31T12:34:56Z');
  });
});
