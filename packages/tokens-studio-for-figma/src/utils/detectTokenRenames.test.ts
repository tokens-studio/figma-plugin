import { detectTokenRenames } from './detectTokenRenames';
import { AnyTokenList } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';

describe('detectTokenRenames', () => {
  it('should detect simple token renames', () => {
    const beforeTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.primary',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
        {
          name: 'spacing.small',
          value: '8px',
          type: TokenTypes.SPACING,
        },
      ],
    };

    const afterTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.brand',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
        {
          name: 'spacing.sm',
          value: '8px',
          type: TokenTypes.SPACING,
        },
      ],
    };

    const renames = detectTokenRenames(beforeTokens, afterTokens);

    expect(renames).toHaveLength(2);
    expect(renames).toContainEqual({
      oldName: 'global.color.primary',
      newName: 'global.color.brand',
    });
    expect(renames).toContainEqual({
      oldName: 'global.spacing.small',
      newName: 'global.spacing.sm',
    });
  });

  it('should not detect renames when tokens are just added or removed', () => {
    const beforeTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.primary',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const afterTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.primary',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
        {
          name: 'color.secondary',
          value: '#00ff00',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const renames = detectTokenRenames(beforeTokens, afterTokens);

    expect(renames).toHaveLength(0);
  });

  it('should not detect renames when token values change', () => {
    const beforeTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.primary',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const afterTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.primary',
          value: '#00ff00',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const renames = detectTokenRenames(beforeTokens, afterTokens);

    expect(renames).toHaveLength(0);
  });

  it('should handle complex token values like objects', () => {
    const beforeTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'typography.heading',
          value: {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontWeight: 'bold',
          },
          type: TokenTypes.TYPOGRAPHY,
        },
      ],
    };

    const afterTokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'typography.h1',
          value: {
            fontFamily: 'Arial',
            fontSize: '24px',
            fontWeight: 'bold',
          },
          type: TokenTypes.TYPOGRAPHY,
        },
      ],
    };

    const renames = detectTokenRenames(beforeTokens, afterTokens);

    expect(renames).toHaveLength(1);
    expect(renames[0]).toEqual({
      oldName: 'global.typography.heading',
      newName: 'global.typography.h1',
    });
  });

  it('should handle multiple token sets', () => {
    const beforeTokens: Record<string, AnyTokenList> = {
      core: [
        {
          name: 'color.primary',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
      ],
      semantic: [
        {
          name: 'button.background',
          value: '{core.color.primary}',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const afterTokens: Record<string, AnyTokenList> = {
      core: [
        {
          name: 'color.brand',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
      ],
      semantic: [
        {
          name: 'button.bg',
          value: '{core.color.primary}',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const renames = detectTokenRenames(beforeTokens, afterTokens);

    expect(renames).toHaveLength(2);
    expect(renames).toContainEqual({
      oldName: 'core.color.primary',
      newName: 'core.color.brand',
    });
    expect(renames).toContainEqual({
      oldName: 'semantic.button.background',
      newName: 'semantic.button.bg',
    });
  });

  it('should return empty array when tokens are identical', () => {
    const tokens: Record<string, AnyTokenList> = {
      global: [
        {
          name: 'color.primary',
          value: '#ff0000',
          type: TokenTypes.COLOR,
        },
      ],
    };

    const renames = detectTokenRenames(tokens, tokens);

    expect(renames).toHaveLength(0);
  });
});
