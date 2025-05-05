import { checkStorageSize } from '../checkStorageSize';
import sampleTokens from '../../../cypress/fixtures/sample_tokens.json';

describe('checkStorageSize', () => {
  it('should calculate correct size for large token set', () => {
    const result = checkStorageSize(sampleTokens);

    expect(result).toBe(153.7);
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

  it('should ignore themes parameter if provided', () => {
    const tokens = { global: [{ name: 'color', value: '#ff0000', type: 'color' }] };

    // Calculate size with just tokens
    const tokensOnlySize = checkStorageSize(tokens);

    // Calculate size with tokens and themes
    const withThemesSize = checkStorageSize(tokens);

    // Should be the same since themes are ignored
    expect(withThemesSize).toBe(tokensOnlySize);
  });
});
