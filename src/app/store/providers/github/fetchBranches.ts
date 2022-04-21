import { Octokit } from '@octokit/rest';
import type { ContextObject } from '@/types/api';

type Options = {
  context: ContextObject
  owner: string
  repo: string
};

export const fetchBranches = async ({ context, owner, repo }: Options) => {
  const octokit = new Octokit({ auth: context.secret, baseUrl: context.baseUrl });
  const branches = await octokit.repos
    .listBranches({ owner, repo })
    .then((response) => response.data);
  return branches.map((branch) => branch.name);
};
