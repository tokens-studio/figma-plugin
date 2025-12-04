import { decompressFromUTF16 } from 'lz-string';
import { cleanupOldTokenPrefixes } from './ClientStorageCleanup';
import { getStorageSize, SAFE_STORAGE_LIMIT } from './StorageSizeManager';
import { getUTF16StringSize } from '@/utils/getUTF16StringSize';

const MAX_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes, same as Figma's limit

export const ClientStorageProperty = {
  async write(key: string, fileKey: string, value: string) {
    const prefixedKey = key.includes(fileKey) ? key : `${fileKey}/tokens/${key}`;

    const newSize = getUTF16StringSize(value);
    if (newSize > MAX_SIZE_LIMIT) {
      const sizeInMB = (newSize / (1024 * 1024)).toFixed(2);
      console.error(`Cannot write to client storage: Data size (${sizeInMB} MB) exceeds maximum limit in Figma of 5MB`);
      return false;
    }
    const currentSize = await getStorageSize();

    if (currentSize + newSize > SAFE_STORAGE_LIMIT) {
      await cleanupOldTokenPrefixes(fileKey);
    }

    try {
      await figma.clientStorage.setAsync(prefixedKey, value);
      return true;
    } catch (error) {
      console.error('Error writing to client storage:', error);
      return false;
    }
  },
  async read(key: string) {
    try {
      const compressed = await figma.clientStorage.getAsync(key);
      if (key.endsWith('/checkForChanges')) {
        return compressed;
      }
      if (!compressed) {
        return null;
      }

      const decompressed = decompressFromUTF16(compressed);
      if (!decompressed) {
        return null;
      }

      try {
        const result = JSON.parse(decompressed);

        return result;
      } catch (parseError) {
        console.error('Error parsing decompressed data:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error in ClientStorageProperty.read:', error);
      return null;
    }
  },
};
