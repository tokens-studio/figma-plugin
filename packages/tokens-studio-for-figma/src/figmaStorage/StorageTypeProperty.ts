import { StorageType } from '@/types/StorageType';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { tryParseJson } from '@/utils/tryParseJson';
import { removeSensitiveStorageTypeFields, sanitizeStorageType } from '@/utils/sanitizeStorageType';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

const STORAGE_TYPE_KEY = `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.storageType}`;

// Shared plugin data is readable by anyone who can open the file, so only allowlisted,
// non-credential fields are written and returned.
export const StorageTypeProperty = new FigmaStorageProperty<StorageType>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  STORAGE_TYPE_KEY,
  (value) => JSON.stringify(sanitizeStorageType(value)),
  (value) => {
    const parsed = tryParseJson<StorageType>(value);
    return parsed ? sanitizeStorageType(parsed) : null;
  },
);

// Unsanitized access to the same key, only for removing credentials from existing files.
const RawStorageTypeProperty = new FigmaStorageProperty<Record<string, unknown>>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  STORAGE_TYPE_KEY,
  (value) => JSON.stringify(value),
  (value) => tryParseJson<Record<string, unknown>>(value),
);

/**
 * Files saved by older plugin versions may hold credentials (e.g. a Bitbucket apiToken)
 * in the shared storage type. Rewrite it without them, keeping every other field.
 */
export async function removeCredentialsFromSavedStorageType(node: BaseNode = figma.root): Promise<void> {
  const stored = await RawStorageTypeProperty.read(node);
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) return;

  const { cleaned, removedFields } = removeSensitiveStorageTypeFields(stored);
  if (removedFields.length === 0) return;

  try {
    await RawStorageTypeProperty.write(cleaned, node);
  } catch (e) {
    // e.g. the user only has view access to the file or is in Dev Mode
    console.error('Could not remove credentials from saved storage type', e);
  }
}
