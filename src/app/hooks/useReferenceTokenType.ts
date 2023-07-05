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
      default:
        return [type];
    }
  }, [type]);
}
