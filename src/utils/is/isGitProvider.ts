import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';

export function isGitProvider<T extends StorageType | StorageTypeCredentials | StorageTypeFormValues<false> | StorageTypeFormValues<true>>(provider: T): provider is (
  Extract<T, { provider: StorageProviderType.ADO }>
  | Extract<T, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>
) {
  return (
    provider.provider === StorageProviderType.ADO
    || provider.provider === StorageProviderType.GITHUB
    || provider.provider === StorageProviderType.GITLAB
  );
}
