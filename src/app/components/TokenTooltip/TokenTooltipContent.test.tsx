import React from 'react';
import { TokenTooltipContent } from './TokenTooltipContent';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { render } from '../../../../tests/config/setupTest';

const tokens: SingleToken[] = [
  {
    name: 'size.6',
    type: TokenTypes.SIZING,
    value: '2',
  },
  {
    value: '#f8fafc',
    type: TokenTypes.COLOR,
    name: 'color.slate.50',
  },
  {
    value: '64px',
    type: TokenTypes.BORDER_RADIUS,
    name: 'border-radius.0',
  },
  {
    value: '10%',
    type: TokenTypes.OPACITY,
    name: 'opacity.10',
  },
  {
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
  },
  {
    value: 'IBM Plex Serif',
    type: TokenTypes.FONT_FAMILIES,
    name: 'font-family.serif',
  },
  {
    name: 'compositiontoken',
    value: {
      sizing: '{size.12}',
    },
    type: TokenTypes.COMPOSITION,
  },
];
describe('TokenTooltip', () => {
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
