export async function cleanupOldTokenPrefixes(currentPrefix: string) {
  const keys = await figma.clientStorage.keysAsync();
  // Get all keys that contain either tokens or themes
  const storageKeys = keys.filter((key) => key.includes('/tokens/'));
  // Filter keys that don't start with the current prefix base (fileKey)
  const otherPrefixKeys = storageKeys.filter((key) => !key.startsWith(currentPrefix));

  for (const key of otherPrefixKeys) {
    await figma.clientStorage.deleteAsync(key);
  }
}
