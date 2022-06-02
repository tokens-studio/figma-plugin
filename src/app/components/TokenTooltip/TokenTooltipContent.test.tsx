import React from 'react';
import { TokenTooltipContent } from './TokenTooltipContent';
import { SingleBoxShadowToken, SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { render } from '../../../../tests/config/setupTest';
import tokenTypes from '@/config/tokenType.defs.json';

describe('TokenTooltip', () => {
  it('display normal TokenTooltip', () => {
    const token: SingleToken = {
      name: 'size.6',
      type: TokenTypes.SIZING,
      value: '2',
    };
    const { getByText } = render(<TokenTooltipContent token={token} />);
    expect(getByText(token.name.split('.').pop())).toBeInTheDocument();
  });

  it('display color TokenTooltip', () => {
    const token: SingleToken = {
      value: '#f8fafc',
      type: TokenTypes.COLOR,
      name: 'color.slate.50',
    };
    const { getByText } = render(<TokenTooltipContent token={token} />);
    expect(getByText(token.value)).toBeInTheDocument();
  });

  it('display Border Radius TokenTooltip', () => {
    const token: SingleToken = {
      value: '64px',
      type: TokenTypes.BORDER_RADIUS,
      name: 'border-radius.0',
    };
    const { getByText } = render(<TokenTooltipContent token={token} />);
    expect(getByText(token.value)).toBeInTheDocument();
  });

  it('display opacity TokenTooltip', () => {
    const token: SingleToken = {
      value: '10%',
      type: TokenTypes.OPACITY,
      name: 'opacity.10',
    };
    const { getByText } = render(<TokenTooltipContent token={token} />);
    expect(getByText(token.value)).toBeInTheDocument();
  });

  it('display BoxShadow TokenTooltip', () => {
    const token: SingleBoxShadowToken = {
      value: {
        x: 2,
        y: 2,
        blur: 2,
        spread: 2,
        color: '#000000',
        type: 'dropShadow',
      },
      type: TokenTypes.BOX_SHADOW,
      name: 'typography.headlines.small',
    };
    const { getByText } = render(<TokenTooltipContent token={token} />);
    expect(getByText('dropShadow')).toBeInTheDocument();
  });

  it('display FontFamily TokenTooltip', () => {
    const token: SingleToken = {
      value: 'IBM Plex Serif',
      type: tokenTypes.fontFamilies,
      name: 'font-family.serif',
    };
    const { getByText } = render(<TokenTooltipContent token={token} />);
    expect(getByText(token.name.split('.').pop())).toBeInTheDocument();
  });
});
