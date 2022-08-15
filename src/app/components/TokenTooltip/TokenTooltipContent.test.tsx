import React from 'react';
import { TokenTooltipContent } from './TokenTooltipContent';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { render } from '../../../../tests/config/setupTest';
import { TokensContext } from '@/context';

const tokens: SingleToken[] = [
  {
    name: 'size.regular',
    type: TokenTypes.SIZING,
    value: '10',
    rawValue: '10',
    description: 'regular sizing token',
  },
  {
    name: 'size.alias',
    type: TokenTypes.SIZING,
    value: '10',
    rawValue: '{size.regular}',
    description: 'alias sizing token',
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
    name: 'boxshadow.regular',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#f3f4f6',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#f3f4f6',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    description: 'regular shadow token',
  },
  {
    name: 'boxshadow.alias',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#f3f4f6',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: '{boxshadow.regular}',
    description: 'alias shadow token',
  },
  {
    name: 'typography.headlines.small',
    type: TokenTypes.TYPOGRAPHY,
    value: {
      fontFamily: 'aria',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
    rawValue: {
      fontFamily: 'aria',
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
    name: 'typography.headlines.alias',
    type: TokenTypes.TYPOGRAPHY,
    value: {
      fontFamily: 'aria',
      fontWeight: 'Regular',
      lineHeight: 'AUTO',
      fontSize: '14',
      letterSpacing: '0%',
      paragraphSpacing: '0',
      textDecoration: 'none',
      textCase: 'none',
    },
    rawValue: '{typography.headlines.small}',
    description: 'alias typography token',
  },
  {
    name: 'composition.regular',
    type: TokenTypes.COMPOSITION,
    value: {
      fill: '#f8fafc',
      sizing: '10'
    },
    rawValue: {
      fill: '{color.slate.50}',
      sizing: '{size.2}'
    },
    description: 'regular composition token',
  },
];

const customStore = {
  resolvedTokens: tokens,
};

describe('TokenTooltipContent', () => {
  it('should return regular token tooltip content', () => {
    const sizingToken = {
      name: 'size.regular',
      type: TokenTypes.SIZING,
      value: '10',
    }
    const result = render(<TokensContext.Provider value={customStore}><TokenTooltipContent token={sizingToken as SingleToken} /></TokensContext.Provider>);
    expect(result.queryByText(String(sizingToken.name.split('.').pop()))).toBeInTheDocument();
    expect(result.queryByText(sizingToken.value)).toBeInTheDocument();
  });

  it('should return typography token tooltip content', () => {
    const typographyToken = {
      name: 'typography.headlines.small',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'aria',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
    };
    const result = render(<TokensContext.Provider value={customStore}><TokenTooltipContent token={typographyToken as SingleToken} /></TokensContext.Provider>);
    expect(result.queryByText(String(typographyToken.name.split('.').pop()))).toBeInTheDocument();
    expect(result.queryByText(`Font: ${typographyToken.value.fontFamily}`)).toBeInTheDocument();
    expect(result.queryByText(`Weight: ${typographyToken.value.fontWeight}`)).toBeInTheDocument();
    expect(result.queryByText(`Size: ${typographyToken.value.fontSize}`)).toBeInTheDocument();
    expect(result.queryByText(`Line Height: ${typographyToken.value.lineHeight}`)).toBeInTheDocument();
    expect(result.queryByText(`Tracking: ${typographyToken.value.letterSpacing}`)).toBeInTheDocument();
    expect(result.queryByText(`Paragraph Spacing: ${typographyToken.value.paragraphSpacing}`)).toBeInTheDocument();
    expect(result.queryByText(`Text Case: ${typographyToken.value.textCase}`)).toBeInTheDocument();
    expect(result.queryByText(`Text Decoration: ${typographyToken.value.textDecoration}`)).toBeInTheDocument();
  });

  it('should return boxShadow token tooltip content', () => {
    const boxShadowToken = {
      name: 'boxshadow.regular',
      type: TokenTypes.BOX_SHADOW,
      value: {
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#f3f4f6',
        type: BoxShadowTypes.DROP_SHADOW,
      },
    };
    const result = render(<TokensContext.Provider value={customStore}><TokenTooltipContent token={boxShadowToken as SingleToken} /></TokensContext.Provider>);
    expect(result.queryByText(String(boxShadowToken.name.split('.').pop()))).toBeInTheDocument();
    expect(result.queryByText(`${boxShadowToken.value.x} ${boxShadowToken.value.y} ${boxShadowToken.value.blur} ${boxShadowToken.value.spread} ${boxShadowToken.value.color}`)).toBeInTheDocument();
  });

  it('should return composition token tooltip content', () => {
    const compositionToken = {
      name: 'composition.regular',
      type: TokenTypes.COMPOSITION,
      value: {
        fill: '#f8fafc',
        sizing: '10'
      },
    };
    const result = render(<TokensContext.Provider value={customStore}><TokenTooltipContent token={compositionToken as SingleToken} /></TokensContext.Provider>);
    expect(result.queryByText(String(compositionToken.name.split('.').pop()))).toBeInTheDocument();
    expect(result.queryAllByText('fill :')).toHaveLength(2);
    expect(result.queryAllByText('#f8fafc')).toHaveLength(2);
  });
});
