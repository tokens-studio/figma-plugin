import { getUTF16StringSize } from '@/utils/getUTF16StringSize';

export const SAFE_STORAGE_LIMIT = 4 * 1024 * 1024; // 4MB in bytes

export async function getStorageSize(): Promise<number> {
  const keys = await figma.clientStorage.keysAsync();
  // Get all keys that contain either tokens or themes
  const storageKeys = keys.filter((key) => key.includes('/tokens/'));
  let totalSize = 0;
  for (const key of storageKeys) {
    const value = await figma.clientStorage.getAsync(key);
    if (value) {
      totalSize += getUTF16StringSize(value as string);
    }
  }
  return totalSize;
}
