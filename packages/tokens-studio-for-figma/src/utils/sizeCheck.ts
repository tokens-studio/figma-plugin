/**
 * Utility function to check the size of data in bytes
 * This should only be used in the UI context where TextEncoder is available
 * @param data Any data that can be stringified
 * @returns Size in bytes
 */
export function getDataSize(data: any): number {
  const jsonString = JSON.stringify(data);
  return new TextEncoder().encode(jsonString).length;
}

/**
 * Checks if the data size exceeds the Figma shared plugin data limit
 * Uses a safety margin of 90KB to ensure we stay under the 100KB limit
 * @param data Any data that can be stringified
 * @returns True if the data size exceeds the safety limit
 */
export function exceedsStorageLimit(data: any): boolean {
  const size = getDataSize(data);
  return size > 90000; // 90KB safety margin
}
