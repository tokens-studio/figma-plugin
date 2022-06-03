import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { GitlabTokenStorage } from '../GitlabTokenStorage';

const mockGetRef = jest.fn();
const mockCreateRef = jest.fn();
const mockListBranches = jest.fn();
const mockGetAuthenticated = jest.fn();
const mockGetCollaboratorPermissionLevel = jest.fn();
const mockGetContent = jest.fn();
const mockCreateOrUpdateFiles = jest.fn();
const mockCreateTree = jest.fn();
const mockGetTree = jest.fn();

const mockUserName = jest.fn();
const mockProjects = jest.fn();
const mockGroupsProjects = jest.fn();
const mockBranchesAll = jest.fn();
const mockBranchesCreate = jest.fn();
const mockGroupMembersShow = jest.fn();
const mockUsersCurrent = jest.fn();
const mockProjectMembersShow = jest.fn();
const mockRepositoriesTree = jest.fn();
const mockRepositoriesFiles = jest.fn();

jest.mock('@gitbeaker/browser', () => ({
  Gitlab: jest.fn().mockImplementation(() => (
    jest.fn().mockImplementation(() => ({
      Users: {
        username: mockUserName,
        projects: mockProjects,
        current: mockUsersCurrent,
      },
      Groups: {
        projects: mockGroupsProjects,
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
      rest: {
        users: {
          getAuthenticated: mockGetAuthenticated,
        },
        repos: {
          getCollaboratorPermissionLevel: mockGetCollaboratorPermissionLevel,
          getContent: mockGetContent,
        },
        git: {
          createTree: mockCreateTree,
          getTree: mockGetTree,
        },
      },
      git: {
        getRef: mockGetRef,
        createRef: mockCreateRef,
      },
      repos: {
        listBranches: mockListBranches,
        createOrUpdateFiles: mockCreateOrUpdateFiles,
      },
    }))
  )),
}));

describe('GitlubTokenStorage', () => {
  const storageProvider = new GitlabTokenStorage('', 'six7', 'figma-tokens');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
  });

  it('should assign projectId by groups', async () => {
    mockUserName.mockImplementationOnce(() => (
      Promise.resolve({
        data: []
      })
    ));

    mockGroupsProjects.mockImplementationOnce(() => (
      Promise.resolve({
        data: [{
          name: 'figma-tokens',
          id: 35102363,
          path: 'figma-tokens',
          namespace: {
            full_path: 'six7',
            id: 51634506,
          }
        }]
      })
    ))

    expect(
      await storageProvider.assignProjectId(),
    ).toEqual({
      projectId: 35102363,
      groupId: 51634506
    });
  });

  it('should fetch branches as a simple list', async () => {
    mockBranchesAll.mockImplementationOnce(() => (
      Promise.resolve({
        data: [
          { name: 'main' },
          { name: 'development' },
        ],
      })
    ));

    expect(
      await storageProvider.fetchBranches(),
    ).toEqual(
      ['main', 'development']
    );
  });

  it('should try to create a branch', async () => {
    mockBranchesCreate.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          ref: 'development',
        },
      })
    ))
    expect(await storageProvider.createBranch('development', 'main')).toBe(true);
    expect(mockBranchesCreate).toBeCalledWith(35102363, 'development', 'heads/main');
  });

  it('canWrite should return true if a collaborator using GroupMember', async () => {
    mockUsersCurrent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          id: 11289475,
          state: "active"
        },
      })
    ))
    mockGroupMembersShow.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          access_level: 50
        },
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockGroupMembersShow).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      username: 'six7',
    });
  });

  it('canWrite should return true if a collaborator using projectMember', async () => {
    mockUsersCurrent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          id: 11289475,
          state: "active"
        },
      })
    ))
    mockProjectMembersShow.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          access_level: 50
        },
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockProjectMembersShow).toBeCalledWith(35102363, 11289475);
  });

  it('canWrite should return false if not a collaborator', async () => {
    mockUsersCurrent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          id: 11289475,
          state: "active"
        },
      })
    ))
    mockGroupMembersShow.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          access_level: 20
        },
      })
    ));
    expect(await storageProvider.canWrite()).toBe(false);
    expect(mockGroupMembersShow).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      username: 'six7',
    });
  });

  it('can read from Git in single file format', async () => {

    mockRepositoriesTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: [],
      })
    ));

    storageProvider.changePath('data/tokens.json');
    mockRepositoriesFiles.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          red: {
            type: 'color',
            name: 'red',
            value: '#ff0000',
          },
          black: {
            type: 'color',
            name: 'black',
            value: '#000000',
          },
          '$themes': [
            {
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: 'enabled',
              },
            },
          ]
        },
      })
    ))
    expect(await storageProvider.read()).toEqual([
      {
        type: 'themes',
        path: 'data/tokens.json/$themes.json',
        data: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: 'enabled',
            },
          },
        ],
      },
      {
        name: 'global',
        type: 'tokenSet',
        path: 'data/tokens.json/global.json',
        data: {
          red: {
            type: 'color',
            name: 'red',
            value: '#ff0000',
          },
          black: {
            type: 'color',
            name: 'black',
            value: '#000000',
          },
        },
      },
    ]);
    expect(mockRepositoriesFiles).toBeCalledWith(35102363, 'data/tokens.json', { ref: 'main' });
  });

  it('can read from Git in a multifile format', async () => {
    storageProvider.enableMultiFile();

    mockRepositoriesTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: [
          {
            id: "b2ce0083a14576540b8eed3de53bc6d7a43e00e6",
            mode: "100644",
            name: "TeamBlue.json",
            path: "data/TeamBlue.json",
            type: "blob",
          },
          {
            id: "2beca94e215251642554df9360854640162651db",
            mode: "100644",
            name: "TeamGreen.json",
            path: "data/TeamGreen.json",
            type: "blob",
          },
          {
            id: "3d037ff17e986f4db21aabaefca3e3ddba113d85",
            mode: "100644",
            name: "$themes.json",
            path: "data/$themes.json",
            type: "blob",
          },
          {
            id: "8e2260ae05b4bca447cd2bd1757989fe59f07407",
            mode: "040000",
            name: "BZB",
            path: "data",
            type: "tree",
          }
        ],
      })
    ));

    mockRepositoriesFiles.mockImplementation((opts: { path: string }) => {
      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            {
              id: "b2ce0083a14576540b8eed3de53bc6d7a43e00e6",
              mode: "100644",
              name: "TeamBlue.json",
              path: "data/TeamBlue.json",
              type: "blob",
            },
            {
              id: "2beca94e215251642554df9360854640162651db",
              mode: "100644",
              name: "TeamGreen.json",
              path: "data/TeamGreen.json",
              type: "blob",
            },
            {
              id: "3d037ff17e986f4db21aabaefca3e3ddba113d85",
              mode: "100644",
              name: "$themes.json",
              path: "data/$themes.json",
              type: "blob",
            },
            {
              id: "8e2260ae05b4bca447cd2bd1757989fe59f07407",
              mode: "040000",
              name: "BZB",
              path: "data",
              type: "tree",
            }
          ],
        });
      }
    })


    mockRepositoriesFiles.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          tree: [
            {
              type: 'tree',
              path: 'data',
              sha: 'sha(data)',
            },
          ],
        },
      })
    ));

    mockGetTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          tree: [
            { path: '$themes.json', type: 'blob', sha: 'sha($themes.json)' },
            { path: 'global.json', type: 'blob', sha: 'sha(global.json)' },
          ],
        },
      })
    ));

    storageProvider.enableMultiFile();
    storageProvider.changePath('data');
    expect(await storageProvider.read()).toEqual([
      {
        path: '$themes.json',
        type: 'themes',
        data: [{
          id: 'light',
          name: 'Light',
          selectedTokenSets: {
            global: TokenSetStatus.ENABLED,
          },
        }],
      },
      {
        path: 'global.json',
        name: 'global',
        type: 'tokenSet',
        data: {
          red: {
            type: TokenTypes.COLOR,
            name: 'red',
            value: '#ff0000',
          },
        },
      },
    ]);

    mockGetContent.mockClear();
  });

  // it('should return an empty array when reading results in an error', async () => {
  //   mockGetContent.mockImplementationOnce(() => (
  //     Promise.reject(new Error())
  //   ));
  //   expect(await storageProvider.read()).toEqual([]);
  // });

  // it('should be able to write', async () => {
  //   mockListBranches.mockImplementationOnce(() => (
  //     Promise.resolve({
  //       data: [
  //         { name: 'main' },
  //       ],
  //     })
  //   ));
  //   mockCreateOrUpdateFiles.mockImplementationOnce(() => (
  //     Promise.resolve({
  //       data: {
  //         content: {},
  //       },
  //     })
  //   ));

  //   storageProvider.changePath('data/tokens.json');
  //   await storageProvider.write([
  //     {
  //       type: 'metadata',
  //       path: 'metadata.json',
  //       data: {
  //         commitMessage: 'Initial commit',
  //       },
  //     },
  //     {
  //       type: 'themes',
  //       path: '$themes.json',
  //       data: [
  //         {
  //           id: 'light',
  //           name: 'Light',
  //           selectedTokenSets: {
  //             global: TokenSetStatus.ENABLED,
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       type: 'tokenSet',
  //       name: 'global',
  //       path: 'global.json',
  //       data: {
  //         red: {
  //           type: TokenTypes.COLOR,
  //           name: 'red',
  //           value: '#ff0000',
  //         },
  //       },
  //     },
  //   ]);

  //   expect(mockCreateOrUpdateFiles).toBeCalledWith({
  //     branch: 'main',
  //     owner: 'six7',
  //     repo: 'figma-tokens',
  //     createBranch: false,
  //     changes: [
  //       {
  //         message: 'Initial commit',
  //         files: {
  //           'data/tokens.json': JSON.stringify({
  //             $themes: [
  //               {
  //                 id: 'light',
  //                 name: 'Light',
  //                 selectedTokenSets: {
  //                   global: TokenSetStatus.ENABLED,
  //                 },
  //               },
  //             ],
  //             global: {
  //               red: {
  //                 type: TokenTypes.COLOR,
  //                 name: 'red',
  //                 value: '#ff0000',
  //               },
  //             },
  //           }, null, 2),
  //         },
  //       },
  //     ],
  //   });
  // });

  // it('should be able to write a multifile structure', async () => {
  //   mockListBranches.mockImplementationOnce(() => (
  //     Promise.resolve({
  //       data: [
  //         { name: 'main' },
  //       ],
  //     })
  //   ));
  //   mockCreateOrUpdateFiles.mockImplementationOnce(() => (
  //     Promise.resolve({
  //       data: {
  //         content: {},
  //       },
  //     })
  //   ));

  //   storageProvider.enableMultiFile();
  //   storageProvider.changePath('data');
  //   await storageProvider.write([
  //     {
  //       type: 'metadata',
  //       path: 'metadata.json',
  //       data: {
  //         commitMessage: 'Initial commit',
  //       },
  //     },
  //     {
  //       type: 'themes',
  //       path: '$themes.json',
  //       data: [
  //         {
  //           id: 'light',
  //           name: 'Light',
  //           selectedTokenSets: {
  //             global: TokenSetStatus.ENABLED,
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       type: 'tokenSet',
  //       name: 'global',
  //       path: 'global.json',
  //       data: {
  //         red: {
  //           type: TokenTypes.COLOR,
  //           name: 'red',
  //           value: '#ff0000',
  //         },
  //       },
  //     },
  //   ]);

  //   expect(mockCreateOrUpdateFiles).toBeCalledWith({
  //     branch: 'main',
  //     owner: 'six7',
  //     repo: 'figma-tokens',
  //     createBranch: false,
  //     changes: [
  //       {
  //         message: 'Initial commit',
  //         files: {
  //           'data/$themes.json': JSON.stringify([
  //             {
  //               id: 'light',
  //               name: 'Light',
  //               selectedTokenSets: {
  //                 global: TokenSetStatus.ENABLED,
  //               },
  //             },
  //           ], null, 2),
  //           'data/global.json': JSON.stringify({
  //             red: {
  //               type: TokenTypes.COLOR,
  //               name: 'red',
  //               value: '#ff0000',
  //             },
  //           }, null, 2),
  //         },
  //       },
  //     ],
  //   });
  // });
});
