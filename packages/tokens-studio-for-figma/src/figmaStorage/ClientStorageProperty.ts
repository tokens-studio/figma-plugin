import { decompressFromUTF16 } from 'lz-string';
import { cleanupOldTokenPrefixes } from './ClientStorageCleanup';
import { getStorageSize, SAFE_STORAGE_LIMIT } from './StorageSizeManager';
import { getUTF16StringSize } from '@/utils/getUTF16StringSize';

export const ClientStorageProperty = {
  async write(key: string, fileKey: string, value: string) {
    const prefixedKey = key.includes(fileKey) ? key : `${fileKey}/tokens/${key}`;

    const newSize = getUTF16StringSize(value);
    const currentSize = await getStorageSize();

    if (currentSize + newSize > SAFE_STORAGE_LIMIT) {
      await cleanupOldTokenPrefixes(fileKey);
    }

    return figma.clientStorage.setAsync(prefixedKey, value);
  },
  async read(key: string) {
    try {
      const compressed = await figma.clientStorage.getAsync(key);
      if (!compressed) {
        return null;
      }
      if (typeof compressed !== 'string') {
        return compressed;
      }

      try {
        const parsed = JSON.parse(compressed);
        console.log('Data was valid JSON, returning parsed object');
        return parsed;
      } catch (jsonError) {
        console.error('Data is not valid JSON, attempting decompression', jsonError);
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
