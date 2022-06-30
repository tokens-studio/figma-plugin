export const mockGetRef = jest.fn();
export const mockCreateRef = jest.fn();
export const mockListBranches = jest.fn();
export const mockGetAuthenticated = jest.fn(() => Promise.resolve({
  data: {},
}));
export const mockGetCollaboratorPermissionLevel = jest.fn();
export const mockGetContent = jest.fn();
export const mockCreateOrUpdateFiles = jest.fn();
export const mockCreateTree = jest.fn();
export const mockGetTree = jest.fn();

mockListBranches.mockImplementationOnce(() => (
  Promise.resolve({
    data: [
      { name: 'main' },
      { name: 'development' },
    ],
  })
));

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
