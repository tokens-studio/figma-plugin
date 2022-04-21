import type { Octokit } from '@octokit/rest';
import { AnyTokenSet } from '@/types/tokens';
import { FeatureFlagOpts } from './FeatureFlagOpts';
import { extractFiles } from './extractFiles';

export const createOrUpdateFiles = (
  octokit: Octokit,
  context: {
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
    tokenObj: Record<string, AnyTokenSet>;
    createNewBranch: boolean;
    commitMessage?: string;
  },
  opts: FeatureFlagOpts,
) => {
  const files = extractFiles(context.filePath, context.tokenObj, opts);

  // @README createOrUpdateFiles is a method supplied by a plugin
  return (octokit.repos as any).createOrUpdateFiles({
    owner: context.owner,
    repo: context.repo,
    branch: context.branch,
    createBranch: context.createNewBranch,
    changes: [{ message: context.commitMessage || 'Commit from Figma', files }],
  });
};
