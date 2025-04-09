import {
  CheckForChangesProperty,
  ClientCheckForChangesProperty,
  ClientValuesProperty,
  StorageTypeProperty,
  ValuesProperty,
} from '@/figmaStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * Migrates data from shared plugin data to client storage for remote storage providers
 * This is called during plugin startup to ensure we're using the right storage
 */
export async function migrateStorageData() {
  try {
    // Check storage type
    const storageType = await StorageTypeProperty.read(figma.root);
    const isRemoteStorage = storageType && storageType.provider !== StorageProviderType.LOCAL;
    
    if (isRemoteStorage) {
      // For remote storage, migrate data from shared plugin data to client storage
      
      // Migrate token values
      const sharedValues = await ValuesProperty.read(figma.root);
      if (sharedValues && Object.keys(sharedValues).length > 0) {
        // Move to client storage
        await ClientValuesProperty.write(sharedValues);
        // Clear shared plugin data to save space
        await ValuesProperty.write({});
      }
      
      // Migrate checkForChanges flag
      const checkForChanges = await CheckForChangesProperty.read(figma.root);
      if (checkForChanges !== null) {
        await ClientCheckForChangesProperty.write(checkForChanges);
        await CheckForChangesProperty.write(false);
      }
    }
  } catch (error) {
    console.error('Error migrating storage data:', error);
  }
}
