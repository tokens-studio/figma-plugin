import { TokenValueRetriever } from './TokenValueRetriever';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { RawVariableReferenceMap } from '@/types/RawVariableReferenceMap';
import { mockImportVariableByKeyAsync } from '../../tests/__mocks__/figmaMock';

describe('TokenValueRetriever', () => {
  let tokenValueRetriever: TokenValueRetriever;
  let mockTokens: AnyTokenList;
  let mockVariableReferences: RawVariableReferenceMap;
  let mockStyleReferences: Map<string, string>;

  beforeEach(() => {
    tokenValueRetriever = new TokenValueRetriever();
    
    // Setup mock data
    mockTokens = [
      {
        name: 'color.primary',
        value: '#FF0000',
        type: TokenTypes.COLOR,
        rawValue: '#FF0000',
      },
      {
        name: 'spacing.small',
        value: '8px',
        type: TokenTypes.SPACING,
        rawValue: '8px',
      },
      {
        name: 'color.reference',
        value: '{color.primary}',
        type: TokenTypes.COLOR,
        rawValue: '{color.primary}',
      },
    ];

    mockVariableReferences = new Map([
      ['color.primary', 'variable-key-1'],
      ['spacing.small', 'variable-key-2'],
    ]);

    mockStyleReferences = new Map([
      ['color.primary', 'style-id-1'],
      ['spacing.small', 'style-id-2'],
    ]);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('initiate', () => {
    it('should initialize with minimum required parameters', () => {
      tokenValueRetriever.initiate({ tokens: mockTokens });

      expect(tokenValueRetriever.tokens).toBeInstanceOf(Map);
      expect(tokenValueRetriever.tokens.size).toBe(3);
      expect(tokenValueRetriever.variableReferences).toBeInstanceOf(Map);
      expect(tokenValueRetriever.cachedVariableReferences).toBeInstanceOf(Map);
      expect(tokenValueRetriever.stylePathPrefix).toBeNull();
      expect(tokenValueRetriever.ignoreFirstPartForStyles).toBe(false);
      expect(tokenValueRetriever.createStylesWithVariableReferences).toBe(false);
      expect(tokenValueRetriever.applyVariablesStylesOrRawValue).toBe(ApplyVariablesStylesOrRawValues.VARIABLES_STYLES);
    });

    it('should initialize with all parameters', () => {
      const stylePathPrefix = 'theme';
      const ignoreFirstPartForStyles = true;
      const createStylesWithVariableReferences = true;
      const applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.RAW_VALUES;

      tokenValueRetriever.initiate({
        tokens: mockTokens,
        variableReferences: mockVariableReferences,
        styleReferences: mockStyleReferences,
        stylePathPrefix,
        ignoreFirstPartForStyles,
        createStylesWithVariableReferences,
        applyVariablesStylesOrRawValue,
      });

      expect(tokenValueRetriever.stylePathPrefix).toBe(stylePathPrefix);
      expect(tokenValueRetriever.ignoreFirstPartForStyles).toBe(ignoreFirstPartForStyles);
      expect(tokenValueRetriever.createStylesWithVariableReferences).toBe(createStylesWithVariableReferences);
      expect(tokenValueRetriever.applyVariablesStylesOrRawValue).toBe(applyVariablesStylesOrRawValue);
      expect(tokenValueRetriever.variableReferences).toBe(mockVariableReferences);
    });

    it('should map tokens with variable and style references', () => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        variableReferences: mockVariableReferences,
        styleReferences: mockStyleReferences,
      });

      const primaryToken = tokenValueRetriever.get('color.primary');
      expect(primaryToken).toBeDefined();
      expect(primaryToken.variableId).toBe('variable-key-1');
      expect(primaryToken.styleId).toBe('style-id-1');
      expect(primaryToken.adjustedTokenName).toBe('color.primary');

      const spacingToken = tokenValueRetriever.get('spacing.small');
      expect(spacingToken).toBeDefined();
      expect(spacingToken.variableId).toBe('variable-key-2');
      expect(spacingToken.styleId).toBe('style-id-2');
    });

    it('should handle tokens without variable or style references', () => {
      const tokensWithoutRefs = [
        {
          name: 'color.orphan',
          value: '#00FF00',
          type: TokenTypes.COLOR,
          rawValue: '#00FF00',
        },
      ];

      tokenValueRetriever.initiate({
        tokens: tokensWithoutRefs,
        variableReferences: mockVariableReferences,
        styleReferences: mockStyleReferences,
      });

      const orphanToken = tokenValueRetriever.get('color.orphan');
      expect(orphanToken).toBeDefined();
      expect(orphanToken.variableId).toBeUndefined();
      expect(orphanToken.styleId).toBeUndefined();
    });

    it('should handle style path prefix correctly', () => {
      const stylePathPrefix = 'theme';
      
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        styleReferences: new Map([['theme.color.primary', 'style-id-1']]),
        stylePathPrefix,
      });

      const primaryToken = tokenValueRetriever.get('color.primary');
      expect(primaryToken.adjustedTokenName).toBe('theme.color.primary');
    });

    it('should handle ignoreFirstPartForStyles correctly', () => {
      const tokensWithNestedName = [
        {
          name: 'global.color.primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
      ];

      tokenValueRetriever.initiate({
        tokens: tokensWithNestedName,
        styleReferences: new Map([['color.primary', 'style-id-1']]),
        ignoreFirstPartForStyles: true,
      });

      const token = tokenValueRetriever.get('global.color.primary');
      expect(token.styleId).toBe('style-id-1');
    });
  });

  describe('get', () => {
    beforeEach(() => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        variableReferences: mockVariableReferences,
        styleReferences: mockStyleReferences,
      });
    });

    it('should return token by name', () => {
      const token = tokenValueRetriever.get('color.primary');
      expect(token).toBeDefined();
      expect(token.name).toBe('color.primary');
      expect(token.value).toBe('#FF0000');
      expect(token.type).toBe(TokenTypes.COLOR);
    });

    it('should return undefined for non-existent token', () => {
      const token = tokenValueRetriever.get('non.existent');
      expect(token).toBeUndefined();
    });
  });

  describe('getVariableReference', () => {
    beforeEach(() => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        variableReferences: mockVariableReferences,
      });
    });

    it('should return cached variable if available', async () => {
      const mockVariable = { id: 'var-id', name: 'test-var' };
      tokenValueRetriever.cachedVariableReferences.set('color.primary', mockVariable);

      const result = await tokenValueRetriever.getVariableReference('color.primary');
      expect(result).toBe(mockVariable);
      expect(mockImportVariableByKeyAsync).not.toHaveBeenCalled();
    });

    it('should import variable by key if not cached', async () => {
      const mockVariable = { id: 'var-id', name: 'test-var' };
      mockImportVariableByKeyAsync.mockResolvedValue(mockVariable);

      const result = await tokenValueRetriever.getVariableReference('color.primary');
      
      expect(mockImportVariableByKeyAsync).toHaveBeenCalledWith('variable-key-1');
      expect(result).toBe(mockVariable);
      expect(tokenValueRetriever.cachedVariableReferences.get('color.primary')).toBe(mockVariable);
    });

    it('should handle variable import failure gracefully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const testError = new Error('Import failed');
      mockImportVariableByKeyAsync.mockRejectedValue(testError);

      const result = await tokenValueRetriever.getVariableReference('color.primary');
      
      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('error importing variable', testError);
      
      consoleLogSpy.mockRestore();
    });

    it('should return false for token without variable reference', async () => {
      const result = await tokenValueRetriever.getVariableReference('non.existent');
      expect(result).toBe(false);
    });

    it('should handle reference tokens with curly braces', async () => {
      const mockVariable = { id: 'var-id', name: 'referenced-var' };
      mockImportVariableByKeyAsync.mockResolvedValue(mockVariable);

      const result = await tokenValueRetriever.getVariableReference('color.reference');
      
      expect(mockImportVariableByKeyAsync).toHaveBeenCalledWith('variable-key-1');
      expect(result).toBe(mockVariable);
    });

    it('should return null if variable is undefined after import attempt', async () => {
      mockImportVariableByKeyAsync.mockResolvedValue(null);

      const result = await tokenValueRetriever.getVariableReference('color.primary');
      expect(result).toBeNull();
    });
  });

  describe('getTokens', () => {
    it('should return the tokens map', () => {
      tokenValueRetriever.initiate({ tokens: mockTokens });
      
      const tokens = tokenValueRetriever.getTokens();
      expect(tokens).toBeInstanceOf(Map);
      expect(tokens.size).toBe(3);
      expect(tokens.has('color.primary')).toBe(true);
      expect(tokens.has('spacing.small')).toBe(true);
    });
  });

  describe('clearCache', () => {
    beforeEach(() => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        variableReferences: mockVariableReferences,
        styleReferences: mockStyleReferences,
        stylePathPrefix: 'theme',
        ignoreFirstPartForStyles: true,
        createStylesWithVariableReferences: true,
      });
      
      // Add some cached data
      tokenValueRetriever.cachedVariableReferences.set('test', { id: 'test' });
    });

    it('should clear all cached data and reset properties', () => {
      expect(tokenValueRetriever.cachedVariableReferences.size).toBe(1);
      expect(tokenValueRetriever.tokens.size).toBe(3);
      expect(tokenValueRetriever.variableReferences.size).toBe(2);
      expect(tokenValueRetriever.stylePathPrefix).toBe('theme');
      expect(tokenValueRetriever.ignoreFirstPartForStyles).toBe(true);
      expect(tokenValueRetriever.createStylesWithVariableReferences).toBe(true);

      tokenValueRetriever.clearCache();

      expect(tokenValueRetriever.cachedVariableReferences.size).toBe(0);
      expect(tokenValueRetriever.tokens.size).toBe(0);
      expect(tokenValueRetriever.variableReferences.size).toBe(0);
      expect(tokenValueRetriever.stylePathPrefix).toBeUndefined();
      expect(tokenValueRetriever.ignoreFirstPartForStyles).toBeUndefined();
      expect(tokenValueRetriever.createStylesWithVariableReferences).toBeUndefined();
    });

    it('should handle clearing when properties are undefined', () => {
      const emptyRetriever = new TokenValueRetriever();
      
      // This should not throw an error
      expect(() => emptyRetriever.clearCache()).not.toThrow();
    });

    it('should handle undefined styleReferences gracefully', () => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        styleReferences: undefined,
      });

      expect(tokenValueRetriever.variableReferences).toBeInstanceOf(Map);
      // Can't test styleReferences directly since it's private, but this ensures no errors are thrown
    });
  });

  describe('getAdjustedTokenName (private method through initiate)', () => {
    it('should adjust token name with style path prefix', () => {
      const tokens = [
        {
          name: 'color.primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
      ];

      tokenValueRetriever.initiate({
        tokens,
        stylePathPrefix: 'theme',
        styleReferences: new Map([['theme.color.primary', 'style-id-1']]),
      });

      const token = tokenValueRetriever.get('color.primary');
      expect(token.adjustedTokenName).toBe('theme.color.primary');
    });

    it('should ignore first part when ignoreFirstPartForStyles is true', () => {
      const tokens = [
        {
          name: 'global.color.primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
      ];

      tokenValueRetriever.initiate({
        tokens,
        ignoreFirstPartForStyles: true,
        styleReferences: new Map([['color.primary', 'style-id-1']]),
      });

      const token = tokenValueRetriever.get('global.color.primary');
      expect(token.styleId).toBe('style-id-1');
    });

    it('should handle single part token names with ignoreFirstPartForStyles', () => {
      const tokens = [
        {
          name: 'primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
      ];

      tokenValueRetriever.initiate({
        tokens,
        ignoreFirstPartForStyles: true,
        styleReferences: new Map([['primary', 'style-id-1']]),
      });

      const token = tokenValueRetriever.get('primary');
      expect(token.styleId).toBe('style-id-1');
    });

    it('should combine style path prefix with ignored first part', () => {
      const tokens = [
        {
          name: 'global.color.primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
      ];

      tokenValueRetriever.initiate({
        tokens,
        stylePathPrefix: 'theme',
        ignoreFirstPartForStyles: true,
        styleReferences: new Map([['theme.color.primary', 'style-id-1']]),
      });

      const token = tokenValueRetriever.get('global.color.primary');
      expect(token.styleId).toBe('style-id-1');
    });
  });

  describe('complex scenarios', () => {
    it('should handle tokens with reference values correctly', () => {
      const tokensWithReferences = [
        {
          name: 'color.primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
        {
          name: 'color.secondary',
          value: '{color.primary}',
          type: TokenTypes.COLOR,
          rawValue: '{color.primary}',
        },
      ];

      const variableRefs = new Map([
        ['color.primary', 'var-key-1'],
        ['color.secondary', 'var-key-2'],
      ]);

      tokenValueRetriever.initiate({
        tokens: tokensWithReferences,
        variableReferences: variableRefs,
      });

      const primaryToken = tokenValueRetriever.get('color.primary');
      const secondaryToken = tokenValueRetriever.get('color.secondary');

      expect(primaryToken.variableId).toBe('var-key-1');
      expect(secondaryToken.variableId).toBe('var-key-2');
      expect(secondaryToken.rawValue).toBe('{color.primary}');
    });

    it('should handle empty token array', () => {
      tokenValueRetriever.initiate({ tokens: [] });
      
      expect(tokenValueRetriever.tokens.size).toBe(0);
      expect(tokenValueRetriever.getTokens().size).toBe(0);
    });

    it('should handle tokens with different types', () => {
      const mixedTokens = [
        {
          name: 'color.primary',
          value: '#FF0000',
          type: TokenTypes.COLOR,
          rawValue: '#FF0000',
        },
        {
          name: 'spacing.small',
          value: '8px',
          type: TokenTypes.SPACING,
          rawValue: '8px',
        },
        {
          name: 'opacity.half',
          value: '0.5',
          type: TokenTypes.OPACITY,
          rawValue: '0.5',
        },
      ];

      tokenValueRetriever.initiate({ tokens: mixedTokens });

      expect(tokenValueRetriever.get('color.primary').type).toBe(TokenTypes.COLOR);
      expect(tokenValueRetriever.get('spacing.small').type).toBe(TokenTypes.SPACING);
      expect(tokenValueRetriever.get('opacity.half').type).toBe(TokenTypes.OPACITY);
    });
  });

  describe('error handling', () => {
    it('should handle malformed reference tokens', async () => {
      const tokensWithMalformedRef = [
        {
          name: 'color.malformed',
          value: '{incomplete.reference',
          type: TokenTypes.COLOR,
          rawValue: '{incomplete.reference',
        },
      ];

      tokenValueRetriever.initiate({
        tokens: tokensWithMalformedRef,
        variableReferences: new Map(),
      });

      const result = await tokenValueRetriever.getVariableReference('color.malformed');
      expect(result).toBe(false);
    });

    it('should handle undefined variableReferences gracefully', () => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        variableReferences: undefined,
      });

      expect(tokenValueRetriever.variableReferences).toBeInstanceOf(Map);
      expect(tokenValueRetriever.variableReferences.size).toBe(0);
    });

    it('should handle undefined styleReferences gracefully', () => {
      tokenValueRetriever.initiate({
        tokens: mockTokens,
        styleReferences: undefined,
      });

      expect(tokenValueRetriever.variableReferences).toBeInstanceOf(Map);
      // Can't test styleReferences directly since it's private, but this ensures no errors are thrown
    });
  });
});