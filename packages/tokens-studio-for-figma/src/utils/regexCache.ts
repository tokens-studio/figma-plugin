/**
 * Regex cache utility for improved performance.
 * Compiling regex patterns is expensive, so we cache them for reuse.
 * This provides significant performance gains when the same regex is used multiple times.
 */

const regexCache = new Map<string, RegExp>();

/**
 * Get a compiled regex pattern from cache, or compile and cache it if not found.
 *
 * @param pattern - The regex pattern string
 * @param flags - Optional regex flags (e.g., 'gi', 'i', 'g')
 * @returns Compiled RegExp object
 *
 * @example
 * const emailRegex = getCachedRegex('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$', 'i');
 * const isValid = emailRegex.test(email);
 */
export function getCachedRegex(pattern: string, flags?: string): RegExp {
  const cacheKey = flags ? `${pattern}|${flags}` : pattern;

  let regex = regexCache.get(cacheKey);
  if (!regex) {
    regex = new RegExp(pattern, flags);
    regexCache.set(cacheKey, regex);
  }

  return regex;
}

/**
 * Clear the regex cache. Useful for testing or if memory becomes a concern.
 */
export function clearRegexCache(): void {
  regexCache.clear();
}

/**
 * Get the current size of the regex cache.
 */
export function getRegexCacheSize(): number {
  return regexCache.size;
}
