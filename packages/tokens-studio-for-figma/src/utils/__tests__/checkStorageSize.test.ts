import { compressToUTF16 } from 'lz-string';
import { checkStorageSize } from '../checkStorageSize';
import sampleTokens from '../../../cypress/fixtures/sample_tokens.json';

describe('checkStorageSize', () => {
  it('should calculate correct size for large token set', () => {
    const result = checkStorageSize(sampleTokens);

    // Calculate expected size manually for verification
    const stringified = JSON.stringify(sampleTokens);
    const compressed = compressToUTF16(stringified);
    const expectedSizeKB = (compressed.length * 2) / 1024;
    const expectedSizeRounded = Number(expectedSizeKB.toFixed(1));

    expect(result).toBe(expectedSizeRounded);
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
    const themes = [{ id: 'light', name: 'Light', selectedTokenSets: {} }];
    
    // Calculate size with just tokens
    const tokensOnlySize = checkStorageSize(tokens);
    
    // Calculate size with tokens and themes
    const withThemesSize = checkStorageSize(tokens, themes);
    
    // Should be the same since themes are ignored
    expect(withThemesSize).toBe(tokensOnlySize);
  });
});
