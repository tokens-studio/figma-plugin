import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export const ClientStorageProperty = {
  async write(key: string, value: any) {
    const compressed = compressToUTF16(JSON.stringify(value));
    return figma.clientStorage.setAsync(key, compressed);
  },
  async read(key: string) {
    const compressed = await figma.clientStorage.getAsync(key);
    if (!compressed) return null;
    const decompressed = decompressFromUTF16(compressed as string);
    return decompressed ? JSON.parse(decompressed) : null;
  },
};
