import { GitlabTokenStorage } from '@/storage/GitlabTokenStorage';
import { clientFactory, GitlabCredentials } from '../gitlab';

const mockChangePath = jest.fn();
const mockEnableMultiFile = jest.fn();
const mockSelectBranch = jest.fn();
const mockAssignProjectId = jest.fn(() => ({}));

jest.mock('@/storage/GitlabTokenStorage', () => ({
  GitlabTokenStorage: jest.fn().mockImplementation(() => ({
    changePath: mockChangePath,
    enableMultiFile: mockEnableMultiFile,
    selectBranch: mockSelectBranch,
    assignProjectId: mockAssignProjectId,
  }
  )),
}));

describe('gitlab client factory', () => {
  it('should pass the right params to gitlabtoken storage', async () => {
    const repositoryId = 'test-repo-id';
    const secret = 'test-secret';
    const baseUrl = 'test-url';
    const fullPath = `namespace/${repositoryId}`;
    const context = {
      id: fullPath,
      secret,
      baseUrl,
    } as unknown as GitlabCredentials;
    await clientFactory(context, false);

    expect(GitlabTokenStorage).toHaveBeenCalledWith(secret, repositoryId, fullPath, baseUrl);
  });

  it('should call change path if there is a filepath', async () => {
    const testFilePath = 'test-filepath';
    const context = {
      filePath: testFilePath,
    } as unknown as GitlabCredentials;
    await clientFactory(context, false);

    expect(mockChangePath).toHaveBeenLastCalledWith(testFilePath);
  });

  it('should call selectBranch if there is a branch', async () => {
    const testBranch = 'main';
    const context = {
      branch: testBranch,
    } as unknown as GitlabCredentials;
    await clientFactory(context, false);

    expect(mockSelectBranch).toHaveBeenLastCalledWith(testBranch);
  });

  it('should call enable multi file if the flag is true', async () => {
    const context = {} as unknown as GitlabCredentials;
    await clientFactory(context, true);

    expect(mockEnableMultiFile).toHaveBeenCalled();
  });

  it('should call assign project id and return its value', async () => {
    const context = {} as unknown as GitlabCredentials;
    const result = await clientFactory(context, true);

    expect(mockAssignProjectId).toHaveBeenCalled();
    expect(result).toMatchObject({});
  });
});
