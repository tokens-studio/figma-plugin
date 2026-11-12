import type { UsedTokenSetsMap } from '@/types';
import type { RemoteResponseData } from './RemoteResponseData';

export type BranchPullOptions = {
  activeTheme?: Record<string, string>;
  usedTokenSet?: UsedTokenSetsMap | null;
};

export interface BranchLifecycle {
  switchBranch(branch: string, options: BranchPullOptions): Promise<RemoteResponseData | null>;
  createAndSyncBranch(branch: string, source: string | undefined, currentChanges: boolean, options: BranchPullOptions): Promise<{ data: RemoteResponseData | null; branches: string[] }>;
}
