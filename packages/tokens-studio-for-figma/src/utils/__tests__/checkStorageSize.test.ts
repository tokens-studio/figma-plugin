import { checkStorageSize } from '../checkStorageSize';
import sampleTokens from '../../../cypress/fixtures/sample_tokens.json';

describe('checkStorageSize', () => {
  it('should calculate correct size for large token set', () => {
    const result = checkStorageSize(sampleTokens);
    expect(result).toBe(540.1);
  });

  it('should calculate size for empty tokens', () => {
    const emptyTokens = { global: [] };
    const result = checkStorageSize(emptyTokens);
    expect(result).toBeLessThan(1);
  });

  it('should handle null/undefined gracefully', () => {
    expect(checkStorageSize(null)).toBe(0);
    expect(checkStorageSize(undefined)).toBe(0);
  });
});
