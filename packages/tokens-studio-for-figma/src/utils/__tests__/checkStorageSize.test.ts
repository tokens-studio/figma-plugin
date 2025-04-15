import { checkStorageSize, formatStorageSize } from '../checkStorageSize';

describe('checkStorageSize', () => {
  it('should calculate size for empty object', () => {
    const result = checkStorageSize({});
    expect(result.sizeInKB).toBe(0.0);
    expect(result.isOverLimit).toBe(false);
    expect(result.isNearLimit).toBe(false);
  });

  it('should calculate size for small data', () => {
    const smallData = { key: 'value' };
    const result = checkStorageSize(smallData);
    expect(result.sizeInKB).toBeLessThan(1);
    expect(result.isOverLimit).toBe(false);
    expect(result.isNearLimit).toBe(false);
  });

  it('should handle data near warning threshold', () => {
    // Create string that's about 82KB (80% of limit)
    const nearLimitData = { data: 'x'.repeat(82 * 1024) };
    const result = checkStorageSize(nearLimitData);
    expect(result.isNearLimit).toBe(true);
    expect(result.isOverLimit).toBe(false);
  });

  it('should detect data over limit', () => {
    // Create string that's about 102KB
    const overLimitData = { data: 'x'.repeat(102 * 1024) };
    const result = checkStorageSize(overLimitData);
    expect(result.isOverLimit).toBe(true);
    expect(result.isNearLimit).toBe(false);
  });

  it('should handle unicode characters correctly', () => {
    const unicodeData = { text: '🚀'.repeat(1000) };
    const result = checkStorageSize(unicodeData);
    // Each emoji is 4 bytes, plus JSON structure
    expect(result.sizeInKB).toBeGreaterThan(0);
  });
});

describe('formatStorageSize', () => {
  it('should format size with one decimal place', () => {
    expect(formatStorageSize(1.23)).toBe('1.2KB');
    expect(formatStorageSize(10.56)).toBe('10.6KB');
    expect(formatStorageSize(99.99)).toBe('100.0KB');
  });

  it('should handle zero', () => {
    expect(formatStorageSize(0)).toBe('0.0KB');
  });
});
