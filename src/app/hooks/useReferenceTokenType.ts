import { useMemo } from 'react';
import { TokenTypes } from '@/constants/TokenTypes';

export function useReferenceTokenType(type: TokenTypes): TokenTypes[] {
  return useMemo(() => {
    switch (type) {
      case TokenTypes.SIZING:
        return [TokenTypes.SIZING, TokenTypes.DIMENSION];
      case TokenTypes.SPACING:
        return [TokenTypes.SPACING, TokenTypes.DIMENSION];
      case TokenTypes.BORDER_RADIUS:
        return [TokenTypes.BORDER_RADIUS, TokenTypes.DIMENSION];
      case TokenTypes.BORDER_WIDTH:
        return [TokenTypes.BORDER_WIDTH, TokenTypes.DIMENSION];
      default:
        return [type];
    }
  }, [type]);
}
