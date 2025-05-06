import { compressToUTF16 } from 'lz-string';
import { getUTF16StringSize } from './getUTF16StringSize';

export function checkStorageSize(tokens: any): number {
  try {
    const stringifiedData = JSON.stringify(tokens);
    const compressedData = compressToUTF16(stringifiedData);

    // UTF-16 uses 2 bytes per character
    const sizeInBytes = getUTF16StringSize(compressedData);
    const sizeInKB = sizeInBytes / 1024;

    return Number(sizeInKB.toFixed(1));
  } catch (e) {
    console.warn('Failed to check storage size:', e);
    return 0;
  }
}
