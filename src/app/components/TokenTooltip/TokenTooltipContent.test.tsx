import React from 'react';
import { TokenTooltipContent } from './TokenTooltipContent';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { render } from '../../../../tests/config/setupTest';
import { getAliasValue } from '@/utils/alias';

const tokens: SingleToken[] = [
  {
    name: 'size.6',
    type: TokenTypes.SIZING,
    value: '2',
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
    name: 'border-radius.0',
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
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: 2,
      y: 2,
      blur: 2,
      spread: 2,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
  },
  {
    name: 'typography.alias',
    type: TokenTypes.BOX_SHADOW,
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
];
describe('TokenTooltip value', () => {
  it('tooltip value test', () => {
    tokens.forEach((token) => {
      const { getByText } = render(<TokenTooltipContent token={token} />);
      switch (token.type) {
        case TokenTypes.OTHER:
        case TokenTypes.COLOR:
        case TokenTypes.BORDER_RADIUS:
        case TokenTypes.SIZING:
        case TokenTypes.SPACING:
        case TokenTypes.TEXT:
        case TokenTypes.OPACITY:
        case TokenTypes.BORDER_WIDTH:
        case TokenTypes.FONT_FAMILIES:
        case TokenTypes.FONT_WEIGHTS:
        case TokenTypes.LINE_HEIGHTS:
        case TokenTypes.FONT_SIZES:
        case TokenTypes.LETTER_SPACING:
        case TokenTypes.PARAGRAPH_SPACING:
        case TokenTypes.TEXT_DECORATION:
        case TokenTypes.TEXT_CASE:
          expect(getByText(token.value)).toBeInTheDocument();
          break;
        case TokenTypes.BOX_SHADOW:
          expect(getByText('dropShadow')).toBeInTheDocument();
          break;
        case TokenTypes.TYPOGRAPHY:
          expect(getByText('fontFamily')).toBeInTheDocument();
          break;
        case TokenTypes.COMPOSITION:
          expect(getByText('sizing : {size.12}')).toBeInTheDocument();
          break;
        default:
          break;
      }
    });
  });
});
describe('TokenTooltip alias', () => {
  it('size alias test', () => {
    const input: SingleToken = {
      name: 'size.alias',
      type: TokenTypes.SIZING,
      value: '{size.6}',
    };
    expect(getAliasValue(input, tokens)).toEqual(2);
  });
  it('color alias test', () => {
    const input: SingleToken = {
      name: 'color.alias',
      type: TokenTypes.COLOR,
      value: '{color.slate.50}',
    };
    expect(getAliasValue(input, tokens)).toEqual('#f8fafc');
  });
  it('border-radius alias test', () => {
    const input: SingleToken = {
      name: 'border-radius.alias',
      type: TokenTypes.BORDER_RADIUS,
      value: '{border-radius.0}',
    };
    expect(getAliasValue(input, tokens)).toEqual('64px');
  });
  it('opacity alias test', () => {
    const input: SingleToken = {
      name: 'opacity.alias',
      type: TokenTypes.OPACITY,
      value: '{opacity.10}',
    };
    expect(getAliasValue(input, tokens)).toEqual('10%');
  });
  it('typography alias test', () => {
    const input: SingleToken = {
      name: 'typography.alias',
      type: TokenTypes.BOX_SHADOW,
      value: '{typography.headlines.small}',
    };
    expect(getAliasValue(input, tokens)).toEqual({
      x: 2,
      y: 2,
      blur: 2,
      spread: 2,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    });
  });
  it('font-family alias test', () => {
    const input: SingleToken = {
      name: 'font-family.alias',
      type: TokenTypes.FONT_FAMILIES,
      value: '{font-family.serif}',
    };
    expect(getAliasValue(input, tokens)).toEqual('IBM Plex Serif');
  });
});
