import { useMemo } from 'react';
import { Properties } from '@/constants/Properties';

export function useTypeForProperty(property: string): string {
  return useMemo(() => {
    switch (property) {
      case Properties.width:
      case Properties.height:
        return Properties.sizing;
      case Properties.itemSpacing:
      case Properties.verticalPadding:
      case Properties.horizontalPadding:
      case Properties.paddingTop:
      case Properties.paddingLeft:
      case Properties.paddingBottom:
      case Properties.paddingRight:
        return Properties.spacing;
      case Properties.borderRadiusTopLeft:
      case Properties.borderRadiusTopRight:
      case Properties.borderRadiusBottomLeft:
      case Properties.borderRadiusBottomRight:
        return Properties.borderRadius;
      case Properties.borderColor:
        return Properties.fill;
      case Properties.borderWidthTop:
      case Properties.borderWidthLeft:
      case Properties.borderWidthRight:
      case Properties.borderWidthBottom:
        return Properties.borderWidth;
      default:
        return property;
    }
  }, [property]);
}
