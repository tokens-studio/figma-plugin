import { TokenTypes } from '@tokens-studio/types';
import { filterAndGroupTokens } from '../tokenOrchestration';

describe('Living Documentation', () => {
  describe('filterAndGroupTokens', () => {
    const mockTokens = [
      {
        name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
      },
      {
        name: 'color.secondary', type: TokenTypes.COLOR, value: '#00FF00', internal__Parent: 'core',
      },
      {
        name: 'spacing.small', type: TokenTypes.SPACING, value: '8px', internal__Parent: 'base',
      },
      {
        name: 'spacing.medium', type: TokenTypes.SPACING, value: '16px', internal__Parent: 'base',
      },
      {
        name: 'typography.heading', type: TokenTypes.TYPOGRAPHY, value: '24px', internal__Parent: 'base',
      },
    ];

    it('should filter tokens by startsWith prefix', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', 'color');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
          },
          {
            name: 'color.secondary', type: TokenTypes.COLOR, value: '#00FF00', internal__Parent: 'core',
          },
        ],
      });
    });

    it('should group tokens by set when tokenSet is "All"', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', '');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
          },
          {
            name: 'color.secondary', type: TokenTypes.COLOR, value: '#00FF00', internal__Parent: 'core',
          },
        ],
        base: [
          {
            name: 'spacing.small', type: TokenTypes.SPACING, value: '8px', internal__Parent: 'base',
          },
          {
            name: 'spacing.medium', type: TokenTypes.SPACING, value: '16px', internal__Parent: 'base',
          },
          {
            name: 'typography.heading', type: TokenTypes.TYPOGRAPHY, value: '24px', internal__Parent: 'base',
          },
        ],
      });
    });

    it('should filter by specific set when tokenSet is provided', () => {
      const result = filterAndGroupTokens(mockTokens, 'core', '');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
          },
          {
            name: 'color.secondary', type: TokenTypes.COLOR, value: '#00FF00', internal__Parent: 'core',
          },
        ],
      });
    });

    it('should return empty object when no tokens match', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', 'nonexistent');

      expect(result).toEqual({});
    });

    it('should handle tokens without internal__Parent', () => {
      const tokensWithoutParent = [
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
      const singleTokenSet = [
        {
          name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
        },
      ];

      const result = filterAndGroupTokens(singleTokenSet, 'All', '');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
          },
        ],
      });
    });

    it('should handle multiple sets with different token types', () => {
      const multiSetTokens = [
        {
          name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
        },
        {
          name: 'spacing.small', type: TokenTypes.SPACING, value: '8px', internal__Parent: 'base',
        },
        {
          name: 'typography.heading', type: TokenTypes.TYPOGRAPHY, value: '24px', internal__Parent: 'semantic',
        },
      ];

      const result = filterAndGroupTokens(multiSetTokens, 'All', '');

      expect(result).toEqual({
        core: [
          {
            name: 'color.primary', type: TokenTypes.COLOR, value: '#FF0000', internal__Parent: 'core',
          },
        ],
        base: [
          {
            name: 'spacing.small', type: TokenTypes.SPACING, value: '8px', internal__Parent: 'base',
          },
        ],
        semantic: [
          {
            name: 'typography.heading', type: TokenTypes.TYPOGRAPHY, value: '24px', internal__Parent: 'semantic',
          },
        ],
      });
    });
  });
});
