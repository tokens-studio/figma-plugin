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

    it('should group tokens by set when tokenSet is "All"', () => {
      const result = filterAndGroupTokens(mockTokens, 'All', '');

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
        ],
      });
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

    it('should handle multiple sets with different token types', () => {
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

    describe('regex mode', () => {
      it('should filter tokens using regex when useRegex is true', () => {
        const result = filterAndGroupTokens(mockTokens, 'All', '^color\\.(primary|secondary)$', true);

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

      it('should filter tokens with regex pattern for spacing', () => {
        const result = filterAndGroupTokens(mockTokens, 'All', 'spacing\\.(small|medium)', true);

        expect(result).toEqual({
          base: [
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
          ],
        });
      });

      it('should fall back to startsWith when regex is invalid', () => {
        const result = filterAndGroupTokens(mockTokens, 'All', 'co[lor', true); // Invalid regex - falls back to startsWith 'co[lor'

        // Since 'co[lor' doesn't start any of our token names, result should be empty
        expect(result).toEqual({});
      });

      it('should handle empty regex pattern', () => {
        const result = filterAndGroupTokens(mockTokens, 'All', '', true);

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
          ],
        });
      });

      it('should work with specific token set and regex', () => {
        const result = filterAndGroupTokens(mockTokens, 'core', 'color\\.(primary)', true);

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

      it('should return empty when regex matches no tokens', () => {
        const result = filterAndGroupTokens(mockTokens, 'All', 'nonexistent.*', true);

        expect(result).toEqual({});
      });
    });
  });
});
