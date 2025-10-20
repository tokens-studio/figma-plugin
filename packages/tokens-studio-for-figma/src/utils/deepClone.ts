/**
 * Efficiently deep clone an object.
 * Uses native structuredClone if available (faster and more reliable),
 * otherwise falls back to JSON-based cloning.
 *
 * Performance note: structuredClone is ~2-5x faster than JSON.parse(JSON.stringify())
 * and handles more data types (Date, RegExp, Map, Set, etc.)
 *
 * @param obj - The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  // Use native structuredClone if available (Node 17+, modern browsers)
  if (typeof structuredClone !== 'undefined') {
    try {
      return structuredClone(obj);
    } catch (e) {
      // Fall back if structuredClone fails (e.g., with functions)
      // eslint-disable-next-line no-console
      console.warn('structuredClone failed, falling back to JSON clone:', e);
    }
  }

  // Fallback to JSON-based cloning
  // Note: This doesn't handle functions, Date, RegExp, Map, Set, etc.
  return JSON.parse(JSON.stringify(obj));
}
