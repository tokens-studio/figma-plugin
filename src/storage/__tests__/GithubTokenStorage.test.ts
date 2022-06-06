import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { GithubTokenStorage } from '../GithubTokenStorage';

const mockGetRef = jest.fn();
const mockCreateRef = jest.fn();
const mockListBranches = jest.fn();
const mockGetAuthenticated = jest.fn();
const mockGetCollaboratorPermissionLevel = jest.fn();
const mockGetContent = jest.fn();
const mockCreateOrUpdateFiles = jest.fn();
const mockCreateTree = jest.fn();
const mockGetTree = jest.fn();

jest.mock('@octokit/rest', () => ({
  Octokit: {
    plugin: jest.fn().mockImplementation(() => (
      jest.fn().mockImplementation(() => ({
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
  },
}));

describe('GithubTokenStorage', () => {
  const storageProvider = new GithubTokenStorage('', 'six7', 'figma-tokens');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
  });

  it('should fetch branches as a simple list', async () => {
    mockListBranches.mockImplementationOnce(() => (
      Promise.resolve({
        data: [
          { name: 'main' },
          { name: 'development' },
        ],
      })
    ));

    expect(
      await storageProvider.fetchBranches(),
    ).toEqual(['main', 'development']);
  });

  it('should try to create a branch', async () => {
    mockGetRef.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          object: {
            sha: 'main-sha',
          },
        },
      })
    ));

    mockCreateRef.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          ref: 'development',
        },
      })
    ));

    expect(await storageProvider.createBranch('development', 'main')).toBe(true);
    expect(mockGetRef).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      ref: 'heads/main',
    });
    expect(mockCreateRef).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      ref: 'refs/heads/development',
      sha: 'main-sha',
    });
  });

  it('canWrite should return false if unauthenticated', async () => {
    mockGetAuthenticated.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          login: '',
        },
      })
    ));

    expect(await storageProvider.canWrite()).toBe(false);
  });

  it('canWrite should return false if not a collaborator', async () => {
    mockGetAuthenticated.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          login: 'six7',
        },
      })
    ));
    mockGetCollaboratorPermissionLevel.mockImplementationOnce(() => (
      Promise.resolve(null)
    ));
    expect(await storageProvider.canWrite()).toBe(false);
    expect(mockGetCollaboratorPermissionLevel).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      username: 'six7',
    });
  });

  it('canWrite should return false if it wasnt possible to fetch collaboration level', async () => {
    mockGetAuthenticated.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          login: 'six7',
        },
      })
    ));
    mockGetCollaboratorPermissionLevel.mockImplementationOnce(() => {
      throw new Error('Could not fetch collaboration level');
    });
    expect(await storageProvider.canWrite()).toBe(false);
    expect(mockGetCollaboratorPermissionLevel).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      username: 'six7',
    });
  });

  it('canWrite should return true if a collaborator', async () => {
    mockGetAuthenticated.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          login: 'six7',
        },
      })
    ));
    mockGetCollaboratorPermissionLevel.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          user: { id: 'six7' },
          permission: 'collaborator',
        },
      })
    ));
    expect(await storageProvider.canWrite()).toBe(true);
    expect(mockGetCollaboratorPermissionLevel).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      username: 'six7',
    });
  });

  it('can read from Git in single file format', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==',
        },
      })
    ));

    storageProvider.changePath('data/tokens.json');
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
    expect(mockGetContent).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      path: 'data/tokens.json',
      ref: 'main',
    });
  });

  it('can read from Git in a multifile format', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/$themes.json', sha: 'sha(data/$themes.json)', type: 'file' },
            { path: 'data/global.json', sha: 'sha(data/global.json)', type: 'file' },
          ],
        });
      }

      if (opts.path === 'data/$themes.json') {
        return Promise.resolve({
          data: {
            content: 'WwogIHsKICAgICJpZCI6ICJsaWdodCIsCiAgICAibmFtZSI6ICJMaWdodCIsCiAgICAic2VsZWN0ZWRUb2tlblNldHMiOiB7CiAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgIH0KICB9Cl0=',
          },
        });
      }

      if (opts.path === 'data/global.json') {
        return Promise.resolve({
          data: {
            content: 'ewogICJyZWQiOiB7CiAgICAidHlwZSI6ICJjb2xvciIsCiAgICAibmFtZSI6ICJyZWQiLAogICAgInZhbHVlIjogIiNmZjAwMDAiCiAgfQp9',
          },
        });
      }

      return Promise.reject();
    });

    mockCreateTree.mockImplementationOnce(() => (
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

  it('should return an empty array when reading results in an error', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.reject(new Error())
    ));
    expect(await storageProvider.read()).toEqual([]);
  });

  it('should be able to write', async () => {
    mockListBranches.mockImplementationOnce(() => (
      Promise.resolve({
        data: [
          { name: 'main' },
        ],
      })
    ));
    mockCreateOrUpdateFiles.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: {},
        },
      })
    ));

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
      owner: 'six7',
      repo: 'figma-tokens',
      createBranch: false,
      changes: [
        {
          message: 'Initial commit',
          files: {
            'data/tokens.json': JSON.stringify({
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
            }, null, 2),
          },
        },
      ],
    });
  });

  it('should be able to write a multifile structure', async () => {
    mockListBranches.mockImplementationOnce(() => (
      Promise.resolve({
        data: [
          { name: 'main' },
        ],
      })
    ));
    mockCreateOrUpdateFiles.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: {},
        },
      })
    ));

    storageProvider.enableMultiFile();
    storageProvider.changePath('data');
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
      owner: 'six7',
      repo: 'figma-tokens',
      createBranch: false,
      changes: [
        {
          message: 'Initial commit',
          files: {
            'data/$themes.json': JSON.stringify([
              {
                id: 'light',
                name: 'Light',
                selectedTokenSets: {
                  global: TokenSetStatus.ENABLED,
                },
              },
            ], null, 2),
            'data/global.json': JSON.stringify({
              red: {
                type: TokenTypes.COLOR,
                name: 'red',
                value: '#ff0000',
              },
            }, null, 2),
          },
        },
      ],
    });
  });
});
