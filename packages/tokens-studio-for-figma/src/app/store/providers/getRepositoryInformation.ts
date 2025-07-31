export function getRepositoryInformation(repository: string): { ownerId: string, repositoryId: string } {
  let repositoryId = '';
  let ownerId = '';

  if (repository && typeof repository === 'string') {
    const values = repository.split('/');
    repositoryId = values[values.length - 1];
    ([ownerId] = values);
  }

  return {
    repositoryId,
    ownerId,
  };
}
