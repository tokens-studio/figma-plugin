import type { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import type { RemoteResponseData } from '@/types/RemoteResponseData';

export function getSyncedCredentials<T extends StorageTypeCredentials | StorageTypeFormValues<false>>(
  context: T,
  data: Extract<RemoteResponseData, { status: 'success' }>,
): T {
  if (data.commitSha === undefined && data.defaultBranch === undefined && data.branch === undefined) return context;
  return {
    ...context,
    ...(data.commitSha !== undefined ? { commitSha: data.commitSha } : {}),
    ...(data.defaultBranch !== undefined ? { defaultBranch: data.defaultBranch } : {}),
    ...(data.branch !== undefined ? { branch: data.branch } : {}),
  };
}
