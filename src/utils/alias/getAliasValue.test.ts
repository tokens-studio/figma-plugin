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
    {
      name: 'size.6',
      type: TokenTypes.SIZING,
      value: '2',
      rawValue: '2',
    },
    {
      name: 'size.alias',
      type: TokenTypes.SIZING,
      value: '2',
      rawValue: '{size.6}',
    },
    {
      name: 'color.slate.50',
      type: TokenTypes.COLOR,
      value: '#f8fafc',
      rawValue: '#f8fafc',
    },
    {
      name: 'color.alias',
      type: TokenTypes.COLOR,
      value: '#f8fafc',
      rawValue: '{color.slate.50}',
    },
    {
      name: 'border-radius.0',
      type: TokenTypes.BORDER_RADIUS,
      value: '64px',
      rawValue: '64px',
    },
    {
      name: 'border-radius.alias',
      type: TokenTypes.BORDER_RADIUS,
      value: '64px',
      rawValue: '{border-radius.0}',
    },
    {
      name: 'opacity.10',
      type: TokenTypes.OPACITY,
      value: '10%',
      rawValue: '10%',
    },
    {
      name: 'opacity.alias',
      type: TokenTypes.OPACITY,
      rawValue: '10%',
      value: '{opacity.10}',
    },
    {
      name: 'typography.headlines.small',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      rawValue: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
    },
    {
      name: 'typography.alias',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      rawValue: '{typography.headlines.small}',
    },
    {
      name: 'font-family.serif',
      type: TokenTypes.FONT_FAMILIES,
      value: 'IBM Plex Serif',
      rawValue: 'IBM Plex Serif',
    },
    {
      name: 'font-family.alias',
      type: TokenTypes.FONT_FAMILIES,
      rawValue: '{font-family.serif}',
      value: 'IBM Plex Serif',
    },
    {
      name: 'line-height.1',
      type: TokenTypes.LINE_HEIGHTS,
      value: '130%',
      rawValue: '130%',
    },
    {
      name: 'line-height.alias',
      type: TokenTypes.LINE_HEIGHTS,
      value: '130%',
      rawValue: '{line-height.1}',
    },
    {
      name: 'typography.headlines.boxshadow',
      type: TokenTypes.BOX_SHADOW,
      value: [{
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      }, {
        x: '3',
        y: '3',
        blur: '3',
        spread: '3',
        color: '#3300ff',
        type: BoxShadowTypes.INNER_SHADOW,
      }],
      rawValue: [{
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      }, {
        x: '3',
        y: '3',
        blur: '3',
        spread: '3',
        color: '#0000ff',
        type: BoxShadowTypes.INNER_SHADOW,
      }],
    },
    {
      name: 'typography.boxshadow.alias',
      type: TokenTypes.BOX_SHADOW,
      value: [{
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      }, {
        x: '3',
        y: '3',
        blur: '3',
        spread: '3',
        color: '#3300ff',
        type: BoxShadowTypes.INNER_SHADOW,
      }],
      rawValue: '{typography.headlines.boxshadow}',
    },
    {
      name: 'font-weight.regular',
      type: TokenTypes.FONT_WEIGHTS,
      value: 'Regular',
      rawValue: 'Regular',
    },
    {
      name: 'font-weight.alias',
      type: TokenTypes.FONT_WEIGHTS,
      value: 'Regular',
      rawValue: '{font-weight.regular}',
    },
    {
      name: 'font-style.normal',
      type: TokenTypes.OTHER,
      value: 'normal',
      rawValue: 'normal',
    },
    {
      name: 'font-style.alias',
      type: TokenTypes.OTHER,
      value: 'normal',
      rawValue: '{font-style.normal}',
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
  it('resolves a shadow array alias', () => {
    const input: SingleToken = {
      name: 'shadowAlias',
      value: '{typography.headlines.boxshadow}',
      type: TokenTypes.BOX_SHADOW,
    };
    expect(getAliasValue(input, allTokens)).toEqual([{
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    }, {
      x: '3',
      y: '3',
      blur: '3',
      spread: '3',
      color: '#3300ff',
      type: BoxShadowTypes.INNER_SHADOW,
    }]);
  });
  it('resolves a typography alias', () => {
    const input: SingleToken = {
      name: 'typographyAlias',
      value: '{typography.headlines.small}',
      type: TokenTypes.TYPOGRAPHY,
    };
    expect(getAliasValue(input, allTokens)).toEqual({
      fontFamily: 'Inter',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    });
  });
});
