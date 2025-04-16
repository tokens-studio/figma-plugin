export function checkStorageSize(tokens: any, themes: any): number {
  try {
    const stringifiedData = JSON.stringify({ tokens, themes });
    const sizeInBytes = new TextEncoder().encode(stringifiedData).length;
    const sizeInKB = sizeInBytes / 1024;

    return Number(sizeInKB.toFixed(1));
  } catch (e) {
    console.warn('Failed to check storage size:', e);
    return 0;
  }
}
