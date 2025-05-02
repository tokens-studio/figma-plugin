import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { cleanupOldTokenPrefixes } from './ClientStorageCleanup';
import { getStorageSize, SAFE_STORAGE_LIMIT } from './StorageSizeManager';

export const ClientStorageProperty = {
  async write(key: string, fileKey: string, value: any) {
    const prefixedKey = key.includes(fileKey) ? key : `${fileKey}/tokens/${key}`;

    const compressed = compressToUTF16(JSON.stringify(value));
    const newSize = compressed.length * 2; // UTF-16 uses 2 bytes per character
    const currentSize = await getStorageSize();

    if (currentSize + newSize > SAFE_STORAGE_LIMIT) {
      await cleanupOldTokenPrefixes(fileKey);
    }

    return figma.clientStorage.setAsync(prefixedKey, compressed);
  },
  async read(key: string) {
    const compressed = await figma.clientStorage.getAsync(key);
    if (!compressed) return null;
    const decompressed = decompressFromUTF16(compressed as string);
    return decompressed ? JSON.parse(decompressed) : null;
  },
};
