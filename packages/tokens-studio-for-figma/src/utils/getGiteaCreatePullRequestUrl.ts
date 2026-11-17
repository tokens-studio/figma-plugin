import { getGiteaCompareUrl } from '@/storage/gitea';

export function getGiteaCreatePullRequestUrl({
  baseUrl, id, branch, defaultBranch,
}: { baseUrl?: string; id: string; branch: string; defaultBranch?: string }) {
  if (!baseUrl) return '';
  const [owner, repository] = id.split('/');
  const compareUrl = defaultBranch
    ? getGiteaCompareUrl(baseUrl, owner, repository, defaultBranch, branch)
    : getGiteaCompareUrl(baseUrl, owner, repository, branch);
  return `${compareUrl}?expand=1`;
}
