import { useMemo } from 'react';
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';

export function useTypeForProperty(property: string): string {
  return useMemo(() => {
    switch (property) {
      case Properties.width:
      case Properties.height:
        return TokenTypes.SIZING;
      case Properties.itemSpacing:
      case Properties.verticalPadding:
      case Properties.horizontalPadding:
      case Properties.paddingTop:
      case Properties.paddingLeft:
      case Properties.paddingBottom:
      case Properties.paddingRight:
        return TokenTypes.SPACING;
      case Properties.borderRadiusTopLeft:
      case Properties.borderRadiusTopRight:
      case Properties.borderRadiusBottomLeft:
      case Properties.borderRadiusBottomRight:
        return TokenTypes.BORDER_RADIUS;
      case Properties.borderColor:
      case Properties.fill:
        return TokenTypes.COLOR;
      case Properties.borderWidthTop:
      case Properties.borderWidthLeft:
      case Properties.borderWidthRight:
      case Properties.borderWidthBottom:
        return TokenTypes.BORDER_WIDTH;
      default:
        return property;
    }
  }, [property]);
}
