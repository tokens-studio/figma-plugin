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
    value: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: {
      x: '2',
      y: '2',
      blur: '2',
      spread: '2',
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
  },
  {
    name: 'typography.boxshadow.alias',
    type: TokenTypes.BOX_SHADOW,
    value: {
      x: 2,
      y: 2,
      blur: 2,
      spread: 2,
      color: '#000000',
      type: BoxShadowTypes.DROP_SHADOW,
    },
    rawValue: '{typography.headlines.boxshadow}',
  },
  {
    name: 'font-weight.regular',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
    default: '400',
    rawValue: 'Regular',
  },
  {
    name: 'font-weight.alias',
    type: TokenTypes.FONT_WEIGHTS,
    value: 'Regular',
    rawValue: '{font-weight.regular}',
    default: '400',
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
describe('TokenTooltip value', () => {
  it('tooltip test', () => {
    jest.mock('react', () => ({
      ...jest.requireActual('react'),
      useContext: jest.fn(() => {
      }),
    }));
  });
});
describe('TokenTooltip alias', () => {
  it('size alias test', () => {
    const input: SingleToken = {
      name: 'size.alias',
      type: TokenTypes.SIZING,
      value: '{size.6}',
      rawValue: '2',
    };
    const { getByText } = render(<TokenTooltipContent token={input} />);
    expect(getByText('{size.6}')).toBeInTheDocument();
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
      type: TokenTypes.TYPOGRAPHY,
      value: '{typography.headlines.small}',
    };
    expect(getAliasValue(input, tokens)).toEqual({
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
  it('font-family alias test', () => {
    const input: SingleToken = {
      name: 'font-family.alias',
      type: TokenTypes.FONT_FAMILIES,
      value: '{font-family.serif}',
    };
    expect(getAliasValue(input, tokens)).toEqual('IBM Plex Serif');
  });
});
