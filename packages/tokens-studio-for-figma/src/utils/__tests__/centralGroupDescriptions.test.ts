import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import stringifyTokens from '../stringifyTokens';
import formatTokens from '../formatTokens';
import convertTokensToObject from '../convertTokensToObject';
import { GroupMetadataMap } from '@/types/tokens';

describe('Central Group Description Integration', () => {
  beforeEach(() => {
    setFormat(TokenFormatOptions.DTCG);
  });

  const tokens = {
    global: [
      {
        name: 'colors.brand.primary',
        type: 'color',
        value: '#007bff',
        description: 'Primary brand color'
      },
      {
        name: 'colors.semantic.success',
        type: 'color',
        value: '#28a745'
      },
      {
        name: 'spacing.small',
        type: 'dimension',
        value: '8px'
      }
    ]
  };

  const groupMetadata: GroupMetadataMap = {
    global: {
      'colors': {
        description: 'Brand and semantic color tokens',
        lastModified: '2023-01-01T00:00:00.000Z'
      },
      'colors.brand': {
        description: 'Primary brand colors',
        lastModified: '2023-01-01T00:00:00.000Z'
      },
      'spacing': {
        description: 'Design system spacing scale',
        lastModified: '2023-01-01T00:00:00.000Z'
      }
    }
  };

  describe('stringifyTokens with group metadata', () => {
    it('should inject group descriptions at correct levels', () => {
      const result = stringifyTokens(tokens, 'global', false, groupMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.colors.$description).toBe('Brand and semantic color tokens');
      expect(parsed.colors.brand.$description).toBe('Primary brand colors');
      expect(parsed.spacing.$description).toBe('Design system spacing scale');
      
      // Verify tokens are still present
      expect(parsed.colors.brand.primary.$value).toBe('#007bff');
      expect(parsed.colors.semantic.success.$value).toBe('#28a745');
      expect(parsed.spacing.small.$value).toBe('8px');
    });

    it('should work without group metadata', () => {
      const result = stringifyTokens(tokens, 'global', false);
      const parsed = JSON.parse(result);

      expect(parsed.colors.$description).toBeUndefined();
      expect(parsed.colors.brand.$description).toBeUndefined();
      expect(parsed.spacing.$description).toBeUndefined();
      
      // Verify tokens are still present
      expect(parsed.colors.brand.primary.$value).toBe('#007bff');
    });
  });

  describe('formatTokens with group metadata', () => {
    it('should inject group descriptions in multi-set format', () => {
      const result = formatTokens({
        tokens,
        tokenSets: ['global'],
        resolvedTokens: tokens.global,
        includeAllTokens: true,
        groupMetadata
      });
      const parsed = JSON.parse(result);

      expect(parsed.global.colors.$description).toBe('Brand and semantic color tokens');
      expect(parsed.global.colors.brand.$description).toBe('Primary brand colors');
      expect(parsed.global.spacing.$description).toBe('Design system spacing scale');
      
      // Verify tokens are still present
      expect(parsed.global.colors.brand.primary.$value).toBe('#007bff');
    });
  });

  describe('convertTokensToObject with group metadata', () => {
    it('should inject group descriptions in multi-set format', () => {
      const result = convertTokensToObject(tokens, false, groupMetadata);

      expect(result.global.colors.$description).toBe('Brand and semantic color tokens');
      expect(result.global.colors.brand.$description).toBe('Primary brand colors');
      expect(result.global.spacing.$description).toBe('Design system spacing scale');
      
      // Verify tokens are still present
      expect(result.global.colors.brand.primary.$value).toBe('#007bff');
    });
  });
});