import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { AnyTokenList } from '@/types/tokens';

describe('generateTokensToCreate', () => {
  const theme: ThemeObject = {
    id: 'ThemeId:1:2',
    name: 'Light',
    selectedTokenSets: { core: TokenSetStatus.ENABLED, source: TokenSetStatus.SOURCE, disabled: TokenSetStatus.DISABLED },
  };
  const tokens: Record<string, AnyTokenList> = {
    core: [
      {
        name: 'primary.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
      },
    ],
    source: [{
      name: 'primary.green',
      value: '#00ff00',
      type: TokenTypes.COLOR,
    }],
    disabled: [{
      name: 'primary.blue',
      value: '#0000ff',
      type: TokenTypes.COLOR,
    }],
  };

  it('returns the correct tokens for enabled sets', () => {
    const { tokensToCreate } = generateTokensToCreate({ theme, tokens });

    expect(tokensToCreate).toEqual([
      {
        name: 'primary.red',
        value: '#ff0000',
        rawValue: '#ff0000',
        internal__Parent: 'core',
        type: TokenTypes.COLOR,
      },
    ]);
  });

  it('applies a flat serverResolvedTokens delta on top of local resolution', () => {
    // Leaf-level check: given a delta, the resolved value wins over local.
    // The per-theme *slicing* invariant is guarded at the caller layer, in
    // createLocalVariablesInPlugin.perThemeDelta.test.ts — this test would
    // still pass if the caller ever regressed to sharing one map across
    // themes, so it is deliberately scoped narrow.
    const singleTheme: ThemeObject = {
      id: 'x', name: 'X', selectedTokenSets: { core: TokenSetStatus.ENABLED },
    };
    const singleToken: Record<string, AnyTokenList> = {
      core: [{ name: 'color.bg', value: '#local', type: TokenTypes.COLOR }],
    };

    const { tokensToCreate } = generateTokensToCreate({
      theme: singleTheme,
      tokens: singleToken,
      serverResolvedTokens: { 'color.bg': '#ffffff' },
    });

    expect(tokensToCreate[0].value).toBe('#ffffff');
  });

  it('does not create tokens if their type is not in tokenTypesToCreateVariable', () => {
    const tokensWithInvalidType: Record<string, AnyTokenList> = {
      core: [
        {
          name: 'primary.red',
          value: '#ff0000',
          // @ts-expect-error - invalid type on purpose
          type: 'INVALID_TYPE',
        },
      ],
    };

    const { tokensToCreate } = generateTokensToCreate({ theme, tokens: tokensWithInvalidType });

    expect(tokensToCreate).toEqual([]);
  });
});
