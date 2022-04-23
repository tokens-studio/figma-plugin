/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getGithubCreatePullRequestUrl(id: string, branchName: string) {
  return `https://github.com/${id}/compare/${branchName}?expand=1`;
}
