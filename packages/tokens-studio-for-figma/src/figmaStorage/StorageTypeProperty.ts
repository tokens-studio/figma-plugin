import { StorageType } from '@/types/StorageType';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';
import { tryParseJson } from '@/utils/tryParseJson';
import { sanitizeStorageType, hasUnsafeStorageTypeFields } from '@/utils/sanitizeStorageType';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

// Shared plugin data is readable by anyone who can open the file, so only allowlisted,
// non-credential fields are written and returned.
export const StorageTypeProperty = new FigmaStorageProperty<StorageType>(
  FigmaStorageType.SHARED_PLUGIN_DATA,
  `${SharedPluginDataNamespaces.TOKENS}/${SharedPluginDataKeys.tokens.storageType}`,
  (value) => JSON.stringify(sanitizeStorageType(value)),
  (value) => {
    const parsed = tryParseJson<StorageType>(value);
    return parsed ? sanitizeStorageType(parsed) : null;
  },
);

/**
 * Files saved by older plugin versions may hold credentials (e.g. a Bitbucket apiToken)
 * in the shared storage type. Rewrite it without them. Returns true when the file was cleaned.
 */
export function removeCredentialsFromSavedStorageType(node: BaseNode = figma.root): boolean {
  const raw = node.getSharedPluginData(SharedPluginDataNamespaces.TOKENS, SharedPluginDataKeys.tokens.storageType);
  if (!raw) return false;
  const parsed = tryParseJson<StorageType>(raw);
  if (!parsed || !hasUnsafeStorageTypeFields(parsed)) return false;
  try {
    node.setSharedPluginData(
      SharedPluginDataNamespaces.TOKENS,
      SharedPluginDataKeys.tokens.storageType,
      JSON.stringify(sanitizeStorageType(parsed)),
    );
    return true;
  } catch (e) {
    // e.g. the user only has view access to the file
    console.error('Could not remove credentials from saved storage type', e);
    return false;
  }
}
