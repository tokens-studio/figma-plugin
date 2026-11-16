import { StorageProviderType } from '@/constants/StorageProviderType';
import type { StorageType } from '@/types/StorageType';

/**
 * The storage type is written to the Figma file's shared plugin data, which anyone who
 * can open the file can read. It must never carry a credential (secret, apiToken, auth
 * headers, ...). Rather than removing known secret fields, we only keep the fields
 * listed here, so a credential added to a provider later is never persisted by accident.
 */
const SAFE_STORAGE_TYPE_FIELDS: Record<StorageProviderType, readonly string[]> = {
  [StorageProviderType.LOCAL]: [],
  [StorageProviderType.URL]: ['internalId', 'name', 'id'],
  [StorageProviderType.JSONBIN]: ['internalId', 'name', 'id'],
  [StorageProviderType.GITHUB]: ['internalId', 'name', 'id', 'branch', 'filePath', 'baseUrl', 'commitSha'],
  [StorageProviderType.GITLAB]: ['internalId', 'name', 'id', 'branch', 'filePath', 'baseUrl', 'commitDate', 'previousSourceBranch'],
  [StorageProviderType.BITBUCKET]: ['internalId', 'name', 'id', 'username', 'branch', 'filePath', 'baseUrl'],
  [StorageProviderType.ADO]: ['internalId', 'name', 'id', 'baseUrl', 'branch', 'filePath', 'previousSourceBranch'],
  [StorageProviderType.SUPERNOVA]: ['internalId', 'name', 'id', 'designSystemUrl', 'mapping'],
  [StorageProviderType.GENERIC_VERSIONED_STORAGE]: ['internalId', 'name', 'id', 'flow'],
  [StorageProviderType.TOKENS_STUDIO_OAUTH]: ['internalId', 'name', 'orgId', 'id', 'branch', 'changeSetId', 'baseUrl'],
};

export function sanitizeStorageType(value: StorageType): StorageType {
  const allowedFields = SAFE_STORAGE_TYPE_FIELDS[value?.provider];
  if (!allowedFields) {
    return { provider: StorageProviderType.LOCAL };
  }

  const source = value as unknown as Record<string, unknown>;
  const sanitized: Record<string, unknown> = { provider: value.provider };
  allowedFields.forEach((field) => {
    if (source[field] !== undefined) {
      sanitized[field] = source[field];
    }
  });
  return sanitized as StorageType;
}

export function hasUnsafeStorageTypeFields(value: StorageType): boolean {
  const allowedFields = SAFE_STORAGE_TYPE_FIELDS[value?.provider];
  if (!allowedFields) return true;
  return Object.keys(value).some((key) => key !== 'provider' && !allowedFields.includes(key));
}
