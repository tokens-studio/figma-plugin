import {
  CheckForChangesProperty,
  ClientCheckForChangesProperty,
  StorageTypeProperty,
} from '@/figmaStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * Gets the checkForChanges flag from the appropriate storage
 * For remote storage providers, prioritizes client storage
 * For local storage, prioritizes shared plugin data unless user has chosen to use client storage
 * @returns The checkForChanges flag
 */
export async function getCheckForChanges(): Promise<boolean> {
  // Check if user has chosen to use client storage for local storage
  const useClientStorageForLocal = await figma.clientStorage.getAsync('useClientStorageForLocal');
  
  if (useClientStorageForLocal) {
    // User has chosen to use client storage for local storage
    const clientValue = await ClientCheckForChangesProperty.read();
    if (clientValue !== null) {
      return clientValue;
    }
  }

  // Check storage type
  const storageType = await StorageTypeProperty.read(figma.root);
  const isRemoteStorage = storageType && storageType.provider !== StorageProviderType.LOCAL;
  
  if (isRemoteStorage) {
    // For remote storage, always use client storage
    const clientValue = await ClientCheckForChangesProperty.read();
    return clientValue ?? false;
  }
  
  // For local storage, try shared plugin data first
  const sharedValue = await CheckForChangesProperty.read(figma.root);
  if (sharedValue !== null) {
    return sharedValue;
  }
  
  // If not found, try client storage as fallback
  const clientValue = await ClientCheckForChangesProperty.read();
  return clientValue ?? false;
}
