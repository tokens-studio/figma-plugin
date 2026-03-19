import { StorageType, StorageTypeCredentials } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';

export function isTokensStudioOAuthType(
  item: StorageType | StorageTypeCredentials | Partial<StorageTypeCredentials> | null | undefined
): item is Extract<StorageTypeCredentials, { provider: StorageProviderType.TOKENS_STUDIO_OAUTH }> {
  return !!item && 'provider' in item && item.provider === StorageProviderType.TOKENS_STUDIO_OAUTH;
}
