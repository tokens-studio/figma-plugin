import { StorageProviderType } from '@/constants/StorageProviderType';
import type { StorageType } from '@/types/StorageType';

/**
 * The storage type is written to the Figma file's shared plugin data, which anyone who
 * can open the file can read. It must never carry a credential or an account identity.
 * New writes only keep the fields listed here, so a credential added to a provider later
 * is never persisted by accident.
 */
const SAFE_STORAGE_TYPE_FIELDS: Record<StorageProviderType, readonly string[]> = {
  [StorageProviderType.LOCAL]: [],
  [StorageProviderType.URL]: ['internalId', 'name', 'id'],
  [StorageProviderType.JSONBIN]: ['internalId', 'name', 'id'],
  [StorageProviderType.GITHUB]: ['internalId', 'name', 'id', 'branch', 'filePath', 'baseUrl', 'commitSha'],
  [StorageProviderType.GITLAB]: ['internalId', 'name', 'id', 'branch', 'filePath', 'baseUrl', 'commitDate', 'previousSourceBranch'],
  [StorageProviderType.BITBUCKET]: ['internalId', 'name', 'id', 'branch', 'filePath', 'baseUrl'],
  [StorageProviderType.ADO]: ['internalId', 'name', 'id', 'baseUrl', 'branch', 'filePath', 'previousSourceBranch'],
  [StorageProviderType.SUPERNOVA]: ['internalId', 'name', 'id', 'designSystemUrl', 'mapping'],
  [StorageProviderType.GENERIC_VERSIONED_STORAGE]: ['internalId', 'name', 'id', 'flow'],
  [StorageProviderType.TOKENS_STUDIO_OAUTH]: ['internalId', 'name', 'orgId', 'id', 'branch', 'changeSetId', 'baseUrl'],
};

// Kept for providers this build doesn't know (a legacy provider, or one added by a newer build).
const UNKNOWN_PROVIDER_SAFE_FIELDS: readonly string[] = ['internalId', 'name', 'id'];

/**
 * Fields that any plugin version has stored in the shared storage type and that must be
 * removed from existing files. `username` is the Bitbucket account email, the identity half
 * of a Bitbucket API token credential.
 */
const SENSITIVE_STORAGE_TYPE_FIELDS: readonly string[] = ['secret', 'apiToken', 'additionalHeaders', 'username'];

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

/** Keeps only the allowlisted, non-credential fields of a storage type. */
export function sanitizeStorageType(value: StorageType): StorageType {
  if (!isObject(value) || typeof value.provider !== 'string') {
    return { provider: StorageProviderType.LOCAL };
  }

  const allowedFields = SAFE_STORAGE_TYPE_FIELDS[value.provider as StorageProviderType] ?? UNKNOWN_PROVIDER_SAFE_FIELDS;
  const sanitized: Record<string, unknown> = { provider: value.provider };
  allowedFields.forEach((field) => {
    if (value[field] !== undefined) {
      sanitized[field] = value[field];
    }
  });
  return sanitized as StorageType;
}

/**
 * Removes the known sensitive fields from a stored storage type and leaves every other
 * field as it is, so fields written by a newer plugin version survive the cleanup.
 */
export function removeSensitiveStorageTypeFields(value: Record<string, unknown>): {
  cleaned: Record<string, unknown>;
  removedFields: string[];
} {
  const cleaned: Record<string, unknown> = {};
  const removedFields: string[] = [];
  Object.entries(value).forEach(([key, fieldValue]) => {
    if (SENSITIVE_STORAGE_TYPE_FIELDS.includes(key)) {
      removedFields.push(key);
    } else {
      cleaned[key] = fieldValue;
    }
  });
  return { cleaned, removedFields };
}
