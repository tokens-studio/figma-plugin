import { getGiteaCreatePullRequestUrl } from '../getGiteaCreatePullRequestUrl';

describe('Gitea pull request link', () => {
  it('preserves an installation subpath and encodes branches', () => {
    expect(getGiteaCreatePullRequestUrl({
      baseUrl: 'https://git.example.com/gitea/',
      id: 'owner/repo',
      branch: 'feature/design tokens',
      defaultBranch: 'develop',
    })).toBe('https://git.example.com/gitea/owner/repo/compare/develop...feature%2Fdesign%20tokens?expand=1');
  });

  it('lets Gitea select the default branch when unavailable', () => {
    expect(getGiteaCreatePullRequestUrl({
      baseUrl: 'https://git.example.com/gitea', id: 'owner/repo', branch: 'feature',
    })).toBe('https://git.example.com/gitea/owner/repo/compare/feature?expand=1');
  });
});
