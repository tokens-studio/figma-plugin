import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { StorageType, StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';

export function isGitProvider<
  T extends StorageType | StorageTypeCredentials | StorageTypeFormValues<false> | StorageTypeFormValues<true>,
>(
  provider: T,
): provider is
  | Extract<T, { provider: StorageProviderType.ADO }>
  | Extract<T, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>
  | Extract<T, { provider: StorageProviderType.BITBUCKET }> {
  return (
    provider.provider === AVAILABLE_PROVIDERS.ADO
    || provider.provider === AVAILABLE_PROVIDERS.GITHUB
    || provider.provider === AVAILABLE_PROVIDERS.GITLAB
    || provider.provider === AVAILABLE_PROVIDERS.BITBUCKET
  );
}
