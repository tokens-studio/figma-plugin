import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { filterAndGroupTokens } from '../tokenOrchestration';

describe('Living Documentation', () => {
  describe('filterAndGroupTokens', () => {
    const mockTokens: SingleToken[] = [
      {
        name: 'color.primary',
        type: TokenTypes.COLOR,
        value: '#FF0000',
        internal__Parent: 'core',
      },
      {
        name: 'color.secondary',
        type: TokenTypes.COLOR,
        value: '#00FF00',
        internal__Parent: 'core',
      },
      {
        name: 'spacing.small',
        type: TokenTypes.SPACING,
        value: '8px',
        internal__Parent: 'base',
      },
      {
        name: 'spacing.medium',
        type: TokenTypes.SPACING,
        value: '16px',
        internal__Parent: 'base',
      },
      {
        name: 'typography.heading',
        type: TokenTypes.TYPOGRAPHY,
        value: '24px',
        internal__Parent: 'base',
      },
    ];

    it('should filter tokens by startsWith prefix', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', 'color');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary',
            type: TokenTypes.COLOR,
            value: '#FF0000',
            internal__Parent: 'core',
          },
          {
            name: 'color.secondary',
            type: TokenTypes.COLOR,
            value: '#00FF00',
            internal__Parent: 'core',
          },
        ],
      });
    });

    it('should group tokens by set when tokenSet is "All" and respect token set order', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', '');

      // Should maintain the order from the input tokens (core appears first, then base)
      const setKeys = Object.keys(result);
      expect(setKeys).toEqual(['core', 'base']);

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary',
            type: TokenTypes.COLOR,
            value: '#FF0000',
            internal__Parent: 'core',
          },
          {
            name: 'color.secondary',
            type: TokenTypes.COLOR,
            value: '#00FF00',
            internal__Parent: 'core',
          },
        ],
        base: [
          {
            name: 'spacing.medium',
            type: TokenTypes.SPACING,
            value: '16px',
            internal__Parent: 'base',
          },
          {
            name: 'spacing.small',
            type: TokenTypes.SPACING,
            value: '8px',
            internal__Parent: 'base',
          },
          {
            name: 'typography.heading',
            type: TokenTypes.TYPOGRAPHY,
            value: '24px',
            internal__Parent: 'base',
          },
        ],
      });
    });

    it('should sort tokens alphabetically within each set', () => {
      // Create tokens that are not in alphabetical order
      const unorderedTokens: SingleToken[] = [
        {
          name: 'zeta.token',
          type: TokenTypes.COLOR,
          value: '#FF0000',
          internal__Parent: 'test',
        },
        {
          name: 'alpha.token',
          type: TokenTypes.COLOR,
          value: '#00FF00',
          internal__Parent: 'test',
        },
        {
          name: 'beta.token',
          type: TokenTypes.COLOR,
          value: '#0000FF',
          internal__Parent: 'test',
        },
      ];

      const result = filterAndGroupTokens(unorderedTokens, 'All', '');

      expect(result.test.map((t) => t.name)).toEqual(['alpha.token', 'beta.token', 'zeta.token']);
    });

    it('should filter by specific set when tokenSet is provided', () => {
      const result = filterAndGroupTokens(mockTokens, 'core', '');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary',
            type: TokenTypes.COLOR,
            value: '#FF0000',
            internal__Parent: 'core',
          },
          {
            name: 'color.secondary',
            type: TokenTypes.COLOR,
            value: '#00FF00',
            internal__Parent: 'core',
          },
        ],
      });
    });

    it('should return empty object when no tokens match', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', 'nonexistent');

      expect(result).toEqual({});
    });

    it('should handle tokens without internal__Parent', () => {
      const tokensWithoutParent: SingleToken[] = [
        { name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000' },
        { name: 'spacing.small', type: TokenTypes.SPACING, value: '8px' },
      ];

      const result = filterAndGroupTokens(tokensWithoutParent, 'All', '');

      expect(result).toEqual({
        Default: [
          { name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000' },
          { name: 'spacing.small', type: TokenTypes.SPACING, value: '8px' },
        ],
      });
    });

    it('should handle single token set', () => {
      const singleTokenSet: SingleToken[] = [
        {
          name: 'color.primary',
          type: TokenTypes.COLOR,
          value: '#FF0000',
          internal__Parent: 'core',
        },
      ];

      const result = filterAndGroupTokens(singleTokenSet, 'All', '');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary',
            type: TokenTypes.COLOR,
            value: '#FF0000',
            internal__Parent: 'core',
          },
        ],
      });
    });

    it('should handle multiple sets with different token types and maintain token set order', () => {
      const multiSetTokens: SingleToken[] = [
        {
          name: 'color.primary',
          type: TokenTypes.COLOR,
          value: '#FF0000',
          internal__Parent: 'core',
        },
        {
          name: 'spacing.small',
          type: TokenTypes.SPACING,
          value: '8px',
          internal__Parent: 'base',
        },
        {
          name: 'typography.heading',
          type: TokenTypes.TYPOGRAPHY,
          value: '24px',
          internal__Parent: 'semantic',
        },
      ];

      const result = filterAndGroupTokens(multiSetTokens, 'All', '');

      // Should maintain order: core, base, semantic
      const setKeys = Object.keys(result);
      expect(setKeys).toEqual(['core', 'base', 'semantic']);

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary',
            type: TokenTypes.COLOR,
            value: '#FF0000',
            internal__Parent: 'core',
          },
        ],
        base: [
          {
            name: 'spacing.small',
            type: TokenTypes.SPACING,
            value: '8px',
            internal__Parent: 'base',
          },
        ],
        semantic: [
          {
            name: 'typography.heading',
            type: TokenTypes.TYPOGRAPHY,
            value: '24px',
            internal__Parent: 'semantic',
          },
        ],
      });
    });

    it('should respect the token set order from resolvedTokens input order', () => {
      // Tokens arranged in a specific order that should be preserved
      const orderedTokens: SingleToken[] = [
        {
          name: 'token.in.third',
          type: TokenTypes.COLOR,
          value: '#000000',
          internal__Parent: 'third-set',
        },
        {
          name: 'token.in.first',
          type: TokenTypes.COLOR,
          value: '#FF0000',
          internal__Parent: 'first-set',
        },
        {
          name: 'token.in.second',
          type: TokenTypes.COLOR,
          value: '#00FF00',
          internal__Parent: 'second-set',
        },
      ];

      const result = filterAndGroupTokens(orderedTokens, 'All', '');

      // The sets should appear in the order they first appear in the input
      const setKeys = Object.keys(result);
      expect(setKeys).toEqual(['third-set', 'first-set', 'second-set']);
    });
  });
});
