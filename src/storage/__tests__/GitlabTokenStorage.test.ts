import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { GitlabTokenStorage } from '../GitlabTokenStorage';

const mockGetUserName = jest.fn();
const mockGetProjects = jest.fn();
const mockGetProjectsInGroups = jest.fn();
const mockGetBranches = jest.fn();
const mockCreateBranch = jest.fn();
const mockGetGroupMembers = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockGetProjectMembers = jest.fn();
const mockGetRepositories = jest.fn();
const mockGetRepositoryFiles = jest.fn();
const mockCreateCommits = jest.fn();

jest.mock('@gitbeaker/browser', () => ({
  Gitlab: jest.fn().mockImplementation(() => ({
    Users: {
      username: mockGetUserName,
      projects: mockGetProjects,
      current: mockGetCurrentUser,
    },
    Groups: {
      projects: mockGetProjectsInGroups,
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
    },
    Commits: {
      create: mockCreateCommits,
    },
  }
  )),
}));

describe('GitlabTokenStorage', () => {
  const storageProvider = new GitlabTokenStorage('', 'six7', 'figma-tokens');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
    storageProvider.changePath('tokens.json');
  });

  it('should assign projectId by projects in group', async () => {
    mockGetUserName.mockImplementationOnce(() => (
      Promise.resolve([])
    ));

    mockGetProjectsInGroups.mockImplementationOnce(() => (
      Promise.resolve(
        [{
          name: 'figma-tokens',
          id: 35102363,
          path: 'figma-tokens',
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
  });

  it('should assign projectId by projects in user', async () => {
    mockGetUserName.mockImplementationOnce(() => (
      Promise.resolve(['six7'])
    ));

    mockGetProjects.mockImplementationOnce(() => (
      Promise.resolve(
        [{
          name: 'figma-tokens',
          id: 35102363,
          path: 'figma-tokens',
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

  it('should try to create a branch', async () => {
    mockCreateBranch.mockImplementationOnce(() => (
      Promise.resolve({
        name: 'development',
      })
    ));
    expect(await storageProvider.createBranch('development', 'main')).toBe(true);
    expect(mockCreateBranch).toBeCalledWith(35102363, 'development', 'heads/main');
  });

  it('create a branch should return false when it is failed', async () => {
    mockCreateBranch.mockImplementationOnce(() => (
      Promise.resolve({
      })
    ));
    expect(await storageProvider.createBranch('development', 'main')).toBe(false);
    expect(mockCreateBranch).toBeCalledWith(35102363, 'development', 'heads/main');
  });

  it('canWrite should return true if user is a collaborator by GroupMember', async () => {
    mockGetCurrentUser.mockImplementationOnce(() => (
      Promise.resolve({
        id: 11289475,
        state: 'active',
      })
    ));
    mockGetGroupMembers.mockImplementationOnce(() => (
      Promise.resolve({
        access_level: 50,
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockGetGroupMembers).toBeCalledWith(51634506, 11289475);
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
    expect(mockGetProjectMembers).toBeCalledWith(35102363, 11289475);
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
      ])
    ));

    mockGetRepositoryFiles.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: 'enabled',
      },
    })));

    mockGetRepositoryFiles.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
      red: {
        value: '#ff0000',
        type: 'color',
      },
      black: {
        value: '#000000',
        type: 'color',
      },
    })));

    expect(await storageProvider.read()).toEqual([
      {
        data: {
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: 'enabled',
          },

        },
        path: 'data/$themes.json',
        type: 'themes',
      },
      {
        name: 'global',
        path: 'data/global.json',
        type: 'tokenSet',
        data: {
          red: {
            value: '#ff0000', type: 'color',
          },
          black: { value: '#000000', type: 'color' },
        },
      },
    ]);
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
            value: '#ff0000',
          },
        },
      },
    ]);

    expect(mockCreateCommits).toBeCalledWith(
      35102363,
      'main',
      'Initial commit',
      [
        {
          action: 'create',
          content: JSON.stringify({
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
        message: 'remove tokenSet',
      })
    )).mockImplementationOnce(() => (
      Promise.resolve({
        message: 'create or update',
      })
    ));

    await storageProvider.write([
      {
        type: 'metadata',
        path: '$metadata.json',
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
    ]);

    expect(mockCreateCommits).toBeCalledTimes(2);
    expect(mockCreateCommits).toBeCalledWith(
      35102363,
      'main',
      'remove tokenSet',
      [
        {
          action: 'delete',
          filePath: 'data/core.json',
        },
        {
          action: 'delete',
          filePath: 'data/internal.json',
        },
      ],
    );

    expect(mockCreateCommits).toBeCalledWith(
      35102363,
      'main',
      'Initial commit',
      [
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
      ],
      undefined,
    );
  });
});
