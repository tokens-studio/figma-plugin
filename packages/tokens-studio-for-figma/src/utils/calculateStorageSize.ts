/**
 * Calculates the size of a JavaScript object in kilobytes
 * @param obj The object to calculate the size of
 * @returns The size in kilobytes
 */
export function calculateStorageSize(obj: unknown): number {
  // Convert the object to a JSON string
  const jsonString = JSON.stringify(obj);
  
  // Calculate the size in bytes
  // In JavaScript, strings are UTF-16, so each character is 2 bytes
  // However, when stored, JSON is typically UTF-8, which is more efficient for ASCII characters
  // This is an approximation that works well for most cases
  const bytes = new TextEncoder().encode(jsonString).length;
  
  // Convert to kilobytes and round to 1 decimal place
  const kilobytes = Math.round(bytes / 1024 * 10) / 10;
  
  return kilobytes;
}
