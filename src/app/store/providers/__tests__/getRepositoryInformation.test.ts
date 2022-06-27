import { getRepositoryInformation } from '../getRepositoryInformation';

describe('Get repository info from string', () => {
  const testOwner = 'test-owner';
  const testRepo = 'test-repo';

  it('Should return the owner and repository from simple repo', () => {
    const { ownerId, repositoryId } = getRepositoryInformation(`${testOwner}/${testRepo}`);
    expect(ownerId).toBe(testOwner);
    expect(repositoryId).toBe(testRepo);
  });

  it('Should return the owner and repository from sub groups repo', () => {
    const { ownerId, repositoryId } = getRepositoryInformation(`${testOwner}/subgroup/${testRepo}`);
    expect(ownerId).toBe(testOwner);
    expect(repositoryId).toBe(testRepo);
  });
});
