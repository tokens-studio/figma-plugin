import { useMemo } from 'react';
import { TokenTypes } from '@/constants/TokenTypes';

export function useReferenceTokenType(type: TokenTypes): TokenTypes[] {
  return useMemo(() => {
    switch (type) {
      case TokenTypes.SIZING:
        return [TokenTypes.SIZING, TokenTypes.DIMENSION, TokenTypes.NUMBER];
      case TokenTypes.SPACING:
        return [TokenTypes.SPACING, TokenTypes.DIMENSION, TokenTypes.NUMBER];
      case TokenTypes.BORDER_RADIUS:
        return [TokenTypes.BORDER_RADIUS, TokenTypes.DIMENSION, TokenTypes.NUMBER];
      case TokenTypes.BORDER_WIDTH:
        return [TokenTypes.BORDER_WIDTH, TokenTypes.DIMENSION, TokenTypes.NUMBER];
      case TokenTypes.LINE_HEIGHTS:
        return [TokenTypes.LINE_HEIGHTS, TokenTypes.NUMBER, TokenTypes.DIMENSION];
      case TokenTypes.FONT_SIZES:
        return [TokenTypes.FONT_SIZES, TokenTypes.NUMBER, TokenTypes.DIMENSION];
      case TokenTypes.PARAGRAPH_SPACING:
        return [TokenTypes.PARAGRAPH_SPACING, TokenTypes.NUMBER, TokenTypes.DIMENSION];
      case TokenTypes.PARAGRAPH_INDENT:
        return [TokenTypes.PARAGRAPH_INDENT, TokenTypes.NUMBER, TokenTypes.DIMENSION];
      case TokenTypes.LETTER_SPACING:
        return [TokenTypes.LETTER_SPACING, TokenTypes.NUMBER, TokenTypes.DIMENSION];
      default:
        return [type];
    }
  }, [type]);
}
