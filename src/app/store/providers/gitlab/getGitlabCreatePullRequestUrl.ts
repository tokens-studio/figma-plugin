/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getGitlabCreatePullRequestUrl(
  id: string,
  base?: string,
) {
  const baseUrl = base || 'https://gitlab.com';

  return `${baseUrl}/${id}/-/merge_requests/new`;
}
