import { getCachedRegex, clearRegexCache, getRegexCacheSize } from './regexCache';

describe('regexCache', () => {
  beforeEach(() => {
    clearRegexCache();
  });

  it('should cache and reuse regex patterns', () => {
    const pattern = '^test$';
    const regex1 = getCachedRegex(pattern);
    const regex2 = getCachedRegex(pattern);

    // Should return the same instance
    expect(regex1).toBe(regex2);
    expect(getRegexCacheSize()).toBe(1);
  });

  it('should cache patterns with different flags separately', () => {
    const pattern = 'test';
    const regex1 = getCachedRegex(pattern, 'i');
    const regex2 = getCachedRegex(pattern, 'g');
    const regex3 = getCachedRegex(pattern);

    expect(regex1).not.toBe(regex2);
    expect(regex2).not.toBe(regex3);
    expect(getRegexCacheSize()).toBe(3);
  });

  it('should correctly apply flags', () => {
    const pattern = 'test';
    const caseInsensitive = getCachedRegex(pattern, 'i');
    const caseSensitive = getCachedRegex(pattern);

    expect(caseInsensitive.test('TEST')).toBe(true);
    expect(caseSensitive.test('TEST')).toBe(false);
  });

  it('should work with complex patterns', () => {
    const emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
    const regex = getCachedRegex(emailPattern, 'i');

    expect(regex.test('test@example.com')).toBe(true);
    expect(regex.test('invalid-email')).toBe(false);
  });

  it('should clear cache correctly', () => {
    getCachedRegex('test1');
    getCachedRegex('test2');
    expect(getRegexCacheSize()).toBe(2);

    clearRegexCache();
    expect(getRegexCacheSize()).toBe(0);
  });

  it('should handle multiple calls efficiently', () => {
    const pattern = 'abc';
    const iterations = 1000;

    // First call compiles the regex
    const regex = getCachedRegex(pattern);

    // Subsequent calls should return cached version
    for (let i = 0; i < iterations; i += 1) {
      expect(getCachedRegex(pattern)).toBe(regex);
    }

    // Should still only have one entry
    expect(getRegexCacheSize()).toBe(1);
  });
});
