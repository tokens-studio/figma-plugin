import React from 'react';
import { TokenTooltipContent } from './TokenTooltipContent';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { render } from '../../../../tests/config/setupTest';
import { TokensContext } from '@/context';

const tokens: SingleToken[] = [
  {
    name: 'size.2',
    type: TokenTypes.SIZING,
    value: 'test-value-size.2',
    rawValue: 'test-value-size.2',
    description: 'regular size token',
  },
  {
    name: 'size.alias',
    type: TokenTypes.SIZING,
    value: 'test-value-size.2',
    rawValue: '{size.2}',
    description: 'alias size token',
  },
  {
    name: 'color.slate.50',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
    rawValue: '#f8fafc',
    description: 'regular color token',
  },
  {
    name: 'color.alias',
    type: TokenTypes.COLOR,
    value: '#f8fafc',
    rawValue: '{color.slate.50}',
    description: 'alias color token',
  },
  {
    name: 'border-radius.0',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
    rawValue: '64px',
    description: 'regular radius token',
  },
  {
    name: 'border-radius.alias',
    type: TokenTypes.BORDER_RADIUS,
    value: '64px',
    rawValue: '{border-radius.0}',
    description: 'alias size token',
  },
  {
    name: 'opacity.10',
    type: TokenTypes.OPACITY,
    value: '10%',
    rawValue: '10%',
    description: 'regular opacity token',
  },
  {
    name: 'opacity.alias',
    type: TokenTypes.OPACITY,
    value: '10%',
    rawValue: '{opacity.10}',
    description: 'alias size token',
  },
  {
    name: 'boxshadow.regular',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: 'test-value-object-value',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: 'test-value-object-value',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    description: 'regular shadow token',
  },
  {
    name: 'typography.headlines.small',
    type: TokenTypes.TYPOGRAPHY,
    value: {
      fontFamily: 'test-value-object-value',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
    rawValue: {
      fontFamily: 'test-value-object-value',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
    description: 'regular typography token',
  },
  {
    name: 'font-family.serif',
    type: TokenTypes.FONT_FAMILIES,
    value: 'IBM Plex Serif',
    rawValue: 'IBM Plex Serif',
    description: 'regular fontFamily token',
  },
  {
    name: 'font-family.alias',
    type: TokenTypes.FONT_FAMILIES,
    value: 'IBM Plex Serif',
    rawValue: '{font-family.serif}',
    description: 'alias fontFamily token',
  },
  {
    name: 'line-height.1',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
    rawValue: '130%',
    description: 'regular line height token',
  },
  {
    name: 'line-height.alias',
    type: TokenTypes.LINE_HEIGHTS,
    value: '130%',
    rawValue: '{line-height.1}',
    description: 'alias line height token',

  },
  {
    name: 'font-weight.regular',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
    rawValue: 'Regular',
    description: 'regular font weight token',
  },
  {
    name: 'font-weight.alias',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
    rawValue: '{font-weight.regular}',
    description: 'alias font weight token',
  },
  {
    name: 'font-style.other',
    type: TokenTypes.OTHER,
    value: 'normal',
    rawValue: 'normal',
    description: 'regular other token',
  },
  {
    name: 'font-style.alias',
    type: TokenTypes.OTHER,
    value: 'normal',
    rawValue: '{font-style.other}',
    description: 'alias other token',
  },
];

const customStore = {
  resolvedTokens: tokens,
};

describe('TokenTooltip alias', () => {
  tokens.forEach((token) => {
    it(`can resolve ${token.description}`, () => {
      const { getByText } = render(<TokensContext.Provider value={customStore}><TokenTooltipContent token={{ ...token, value: token.rawValue }} /></TokensContext.Provider>);

      expect(getByText(String(token.description))).toBeInTheDocument();
      expect(getByText((content) => (typeof token.value === 'object' ? content.includes('test-value-object-value') : content.includes(String(token.value))))).toBeInTheDocument();
      expect(getByText((content) => (typeof token.rawValue === 'object' ? content.includes('test-value-object-value') : content.includes(String(token.rawValue))))).toBeInTheDocument();
      expect(getByText(String(token.name.split('.').pop()))).toBeInTheDocument();
    });
  });
});
