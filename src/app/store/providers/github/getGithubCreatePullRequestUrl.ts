/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getGithubCreatePullRequestUrl({
  base = 'https://github.com', repo, branch,
}: {
  base?: string,
  repo: string,
  branch?: string
}) {
  // We need to remove the `api/v3` part of the URL for GHE instances
  const baseUrl = base.replace('/api/v3', '');

  return `${baseUrl}/${repo}/compare/${branch}?expand=1`;
}
