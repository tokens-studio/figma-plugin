import { AnyTokenList } from '@/types/tokens';
import {
  ClientValuesProperty,
  StorageTypeProperty,
  ValuesProperty,
} from '@/figmaStorage';
import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * Gets token values from the appropriate storage
 * For remote storage providers, prioritizes client storage
 * For local storage, prioritizes shared plugin data unless user has chosen to use client storage
 * @returns Token values
 */
export async function getTokenValues(): Promise<Record<string, AnyTokenList>> {
  try {
    // Check if user has chosen to use client storage for local storage
    const useClientStorageForLocal = await figma.clientStorage.getAsync('useClientStorageForLocal');

    if (useClientStorageForLocal) {
      // User has chosen to use client storage for local storage
      const clientValues = await ClientValuesProperty.read();
      if (clientValues && Object.keys(clientValues).length > 0) {
        return clientValues;
      }
    }

    // Check storage type
    const storageType = await StorageTypeProperty.read(figma.root);
    const isRemoteStorage = storageType && storageType.provider !== StorageProviderType.LOCAL;

    if (isRemoteStorage) {
      // For remote storage, try client storage first
      const clientValues = await ClientValuesProperty.read();
      if (clientValues && Object.keys(clientValues).length > 0) {
        return clientValues;
      }
    }

    // For local storage or if client storage is empty, try shared plugin data
    const sharedValues = await ValuesProperty.read(figma.root);
    if (sharedValues && Object.keys(sharedValues).length > 0) {
      return sharedValues;
    }

    // If all else fails, check client storage as last resort
    const clientValues = await ClientValuesProperty.read();
    return clientValues || {};
  } catch (error) {
    // Error getting token values
    return {};
  }
}
