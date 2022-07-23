// import { TokenTypes } from '@/constants/TokenTypes';
// import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { BitbucketTokenStorage } from '../BitbucketTokenStorage';

const mockListBranches = jest.fn();
const mockCanWrite = jest.fn();
const mockCreateOrUpdateFiles = jest.fn();
const mockGetAuthedUser = jest.fn();
const mockListPermissions = jest.fn();
const mockCreateSrcFileCommit = jest.fn();

jest.mock('bitbucket', () => ({
  Bitbucket: jest.fn().mockImplementation(() => ({
    users: {
      canWrite: mockCanWrite,
      getAuthedUser: mockGetAuthedUser,
    },
    repositories: {
      listBranches: mockListBranches,
      createOrUpdateFiles: mockCreateOrUpdateFiles,
      listPermissions: mockListPermissions,
      createSrcFileCommit: mockCreateSrcFileCommit,
    },
  })),
}));

describe('BitbucketTokenStorage', () => {
  const storageProvider = new BitbucketTokenStorage('', 'MattOliver', 'figma-tokens-testing');
  storageProvider.selectBranch('main');

  beforeEach(() => {
    storageProvider.disableMultiFile();
  });

  it('canWrite should return false if unauthenticated', async () => {
    mockGetAuthedUser.mockImplementationOnce(() => Promise.resolve({
      data: {
        values: [
          {
            permission: '' || 'read',
          },
        ],
      },
    }));

    expect(await storageProvider.canWrite()).toBe(false);
  });

  it('canWrite should return true if user has admin or write permissions', async () => {
    mockGetAuthedUser.mockImplementationOnce(() => Promise.resolve({
      data: { account_id: '123' },
    }));
    mockListPermissions.mockImplementationOnce(() => Promise.resolve({
      data: { values: [{ permission: 'admin' }] },
    }));

    expect(await storageProvider.canWrite()).toBe(true);
  });

  it('listBranches should fetch branches as a simple list', async () => {
    mockListBranches.mockImplementationOnce(() => Promise.resolve({ data: { values: [{ name: 'main' }, { name: 'different-branch' }] } }));

    expect(await storageProvider.fetchBranches()).toEqual(['main', 'different-branch']);
  });

  // it('should be able to write', async () => {
  //   mockListBranches.mockImplementationOnce(() => Promise.resolve({
  //     data: { values: [{ name: 'main' }] },
  //   }));

  //   mockCreateOrUpdateFiles.mockImplementationOnce(() => Promise.resolve({
  //     owner: 'MattOliver',
  //     repo: 'figma-tokens-testing',
  //     branch: 'main',
  //     changes: [
  //       {
  //         message: 'Initial commit',
  //         files: {
  //           'data/tokens.json':
  //               '{\n'
  //               + '  "$themes": [\n'
  //               + '    {\n'
  //               + '      "id": "light",\n'
  //               + '      "name": "Light",\n'
  //               + '      "selectedTokenSets": {\n'
  //               + '        "global": "enabled"\n'
  //               + '      }\n'
  //               + '    }\n'
  //               + '  ],\n'
  //               + '  "global": {\n'
  //               + '    "red": {\n'
  //               + '      "type": "color",\n'
  //               + '      "name": "red",\n'
  //               + '      "value": "#ff0000"\n'
  //               + '    }\n'
  //               + '  }\n'
  //               + '}',
  //         },
  //       },
  //     ],
  //   }));

  //   storageProvider.changePath('data/tokens.json');
  //   await storageProvider.write([
  //     {
  //       type: 'metadata',
  //       path: '$metadata.json',
  //       data: {},
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
  //   ], {
  //     commitMessage: '',
  //   });

  //   expect(mockCreateOrUpdateFiles).toBeCalledWith({
  //     branch: 'main',
  //     owner: 'MattOliver',
  //     repo: 'figma-tokens-testing',
  //     createBranch: false,
  //     changes: [
  //       {
  //         message: 'Initial commit',
  //         files: {
  //           'data/tokens.json': JSON.stringify(
  //             {
  //               $themes: [
  //                 {
  //                   id: 'light',
  //                   name: 'Light',
  //                   selectedTokenSets: {
  //                     global: TokenSetStatus.ENABLED,
  //                   },
  //                 },
  //               ],
  //               global: {
  //                 red: {
  //                   type: TokenTypes.COLOR,
  //                   name: 'red',
  //                   value: '#ff0000',
  //                 },
  //               },
  //             },
  //             null,
  //             2,
  //           ),
  //         },
  //       },
  //     ],
  //   });
  // });
  // it('fetchBranches should return a flattened list of all paginated branches', async () => {
  //   // TODO
  //   expect((await 1) + 1).toEqual(3);
  // });
  // it('should try to create a branch', async () => {
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
