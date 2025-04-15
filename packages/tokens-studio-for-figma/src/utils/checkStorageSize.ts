const KB_LIMIT = 100;
const WARNING_THRESHOLD = 0.9;

export interface StorageSizeInfo {
  sizeInKB: number;
  isOverLimit: boolean;
  isNearLimit: boolean;
}

export function checkStorageSize(data: unknown): StorageSizeInfo {
  try {
    const stringifiedData = JSON.stringify(data);
    const sizeInBytes = new TextEncoder().encode(stringifiedData).length;
    const sizeInKB = sizeInBytes / 1024;

    return {
      sizeInKB: Number(sizeInKB.toFixed(1)),
      isOverLimit: sizeInKB >= KB_LIMIT,
      isNearLimit: sizeInKB >= (KB_LIMIT * WARNING_THRESHOLD) && sizeInKB < KB_LIMIT,
    };
  } catch (e) {
    console.warn('Failed to check storage size:', e);
    return {
      sizeInKB: 0,
      isOverLimit: false,
      isNearLimit: false,
    };
  }
}

export function formatStorageSize(sizeInKB: number): string {
  return `${sizeInKB.toFixed(1)}KB`;
}
