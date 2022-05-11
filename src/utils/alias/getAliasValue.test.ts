import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { getAliasValue } from './getAliasValue';

describe('getAliasValue', () => {
  const allTokens: SingleToken[] = [
    {
      name: 'colors.foo',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.deep',
      value: '{colors.foo}',
      type: TokenTypes.COLOR,
    },
    {
      name: 'shadow',
      value: {
        x: '16',
        y: '16',
        blur: '16',
        spread: '0',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      type: TokenTypes.BOX_SHADOW,
    },
    {
      name: 'type',
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '18',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      type: TokenTypes.TYPOGRAPHY,
    },
  ];
  it('resolves a simple alias', () => {
    const input: SingleToken = {
      name: 'colors.alias',
      type: TokenTypes.COLOR,
      value: '{colors.foo}',
    };
    expect(getAliasValue(input, allTokens)).toEqual('#ff0000');
  });
  it('resolves a nested alias', () => {
    const input: SingleToken = {
      name: 'colors.aliasdeep',
      type: TokenTypes.COLOR,
      value: '{colors.deep}',
    };
    expect(getAliasValue(input, allTokens)).toEqual('#ff0000');
  });
  it('resolves a shadow alias', () => {
    const input: SingleToken = {
      name: 'shadowAlias',
      value: '{shadow}',
      type: TokenTypes.BOX_SHADOW,
    };
    expect(getAliasValue(input, allTokens)).toEqual({
      x: '16',
      y: '16',
      blur: '16',
      spread: '0',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    });
  });
  it('resolves a typography alias', () => {
    const input: SingleToken = {
      name: 'typographyAlias',
      value: '{type}',
      type: TokenTypes.TYPOGRAPHY,
    };
    expect(getAliasValue(input, allTokens)).toEqual({
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '18',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    });
  });
});
