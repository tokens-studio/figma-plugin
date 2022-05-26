/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getGithubCreatePullRequestUrl({
  base = 'https://github.com', repo, branch,
}: {
  base?: string,
  repo: string,
  branch?: string
}) {
  return `${base}/${repo}/compare/${branch}?expand=1`;
}
