import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { GithubTokenStorage } from '../GithubTokenStorage';
import {
  mockCreateOrUpdateFiles,
  mockCreateRef,
  mockCreateTree,
  mockGetAuthenticated,
  mockGetCollaboratorPermissionLevel,
  mockGetContent,
  mockGetRef,
  mockGetTree,
  mockListBranches,
} from '../../../tests/__mocks__/octokitRestMock';
import { ErrorMessages } from '@/constants/ErrorMessages';

describe('GithubTokenStorage', () => {
  const storageProvider = new GithubTokenStorage('', 'six7', 'figma-tokens');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
    storageProvider.changePath('tokens.json');
  });

  it('should fetch branches as a simple list', async () => {
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
      headers: {
        'If-None-Match': '',
      },
    });
    expect(mockCreateRef).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      ref: 'refs/heads/development',
      sha: 'main-sha',
    });
  });

  it('should return false when creating a branch is failed', async () => {
    mockGetRef.mockImplementationOnce(() => (
      Promise.reject()
    ));
    expect(await storageProvider.createBranch('development', 'main')).toBe(false);
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
      headers: {
        'If-None-Match': '',
      },
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
      headers: {
        'If-None-Match': '',
      },
    });
  });

  it('canWrite should return false if filePath is a folder and multiFileSync flag is false', async () => {
    storageProvider.changePath('tokens');

    const canWrite = await storageProvider.canWrite();
    expect(canWrite).toBe(false);
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
      headers: {
        'If-None-Match': '',
      },
    });
  });

  it('can read from Git in single file format', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0sCiAgIiRtZXRhZGF0YSI6IHt9Cn0=',
        },
      })
    ));

    storageProvider.changePath('data/tokens.json');
    expect(await storageProvider.retrieve()).toEqual({
      status: 'success',
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
            type: 'color',
            name: 'red',
            value: '#ff0000',
          },
          {
            type: 'color',
            name: 'black',
            value: '#000000',
          },
        ],
      },
    });
    expect(mockGetContent).toBeCalledWith({
      owner: 'six7',
      repo: 'figma-tokens',
      path: 'data/tokens.json',
      ref: 'main',
      headers: {
        'If-None-Match': '',
      },
    });
  });

  it('should return error message about invalid data', async () => {
    storageProvider.changePath('data/tokens.json');
    mockGetContent.mockImplementation(() => (
      Promise.resolve({
        data: {
          content: 'RW1wdHkgZmlsZQ==',
        },
      })
    ));

    expect(await storageProvider.retrieve()).toEqual({
      status: 'failure',
      errorMessage: ErrorMessages.VALIDATION_ERROR,
    });
  });

  it('can handle invalid file content', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: 'RW1wdHkgZmlsZQ==',
        },
      })
    ));

    storageProvider.changePath('data/tokens.json');
    expect(await storageProvider.read()).toEqual({
      errorMessage: ErrorMessages.VALIDATION_ERROR,
    });
  });

  it('should empty array when there is no content', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {},
      })
    ));

    storageProvider.changePath('data/tokens.json');
    expect(await storageProvider.read()).toEqual([]);
  });

  it('can read from Git in a multifile format', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/$metadata.json', sha: 'sha(data/$metadata.json)', type: 'file' },
            { path: 'data/$themes.json', sha: 'sha(data/$themes.json)', type: 'file' },
            { path: 'data/global.json', sha: 'sha(data/global.json)', type: 'file' },
            { path: 'data/nest', sha: 'sha(data/nest)', type: 'dir' },
          ],
        });
      }

      if (opts.path === 'data/$metadata.json') {
        return Promise.resolve({
          data: {
            content: 'ewogICJ0b2tlblNldE9yZGVyIjogWyJnbG9iYWwiXQp9',
          },
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

      if (opts.path === 'data/nest') {
        return Promise.resolve({
          data: {},
        });
      }
      return Promise.reject();
    });

    mockCreateTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          sha: 'sha(data)',
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
          sha: 'sha(data)',
          tree: [
            { path: 'data/$metadata.json', type: 'blob', sha: 'sha($metadata.json)' },
            { path: 'data/$themes.json', type: 'blob', sha: 'sha($themes.json)' },
            { path: 'data/global.json', type: 'blob', sha: 'sha(global.json)' },
          ],
        },
      })
    ));

    storageProvider.enableMultiFile();
    storageProvider.changePath('data');
    expect(await storageProvider.read()).toEqual([
      {
        path: 'data/$metadata.json',
        type: 'metadata',
        data: {
          tokenSetOrder: ['global'],
        },
      },
      {
        path: 'data/$themes.json',
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
        path: 'data/global.json',
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

  it('can read from Git in a multifile format and return empty array when there is no content', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/empty.json', sha: 'sha(data/empty.json)', type: 'file' },
          ],
        });
      }

      if (opts.path === 'data/empty.json') {
        return Promise.resolve({
          data: {},
        });
      }

      return Promise.reject();
    });

    mockCreateTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          sha: 'sha(data)',
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
          sha: 'sha(data)',
          tree: [
            { path: 'data/empty.json', type: 'blob', sha: 'sha(empty.json)' },
          ],
        },
      })
    ));

    storageProvider.enableMultiFile();
    storageProvider.changePath('data');
    expect(await storageProvider.read()).toEqual([]);

    mockGetContent.mockClear();
  });

  it('can read from organization gitHub account in a multifile format when parent directory has multiple directory', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === '') {
        return Promise.resolve({
          data: [
            { path: 'data', sha: 'sha(data)', type: 'dir' },
          ],
        });
      }

      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/$metadata.json', sha: 'sha(data/$metadata.json)', type: 'file' },
            { path: 'data/$themes.json', sha: 'sha(data/$themes.json)', type: 'file' },
            { path: 'data/global.json', sha: 'sha(data/global.json)', type: 'file' },
          ],
        });
      }

      if (opts.path === 'data/$metadata.json') {
        return Promise.resolve({
          data: {
            content: 'ewogICJ0b2tlblNldE9yZGVyIjogWyJnbG9iYWwiXQp9',
          },
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
      Promise.reject()
    ));

    mockGetTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          sha: 'sha(data)',
          tree: [
            { path: 'data/$metadata.json', type: 'blob', sha: 'sha($metadata.json)' },
            { path: 'data/$themes.json', type: 'blob', sha: 'sha($themes.json)' },
            { path: 'data/global.json', type: 'blob', sha: 'sha(global.json)' },
          ],
        },
      })
    ));

    storageProvider.enableMultiFile();
    storageProvider.changePath('data');
    expect(await storageProvider.read()).toEqual([
      {
        path: 'data/$metadata.json',
        type: 'metadata',
        data: {
          tokenSetOrder: ['global'],
        },
      },
      {
        path: 'data/$themes.json',
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
        path: 'data/global.json',
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

  it('can read from organization gitHub account in a multifile format when parent directory has only one directory', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === '') {
        return Promise.resolve({
          data: { path: 'data', sha: 'sha(data)', type: 'dir' },
        });
      }

      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/$metadata.json', sha: 'sha(data/$metadata.json)', type: 'file' },
            { path: 'data/$themes.json', sha: 'sha(data/$themes.json)', type: 'file' },
            { path: 'data/global.json', sha: 'sha(data/global.json)', type: 'file' },
          ],
        });
      }

      if (opts.path === 'data/$metadata.json') {
        return Promise.resolve({
          data: {
            content: 'ewogICJ0b2tlblNldE9yZGVyIjogWyJnbG9iYWwiXQp9',
          },
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
      Promise.reject()
    ));

    mockGetTree.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          sha: 'sha(data)',
          tree: [
            { path: 'data/$metadata.json', type: 'blob', sha: 'sha($metadata.json)' },
            { path: 'data/$themes.json', type: 'blob', sha: 'sha($themes.json)' },
            { path: 'data/global.json', type: 'blob', sha: 'sha(global.json)' },
          ],
        },
      })
    ));

    storageProvider.enableMultiFile();
    storageProvider.changePath('data');
    expect(await storageProvider.read()).toEqual([
      {
        path: 'data/$metadata.json',
        type: 'metadata',
        data: {
          tokenSetOrder: ['global'],
        },
      },
      {
        path: 'data/$themes.json',
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
        path: 'data/global.json',
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
    mockGetContent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==',
        },
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
    await storageProvider.save({
      themes: [{
        id: 'light',
        name: 'Light',
        selectedTokenSets: {
          global: TokenSetStatus.ENABLED,
        },
      }],
      tokens: {
        global: [
          {
            type: TokenTypes.COLOR,
            name: 'red',
            value: '#ff0000',
          },
        ],
      },
      metadata: {
        tokenSetOrder: ['global'],
      },
    }, {
      commitMessage: 'Initial commit',
    });

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
              global: {
                red: {
                  type: TokenTypes.COLOR,
                  value: '#ff0000',
                },
              },
              $themes: [
                {
                  id: 'light',
                  name: 'Light',
                  selectedTokenSets: {
                    global: TokenSetStatus.ENABLED,
                  },
                },
              ],
              $metadata: {
                tokenSetOrder: ['global'],
              },
            }, null, 2),
          },
          filesToDelete: undefined,
          ignoreDeletionFailures: undefined,
        },
      ],
    });
  });

  it('should not be able to write a multifile structure when multifile flag is off', async () => {
    mockCreateOrUpdateFiles.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: {},
        },
      })
    ));

    storageProvider.disableMultiFile();
    storageProvider.changePath('data');

    await expect(async () => {
      await storageProvider.write([
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
      ], {
        commitMessage: '',
      });
    }).rejects.toThrow('Multi-file storage is not enabled');
    expect(mockCreateOrUpdateFiles).not.toHaveBeenCalled();
  });

  it('should be able to write a multifile structure', async () => {
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
    ], {
    });

    expect(mockCreateOrUpdateFiles).toBeCalledWith({
      branch: 'main',
      owner: 'six7',
      repo: 'figma-tokens',
      createBranch: false,
      changes: [
        {
          message: 'Commit from Figma',
          filesToDelete: undefined,
          ignoreDeletionFailures: undefined,
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

  it('should be able to rename and delete', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.resolve({
        data: {
          content: 'ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==',
        },
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
      {
        type: 'tokenSet',
        name: 'core-rename',
        path: 'global.json',
        data: {
          red: {
            type: TokenTypes.COLOR,
            name: 'red',
            value: '#ff0000',
          },
        },
      },
    ], {
      commitMessage: 'Initial commit',
    });

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
              $metadata: {},
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
              'core-rename': {
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

  it('should be able to rename and delete a multifile structure', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/$themes.json', sha: 'sha(data/$themes.json)', type: 'file' },
            { path: 'data/global.json', sha: 'sha(data/global.json)', type: 'file' },
            { path: 'data/core.json', sha: 'sha(data/core.json)', type: 'file' },
            { path: 'data/internal.json', sha: 'sha(data/internal.json)', type: 'file' },
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

      if (opts.path === 'data/core.json') {
        return Promise.resolve({
          data: {
            content: 'ewogICJyZWQiOiB7CiAgICAidHlwZSI6ICJjb2xvciIsCiAgICAibmFtZSI6ICJyZWQiLAogICAgInZhbHVlIjogIiNmZjAwMDAiCiAgfQp9',
          },
        });
      }

      if (opts.path === 'data/internal.json') {
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
          sha: 'sha(data)',
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
          sha: 'sha(data)',
          tree: [
            { path: '$themes.json', type: 'blob', sha: 'sha($themes.json)' },
            { path: 'global.json', type: 'blob', sha: 'sha(global.json)' },
            { path: 'core.json', type: 'blob', sha: 'sha(core.json)' },
            { path: 'internal.json', type: 'blob', sha: 'sha(internal.json)' },
          ],
        },
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
      {
        type: 'tokenSet',
        name: 'core-rename',
        path: 'core-rename.json',
        data: {
          red: {
            type: TokenTypes.COLOR,
            name: 'red',
            value: '#ff0000',
          },
        },
      },
    ], {
      commitMessage: 'Initial commit',
    });

    expect(mockCreateOrUpdateFiles).toBeCalledTimes(1);
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
            'data/core-rename.json': JSON.stringify({
              red: {
                type: TokenTypes.COLOR,
                name: 'red',
                value: '#ff0000',
              },
            }, null, 2),
          },
          filesToDelete: ['data/core.json', 'data/internal.json'],
          ignoreDeletionFailures: true,

        },
      ],
    });
  });

  it('couldnt be able to rename and delete a multifile structure when there is no tree', async () => {
    mockGetContent.mockImplementation((opts: { path: string }) => {
      if (opts.path === 'data') {
        return Promise.resolve({
          data: [
            { path: 'data/$themes.json', sha: 'sha(data/$themes.json)', type: 'file' },
            { path: 'data/global.json', sha: 'sha(data/global.json)', type: 'file' },
            { path: 'data/core.json', sha: 'sha(data/core.json)', type: 'file' },
            { path: 'data/internal.json', sha: 'sha(data/internal.json)', type: 'file' },
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

      if (opts.path === 'data/core.json') {
        return Promise.resolve({
          data: {
            content: 'ewogICJyZWQiOiB7CiAgICAidHlwZSI6ICJjb2xvciIsCiAgICAibmFtZSI6ICJyZWQiLAogICAgInZhbHVlIjogIiNmZjAwMDAiCiAgfQp9',
          },
        });
      }

      if (opts.path === 'data/internal.json') {
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
          sha: 'sha(data)',
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
          sha: 'sha(data)',
          tree: [],
        },
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
        path: '$metadata.json',
        data: {
          tokenSetOrder: ['global'],
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
      {
        type: 'tokenSet',
        name: 'core-rename',
        path: 'core-rename.json',
        data: {
          red: {
            type: TokenTypes.COLOR,
            name: 'red',
            value: '#ff0000',
          },
        },
      },
    ], {
      commitMessage: 'Initial commit',
    });

    expect(mockCreateOrUpdateFiles).toBeCalledTimes(1);
    expect(mockCreateOrUpdateFiles).toBeCalledWith({
      branch: 'main',
      owner: 'six7',
      repo: 'figma-tokens',
      createBranch: false,
      changes: [
        {
          message: 'Initial commit',
          files: {
            'data/$metadata.json': JSON.stringify({
              tokenSetOrder: ['global'],
            }, null, 2),
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
            'data/core-rename.json': JSON.stringify({
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

  it('should be able to write even though reading results in an error', async () => {
    mockGetContent.mockImplementationOnce(() => (
      Promise.reject(new Error())
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
    ], {
      commitMessage: 'Initial commit',
    });

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

  it('should return false if there are no branches', async () => {
    mockListBranches.mockImplementationOnce(() => (
      Promise.resolve({
        data: [],
      })
    ));

    expect(await storageProvider.write([], {
      commitMessage: '',
    })).toBe(false);
  });
});
