export const mockGetAuthedUser = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {},
  });
});

export const mockListPermissions = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {
      values: [],
    },
  });
});

export const mockListBranches = jest.fn(() =>
  Promise.resolve({
    data: {
      values: [{ name: 'main' }, { name: 'different-branch' }],
    },
  }),
);

export const mockCreateOrUpdateFiles = jest.fn(() =>
  Promise.resolve({
    branch: 'main',
    owner: 'MattOliver',
    repo: 'figma-tokens-testing',
    createBranch: false,
    changes: [
      {
        message: 'Initial commit',
        files: {
          '$metadata.json': '{}',
        },
      },
      {
        message: 'Initial commit',
        files: {
          '$themes.json': JSON.stringify([
            {
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: 'enabled',
              },
            },
          ]),
        },
      },
      {
        message: 'Initial commit',
        files: {
          'global.json': JSON.stringify({
            red: {
              type: 'color',
              name: 'red',
              value: '#ff0000',
            },
          }),
        },
      },
    ],
  }),
);

export const mockCreateSrcFileCommit = jest.fn();

export const mockFetchBranches = jest.fn();
export const mockCreateBranch = jest.fn().mockImplementation((_args) => {
  return Promise.resolve({
    data: {
      ref: 'refs/new-branch',
    },
  });
});
export const mockcanWrite = jest.fn();
export const mockRead = jest.fn(() =>
  Promise.resolve({
    branch: 'main',
    owner: 'MattOliver',
    repo: 'figma-tokens-testing',
    createBranch: false,
    changes: [
      {
        message: 'Initial commit',
        files: {
          '$metadata.json': '{}',
        },
      },
      {
        message: 'Initial commit',
        files: {
          '$themes.json': JSON.stringify([
            {
              id: 'light',
              name: 'Light',
              selectedTokenSets: {
                global: 'enabled',
              },
            },
          ]),
        },
      },
      {
        message: 'Initial commit',
        files: {
          'global.json': JSON.stringify({
            red: {
              type: 'color',
              name: 'red',
              value: '#ff0000',
            },
          }),
        },
      },
    ],
  }),
);

export const mockWriteChangeset = jest.fn();

jest.mock('bitbucket', () => {
  return {
    Bitbucket: jest.fn().mockImplementation(() => {
      return {
        users: {
          getAuthedUser: mockGetAuthedUser,
        },
        repositories: {
          listBranches: mockListBranches,
          createBranch: mockCreateBranch,
          listPermissions: mockListPermissions,
        },
      };
    }),
  };
});
