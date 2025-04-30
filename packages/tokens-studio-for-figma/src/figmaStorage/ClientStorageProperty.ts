import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

const SAFE_STORAGE_LIMIT = 4 * 1024 * 1024; // 4MB in bytes

async function getStorageSize(): Promise<number> {
  const keys = await figma.clientStorage.keysAsync();
  // Get all keys that contain either tokens or themes
  const storageKeys = keys.filter((key) => key.includes('tokens') || key.includes('themes'));
  let totalSize = 0;
  for (const key of storageKeys) {
    const value = await figma.clientStorage.getAsync(key);
    if (value) {
      totalSize += (value as string).length * 2; // UTF-16 uses 2 bytes per character
    }
  }
  return totalSize;
}

async function cleanupOldTokenPrefixes(currentPrefix: string) {
  const keys = await figma.clientStorage.keysAsync();
  // Get all keys that contain either tokens or themes
  const storageKeys = keys.filter((key) => key.includes('tokens') || key.includes('themes'));
  // Filter keys that don't start with the current prefix base (fileKey)
  const otherPrefixKeys = storageKeys.filter((key) => !key.startsWith(currentPrefix));

  for (const key of otherPrefixKeys) {
    await figma.clientStorage.deleteAsync(key);
  }
}

export const ClientStorageProperty = {
  async write(key: string, fileKey: string, value: any) {
    const compressed = compressToUTF16(JSON.stringify(value));
    const newSize = compressed.length * 2; // UTF-16 uses 2 bytes per character
    const currentSize = await getStorageSize();

    if (currentSize + newSize > SAFE_STORAGE_LIMIT) {
      await cleanupOldTokenPrefixes(fileKey);
    }

    return figma.clientStorage.setAsync(key, compressed);
  },
  async read(key: string) {
    const compressed = await figma.clientStorage.getAsync(key);
    if (!compressed) return null;
    const decompressed = decompressFromUTF16(compressed as string);
    return decompressed ? JSON.parse(decompressed) : null;
  },
};
