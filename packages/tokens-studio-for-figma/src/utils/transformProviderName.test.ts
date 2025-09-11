import { transformProviderName } from './transformProviderName';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('transformProviderName', () => {
  it('should return "Tokens Studio" without beta for TOKENS_STUDIO provider', () => {
    expect(transformProviderName(StorageProviderType.TOKENS_STUDIO)).toBe('Tokens Studio');
  });

  it('should return "Bitbucket (Beta)" for BITBUCKET provider', () => {
    expect(transformProviderName(StorageProviderType.BITBUCKET)).toBe('Bitbucket (Beta)');
  });

  it('should return "GitHub" for GITHUB provider', () => {
    expect(transformProviderName(StorageProviderType.GITHUB)).toBe('GitHub');
  });

  it('should return original provider type for unknown providers', () => {
    expect(transformProviderName('unknown' as StorageProviderType)).toBe('unknown');
  });
});
