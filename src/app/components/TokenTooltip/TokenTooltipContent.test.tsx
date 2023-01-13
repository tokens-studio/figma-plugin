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
      spread: '192px',
      color: 'test-value-object-value',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '192px',
      color: 'test-value-object-value',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    description: 'regular shadow token',
  },
  {
    name: 'boxshadow.regular',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '192px',
      color: 'test-value-object-value',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: '{boxshadow.regular}',
    description: 'alias shadow token',
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
    name: 'typography.headlines.default',
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
    rawValue: '{typography.headlines.small}',
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
  {
    name: 'card.default',
    type: TokenTypes.COMPOSITION,
    value: {
      spacing: 'test-value-object-value',
      borderRadius: '6px',
    },
    rawValue: {
      spacing: 'test-value-object-value',
      borderRadius: '6px',
    },
    description: 'composition token',
  },
  {
    name: 'brokentoken',
    type: TokenTypes.COLOR,
    value: '{doesntexist}',
    rawValue: '{doesntexist}',
    description: 'a broken reference',
    failedToResolve: true,
  },
  {
    name: 'border.regular',
    type: TokenTypes.BORDER,
    value: {
      color: 'test-value-object-value',
      width: '12px',
      style: 'solid',
    },
    rawValue: {
      color: 'test-value-object-value',
      width: '12px',
      style: 'solid',
    },
    description: 'border token',
  },
  {
    name: 'other.object',
    type: 'object' as TokenTypes,
    value: {
      other: 'test-value-object-value',
    },
    rawValue: {
      other: 'test-value-object-value',
    },
    description: 'value is object',
  } as SingleToken,
  {
    name: 'other.object-alias',
    type: 'object' as TokenTypes,
    value: {
      other: 'test-value-object-value',
    },
    rawValue: '{other.object}',
    description: 'object value alias',
  } as SingleToken,
];

const shadowTokens = [
  {
    name: 'boxshadow.multiple',
    type: TokenTypes.BOX_SHADOW,
    value: [
      {
        x: '1px',
        y: '2px',
        blur: '3px',
        spread: '14px',
        color: '#212121',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      {
        x: '8px',
        y: '5px',
        blur: '7px',
        spread: '9px',
        color: '#999999',
        type: BoxShadowTypes.DROP_SHADOW,
      },
    ],
    rawValue: [
      {
        x: '1px',
        y: '2px',
        blur: '3px',
        spread: '14px',
        color: '#212121',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      {
        x: '8px',
        y: '5px',
        blur: '7px',
        spread: '9px',
        color: '#999999',
        type: BoxShadowTypes.DROP_SHADOW,
      },
    ],
    description: 'multiple shadow tokens',
  },
  {
    name: 'boxshadow.reference',
    type: TokenTypes.BOX_SHADOW,
    value: [
      {
        x: '1px',
        y: '2px',
        blur: '3px',
        spread: '14px',
        color: '#212121',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      {
        x: '8px',
        y: '5px',
        blur: '7px',
        spread: '9px',
        color: '#999999',
        type: BoxShadowTypes.DROP_SHADOW,
      },
    ],
    rawValue: '{boxshadow.multiple}',
    description: 'reference shadow token',
  },
];

const faultyTokens = [
  {
    name: 'faulty.token',
    type: TokenTypes.COLOR,
    value: {
      x: 'foobar',
    },
    rawValue: {
      x: 'foobar',
    },
    description: 'when value is an object',
  },
  {
    name: 'faulty.token.alias',
    type: TokenTypes.COLOR,
    value: {
      x: 'foobar',
    },
    rawValue: '{faulty.token}',
    description: 'when value is an object reference',
  },
];

const customStore = {
  resolvedTokens: tokens,
};

const shadowStore = {
  resolvedTokens: shadowTokens,
};

const faultyStore = {
  resolvedTokens: faultyTokens,
};

describe('TokenTooltip alias', () => {
  tokens.forEach((token) => {
    it(`can resolve ${token.description}`, () => {
      const { getByText } = render(
        <TokensContext.Provider value={customStore}>
          <TokenTooltipContent token={{ ...token, value: token.rawValue }} />
        </TokensContext.Provider>,
      );

      expect(getByText(String(token.description))).toBeInTheDocument();
      expect(getByText((content) => (typeof token.value === 'object' ? content.includes('test-value-object-value') : content.includes(String(token.value))))).toBeInTheDocument();
      expect(getByText((content) => (typeof token.rawValue === 'object' ? content.includes('test-value-object-value') : content.includes(String(token.rawValue))))).toBeInTheDocument();
      expect(getByText(String(token.name.split('.').pop()))).toBeInTheDocument();
    });
  });

  shadowTokens.forEach((token) => {
    it(`can resolve ${token.description}`, () => {
      const { getByText } = render(
        <TokensContext.Provider value={shadowStore}>
          <TokenTooltipContent token={{ ...token, value: token.rawValue }} />
        </TokensContext.Provider>,
      );

      expect(getByText(String(token.description))).toBeInTheDocument();
      expect(getByText(String(token.value[0].x))).toBeInTheDocument();
      expect(getByText(String(token.value[0].y))).toBeInTheDocument();
      expect(getByText(String(token.value[0].spread))).toBeInTheDocument();
      expect(getByText(String(token.value[0].blur))).toBeInTheDocument();
      expect(getByText(String(token.value[0].color))).toBeInTheDocument();
      expect(getByText(String(token.name.split('.').pop()))).toBeInTheDocument();
    });
  });

  faultyTokens.forEach((token) => {
    it(`doesnt throw when using faulty value ${token.description}`, () => {
      const { getByText } = render(
        <TokensContext.Provider value={faultyStore}>
          <TokenTooltipContent token={{ ...token, value: token.rawValue }} />
        </TokensContext.Provider>,
      );

      expect(getByText(String(token.description))).toBeInTheDocument();
    });
  });

  it('shows indicator when failed to resolve', () => {
    const { getByText, getByTestId } = render(
      <TokensContext.Provider value={customStore}>
        <TokenTooltipContent
          token={{
            name: 'brokentoken',
            type: TokenTypes.COLOR,
            value: '{doesntexist}',
            rawValue: '{doesntexist}',
            description: 'a broken reference',
          }}
        />
      </TokensContext.Provider>,
    );

    expect(getByText(String('brokentoken'))).toBeInTheDocument();
    expect(getByTestId('not-found-badge')).toBeInTheDocument();
  });
});
