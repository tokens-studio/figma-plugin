/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getGitlabCreatePullRequestUrl({
  owner, repo,
}: {
  owner: string,
  repo: string
}) {
  return `https://gitlab.com/${owner}/${repo}/-/merge_requests/new`;
}
