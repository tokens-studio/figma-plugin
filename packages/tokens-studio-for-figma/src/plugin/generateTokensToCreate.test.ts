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

  it('excludes deprecated tokens when skipDeprecated is true', () => {
    const tokensWithDeprecated: Record<string, AnyTokenList> = {
      core: [
        { name: 'primary.red', value: '#ff0000', type: TokenTypes.COLOR },
        { name: 'primary.blue', value: '#0000ff', type: TokenTypes.COLOR, $deprecated: true },
      ],
    };

    const { tokensToCreate } = generateTokensToCreate({ theme, tokens: tokensWithDeprecated, skipDeprecated: true });

    expect(tokensToCreate.map((t) => t.name)).toEqual(['primary.red']);
  });

  it('includes deprecated tokens when skipDeprecated is false (default)', () => {
    const tokensWithDeprecated: Record<string, AnyTokenList> = {
      core: [
        { name: 'primary.red', value: '#ff0000', type: TokenTypes.COLOR },
        { name: 'primary.blue', value: '#0000ff', type: TokenTypes.COLOR, $deprecated: true },
      ],
    };

    const { tokensToCreate } = generateTokensToCreate({ theme, tokens: tokensWithDeprecated });

    expect(tokensToCreate.map((t) => t.name)).toEqual(['primary.red', 'primary.blue']);
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
