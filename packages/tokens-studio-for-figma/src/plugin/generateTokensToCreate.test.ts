import { generateTokensToCreate } from './generateTokensToCreate';
import { ThemeObject } from '@/types';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

describe('generateTokensToCreate', () => {
  const theme: ThemeObject = {
    id: 'ThemeId:1:2',
    name: 'Light',
    selectedTokenSets: { core: TokenSetStatus.ENABLED, source: TokenSetStatus.SOURCE, disabled: TokenSetStatus.DISABLED },
  };
  const tokens = {
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
    const result = generateTokensToCreate(theme, tokens);

    expect(result).toEqual([
      {
        name: 'primary.red',
        value: '#ff0000',
        rawValue: '#ff0000',
        internal__Parent: 'core',
        type: TokenTypes.COLOR,
      },
    ]);
  });

  it('does not create tokens if their type is not in tokenTypesToCreateVariable', () => {
    const tokensWithInvalidType = {
      core: [
        {
          name: 'primary.red',
          value: '#ff0000',
          type: 'INVALID_TYPE',
        },
      ],
    };

    const result = generateTokensToCreate(theme, tokensWithInvalidType);

    expect(result).toEqual([]);
  });
});
