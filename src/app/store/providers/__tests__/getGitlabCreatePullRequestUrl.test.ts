import { getGitlabCreatePullRequestUrl } from '../gitlab';

describe('Get gitlab create new pull request url', () => {
  it('should return the default url if there is no base argument given', () => {
    const id = 'owner/project';

    const expectedUrl = `https://gitlab.com/${id}/-/merge_requests/new`;
    const url = getGitlabCreatePullRequestUrl(id);

    expect(url).toBe(expectedUrl);
  });

  it('should return the url with the baseurl if there is a base argument given', () => {
    const id = 'owner/project';
    const baseUrl = 'https://gitlab.companydomain.com';

    const expectedUrl = `${baseUrl}/${id}/-/merge_requests/new`;
    const url = getGitlabCreatePullRequestUrl(id, baseUrl);

    expect(url).toBe(expectedUrl);
  });
});
