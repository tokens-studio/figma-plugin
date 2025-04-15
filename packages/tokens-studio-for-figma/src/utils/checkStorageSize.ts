export function checkStorageSize(data: unknown): number {
  try {
    const stringifiedData = JSON.stringify(data);
    const sizeInBytes = new TextEncoder().encode(stringifiedData).length;
    const sizeInKB = sizeInBytes / 1024;

    return Number(sizeInKB.toFixed(1));
  } catch (e) {
    console.warn('Failed to check storage size:', e);
    return 0;
  }
}
