/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getGitlabCreatePullRequestUrl(
  id: string,
) {
  return `https://gitlab.com/${id}/-/merge_requests/new`;
}
