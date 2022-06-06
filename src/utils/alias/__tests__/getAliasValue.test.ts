import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { getAliasValue } from '../getAliasValue';
import { SingleToken } from '@/types/tokens';

const inputTokens = [
  {
    name: 'colors.hex',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.rgba',
    value: 'rgba(0, 255, 0, 0.5)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.rgbaalias',
    value: 'rgba($colors.hex, 0.5)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.lightness_base',
    value: '25',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.lightness',
    value: '$colors.lightness_base * 3.5 + 0.175',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.hsla_1',
    value: 'hsl(172,50%,{colors.lightness_base}%)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.hsla_2',
    value: 'hsl(172,50%,{colors.lightness}%)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.hsla_3',
    value: 'hsla(172,50%,{colors.lightness}%, 0.5)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'alias.complex',
    value: '$base.scale * $base.ratio ^ round((200 + 400 - $base.index) / 100)',
  },
  {
    name: 'alias.round2',
    value: '$alias.complex + $alias.complex * ((1100 - 400) / 100)',
  },
  {
    name: 'alias.round3',
    value: '$alias.round2 * 1.5',
  },
  {
    name: 'colors.zero',
    value: 0,
    type: TokenTypes.COLOR,
  },
  {
    name: 'base.scale',
    value: '2',
  },
  {
    name: 'base.ratio',
    value: '2',
  },
  {
    name: 'base.index',
    value: '400',
  },
  {
    name: 'alias.cantresolve',
    value: 'rgba({notexisting}, 1)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'alias.cantresolveopacity',
    value: 'rgba(255, 255, 0, {notexisting})',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.the one with spaces',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.aliasspaces',
    value: '{colors.the one with spaces}',
    type: TokenTypes.COLOR,
  },
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
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: 16,
      y: 16,
      blur: 16,
      spread: 0,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: '16',
      y: '16',
      blur: '16',
      spread: '0',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
  },
  {
    name: 'type',
    type: TokenTypes.TYPOGRAPHY,
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
  },
  {
    name: 'size.6',
    type: TokenTypes.SIZING,
    value: 2,
  },
  {
    name: 'size.alias',
    type: TokenTypes.SIZING,
    value: '{size.6}',
  },
  {
    name: 'color.slate.50',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
  },
  {
    name: 'color.alias',
    type: TokenTypes.COLOR,
    value: '{color.slate.50}',
  },
  {
    name: 'border-radius.0',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
  },
  {
    name: 'border-radius.alias',
    type: TokenTypes.BORDER_RADIUS,
    value: '{border-radius.0}',
  },
  {
    name: 'opacity.10',
    type: TokenTypes.OPACITY,
    value: '10%',
  },
  {
    name: 'opacity.alias',
    type: TokenTypes.OPACITY,
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
  },
  {
    name: 'typography.alias',
    type: TokenTypes.TYPOGRAPHY,
    value: '{typography.headlines.small}',
  },
  {
    name: 'font-family.serif',
    type: TokenTypes.FONT_FAMILIES,
    value: 'IBM Plex Serif',
  },
  {
    name: 'font-family.alias',
    type: TokenTypes.FONT_FAMILIES,
    value: '{font-family.serif}',
  },
  {
    name: 'line-height.1',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
  },
  {
    name: 'line-height.alias',
    type: TokenTypes.LINE_HEIGHTS,
    value: '{line-height.1}',
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
      color: '#0000ff',
      type: BoxShadowTypes.INNER_SHADOW,
    }],
  },
  {
    name: 'typography.boxshadow.alias',
    type: TokenTypes.BOX_SHADOW,
    value: '{typography.headlines.boxshadow}',
  },
  {
    name: 'font-weight.regular',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
  },
  {
    name: 'font-weight.alias',
    type: TokenTypes.FONT_WEIGHTS,
    value: '{font-weight.regular}',
  },
  {
    name: 'font-style.normal',
    type: TokenTypes.OTHER,
    value: 'normal',
  },
  {
    name: 'font-style.alias',
    type: TokenTypes.OTHER,
    value: '{font-style.normal}',
  },
];
const expectedTokens = [
  {
    name: 'colors.hex',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.rgba',
    value: '#00ff0080',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.rgbaalias',
    value: '#ff000080',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.lightness_base',
    value: 25,
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.lightness',
    value: 87.675,
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.hsla_1',
    value: '#206057',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.hsla_2',
    value: '#d0efeb',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.hsla_3',
    value: '#d0efeb80',
    type: TokenTypes.COLOR,
  },
  {
    name: 'alias.complex',
    value: 8,
  },
  {
    name: 'alias.round2',
    value: 64,
  },
  {
    name: 'alias.round3',
    value: 96,
  },
  {
    name: 'colors.zero',
    value: 0,
    type: TokenTypes.COLOR,
  },
  {
    name: 'base.scale',
    value: 2,
  },
  {
    name: 'base.ratio',
    value: 2,
  },
  {
    name: 'base.index',
    value: 400,
  },
  {
    name: 'alias.cantresolve',
    value: 'rgba({notexisting}, 1)',
    type: TokenTypes.COLOR,
  },
  {
    name: 'alias.cantresolveopacity',
    value: 'rgba(255, 255, 0, {notexisting})',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.the one with spaces',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.aliasspaces',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.foo',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'colors.deep',
    value: '#ff0000',
    type: TokenTypes.COLOR,
  },
  {
    name: 'shadow',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: 16,
      y: 16,
      blur: 16,
      spread: 0,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: 16,
      y: 16,
      blur: 16,
      spread: 0,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
  },
  {
    name: 'type',
    type: TokenTypes.TYPOGRAPHY,
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
  },
  {
    name: 'size.6',
    type: TokenTypes.SIZING,
    value: 2,
  },
  {
    name: 'size.alias',
    type: TokenTypes.SIZING,
    value: 2,
  },
  {
    name: 'color.slate.50',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
  },
  {
    name: 'color.alias',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
  },
  {
    name: 'border-radius.0',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
  },
  {
    name: 'border-radius.alias',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
  },
  {
    name: 'opacity.10',
    type: TokenTypes.OPACITY,
    value: '10%',
  },
  {
    name: 'opacity.alias',
    type: TokenTypes.OPACITY,
    value: '10%',
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
  },
  {
    name: 'font-family.serif',
    type: TokenTypes.FONT_FAMILIES,
    value: 'IBM Plex Serif',
  },
  {
    name: 'font-family.alias',
    type: TokenTypes.FONT_FAMILIES,
    value: 'IBM Plex Serif',
  },
  {
    name: 'line-height.1',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
  },
  {
    name: 'line-height.alias',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
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
      color: '#0000ff',
      type: BoxShadowTypes.INNER_SHADOW,
    }],
  },
  {
    name: 'font-weight.regular',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
  },
  {
    name: 'font-weight.alias',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
  },
  {
    name: 'font-style.normal',
    type: TokenTypes.OTHER,
    value: 'normal',
  },
  {
    name: 'font-style.alias',
    type: TokenTypes.OTHER,
    value: 'normal',
  },
];
describe('getAliasValue', () => {
  inputTokens.forEach((token, idx) => {
    it(`alias ${token.name}`, () => {
      // @TODO check this test typing
      expect(getAliasValue(token as SingleToken, inputTokens as unknown as SingleToken[])).toEqual(expectedTokens[idx].value);
    });
  });
});
