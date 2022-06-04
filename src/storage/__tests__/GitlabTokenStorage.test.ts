import { TokenTypes } from '@/constants/TokenTypes';
import { GitlabTokenStorage } from '../GitlabTokenStorage';

const mockGetUserName = jest.fn();
const mockGetProjects = jest.fn();
const mockGetGroupsProjects = jest.fn();
const mockBranchesAll = jest.fn();
const mockBranchesCreate = jest.fn();
const mockGroupMembersShow = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockProjectMembersShow = jest.fn();
const mockRepositoriesTree = jest.fn();
const mockRepositoriesFiles = jest.fn();
const mockCreateCommits = jest.fn();

jest.mock('@gitbeaker/browser', () => ({
  Gitlab: jest.fn().mockImplementation(() => ({
    Users: {
      username: mockGetUserName,
      projects: mockGetProjects,
      current: mockGetCurrentUser,
    },
    Groups: {
      projects: mockGetGroupsProjects,
    },
    Branches: {
      all: mockBranchesAll,
      create: mockBranchesCreate,
    },
    GroupMembers: {
      show: mockGroupMembersShow,
    },
    ProjectMembers: {
      show: mockProjectMembersShow,
    },
    Repositories: {
      tree: mockRepositoriesTree,
    },
    RepositoryFiles: {
      showRaw: mockRepositoriesFiles,
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
  });

  it('should assign projectId by groups', async () => {
    mockGetUserName.mockImplementationOnce(() => (
      Promise.resolve({
        data: [],
      })
    ));

    mockGetGroupsProjects.mockImplementationOnce(() => (
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
    mockBranchesAll.mockImplementationOnce(() => (
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
    mockBranchesCreate.mockImplementationOnce(() => (
      Promise.resolve({
        name: 'development',
      })
    ));
    expect(await storageProvider.createBranch('development', 'main')).toBe(true);
    expect(mockBranchesCreate).toBeCalledWith(35102363, 'development', 'heads/main');
  });

  it('canWrite should return true if use is a collaborator by GroupMember', async () => {
    mockGetCurrentUser.mockImplementationOnce(() => (
      Promise.resolve({
        id: 11289475,
        state: 'active',
      })
    ));
    mockGroupMembersShow.mockImplementationOnce(() => (
      Promise.resolve({
        access_level: 50,
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockGroupMembersShow).toBeCalledWith(51634506, 11289475);
  });

  it('canWrite should return true if user is a collaborator by projectMember', async () => {
    mockGetCurrentUser.mockImplementationOnce(() => (
      Promise.resolve({
        id: 11289475,
        state: 'active',
      })
    ));
    mockGroupMembersShow.mockImplementationOnce(() => (
      Promise.reject(new Error())
    ));
    mockProjectMembersShow.mockImplementationOnce(() => (
      Promise.resolve({
        access_level: 50,
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockProjectMembersShow).toBeCalledWith(35102363, 11289475);
  });

  it('canWrite should return false if user is not a collaborator', async () => {
    mockGetCurrentUser.mockImplementationOnce(() => (
      Promise.resolve({
        id: 11289475,
        state: 'active',
      })
    ));
    mockGroupMembersShow.mockImplementationOnce(() => (
      Promise.resolve({
        access_level: 20,
      })
    ));
    expect(await storageProvider.canWrite()).toBe(false);
  });

  // it('can read from Git in single file format', async () => {

  //   mockRepositoriesTree.mockImplementationOnce(() => (
  //     Promise.resolve([])
  //   ));

  //   storageProvider.changePath('data/global.json');
  //   mockRepositoriesFiles.mockImplementationOnce(() => (
  //     Promise.resolve(JSON.stringify({
  //       "global": {
  //         "red": {
  //           "value": "#ff0000",
  //           "type": "color"
  //         },
  //         "black": {
  //           "value": "#000000",
  //           "type": "color"
  //         }
  //       },
  //       "$themes": {
  //         id: 'light',
  //         name: 'Light',
  //         selectedTokenSets: {
  //           global: 'enabled',
  //         },
  //       }
  //     }))
  //   ))
  //   expect(await storageProvider.read()).toEqual([
  //     {
  //       data: {
  //         id: 'light',
  //         name: 'Light',
  //         selectedTokenSets: {
  //           global: 'enabled',
  //         },

  //       },
  //       path: "data/global.json/$themes.json",
  //       type: "themes",
  //     },
  //     {
  //       name: "global",
  //       path: "data/global.json/global.json",
  //       type: "tokenSet",
  //       data: {
  //         'red': {
  //           value: '#ff0000', type: 'color'
  //         },
  //         'black': { value: '#000000', type: 'color' }
  //       },
  //     },
  //   ]);
  //   expect(mockRepositoriesFiles).toBeCalledWith(35102363, 'data/global.json', { ref: 'main' });
  // });

  it('can read from Git in a multifile format', async () => {
    storageProvider.enableMultiFile();
    storageProvider.changePath('data');

    mockRepositoriesTree.mockImplementationOnce(() => (
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

    mockRepositoriesFiles.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: 'enabled',
      },
    })));

    mockRepositoriesFiles.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
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
    mockRepositoriesTree.mockImplementationOnce(() => (
      Promise.reject(new Error())
    ));
    expect(await storageProvider.read()).toEqual([]);
  });

  it('should be able to write', async () => {
    storageProvider.selectBranch('main');
    mockBranchesAll.mockImplementation(() => (
      Promise.resolve(
        [
          { name: 'main' },
          { name: 'development' },
        ],
      )
    ));
    storageProvider.changePath('data/global.json');

    mockRepositoriesTree.mockImplementationOnce(() => (
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
          // {
          //   id: 'light',
          //   name: 'Light',
          //   selectedTokenSets: {
          //     global: TokenSetStatus.ENABLED,
          //   },
          // },
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
            $themes: [],
            global: {
              red: {
                type: TokenTypes.COLOR,
                value: '#ff0000',
              },
            },
          }, null, 2),
          filePath: 'data/global.json',
        },
      ],
      undefined,
    );
  });

  it('should be able to write a multifile structure', async () => {
    storageProvider.selectBranch('main');
    storageProvider.enableMultiFile();
    mockBranchesAll.mockImplementation(() => (
      Promise.resolve(
        [
          { name: 'main' },
          { name: 'development' },
        ],
      )
    ));
    storageProvider.changePath('data');

    mockRepositoriesTree.mockImplementationOnce(() => (
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
          // {
          //   id: 'light',
          //   name: 'Light',
          //   selectedTokenSets: {
          //     global: TokenSetStatus.ENABLED,
          //   },
          // },
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
          content: JSON.stringify([]),
          filePath: 'data/$themes.json',
        },
        {
          action: 'create',
          content: JSON.stringify({
            red: {
              type: TokenTypes.COLOR,
              value: '#ff0000',
            },
          }, null, 2),
          filePath: 'data/global.json',
        },
      ],
      undefined,
    );
  });
});
