import type { BranchLifecycle, BranchPullOptions } from '@/types/BranchLifecycle';
import type { RemoteResponseData } from '@/types/RemoteResponseData';
import type { GiteaCredentials } from './gitea';
import type { PushOverrides } from '../../remoteTokens';
import { ErrorMessages } from '@/constants/ErrorMessages';

type Operations = {
  pull: (options: BranchPullOptions & { context: GiteaCredentials; updateLocalTokens: boolean; skipConfirmation: boolean }) => Promise<RemoteResponseData | null>;
  push: (context: GiteaCredentials, overrides?: PushOverrides) => Promise<RemoteResponseData>;
  create: (context: GiteaCredentials, branch: string, source?: string) => Promise<boolean>;
  branches: (context: GiteaCredentials) => Promise<string[]>;
};

export function createGiteaBranchLifecycle(context: GiteaCredentials, operations: Operations): BranchLifecycle {
  const switchBranch: BranchLifecycle['switchBranch'] = (branch, options) => operations.pull({
    ...options, context: { ...context, branch }, updateLocalTokens: true, skipConfirmation: true,
  });
  return {
    switchBranch,
    async createAndSyncBranch(branch, source, currentChanges, options) {
      const created = await operations.create(context, branch, source);
      if (!created) return { data: { status: 'failure', errorMessage: ErrorMessages.GENERAL_CONNECTION_ERROR }, branches: [] };
      // Current changes branch from the current source: retain the saved SHA so
      // remote changes since the last sync still cause a conflict.
      const data = currentChanges
        ? await operations.push({ ...context, branch }, { branch, commitMessage: '' })
        : await switchBranch(branch, options);
      if (data?.status !== 'success') return { data, branches: [] };
      const branches = await operations.branches(context).catch(() => [branch]);
      return { data, branches: branches.includes(branch) ? branches : [...branches, branch] };
    },
  };
}
