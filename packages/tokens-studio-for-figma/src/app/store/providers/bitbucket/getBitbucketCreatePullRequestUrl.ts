/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getBitbucketCreatePullRequestUrl({
  base,
  repo,
  branch,
}: {
  base?: string;
  repo: string;
  branch?: string;
}) {
  const baseUrl = base && base !== '' ? base : 'https://bitbucket.org/';

  return `${baseUrl}/${repo}/pull-requests/new?source=${branch}`;
}
