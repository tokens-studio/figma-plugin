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

  it('applies serverResolvedTokens delta on top of local resolution (per-mode invariant)', () => {
    // Regression guard for the multi-mode variable export bug: each theme in a
    // multi-mode export must receive its OWN server-resolved delta so modes get
    // distinct values. A shared delta across themes would clobber every mode
    // with the same value.
    const lightTheme: ThemeObject = {
      id: 'light',
      name: 'Light',
      group: 'Mode',
      selectedTokenSets: { core: TokenSetStatus.ENABLED },
    };
    const darkTheme: ThemeObject = {
      id: 'dark',
      name: 'Dark',
      group: 'Mode',
      selectedTokenSets: { core: TokenSetStatus.ENABLED },
    };
    const tokensForMultiMode: Record<string, AnyTokenList> = {
      core: [{ name: 'color.bg', value: '#local', type: TokenTypes.COLOR }],
    };

    const light = generateTokensToCreate({
      theme: lightTheme,
      tokens: tokensForMultiMode,
      serverResolvedTokens: { 'color.bg': '#ffffff' },
    });
    const dark = generateTokensToCreate({
      theme: darkTheme,
      tokens: tokensForMultiMode,
      serverResolvedTokens: { 'color.bg': '#000000' },
    });

    expect(light.tokensToCreate[0].value).toBe('#ffffff');
    expect(dark.tokensToCreate[0].value).toBe('#000000');
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
