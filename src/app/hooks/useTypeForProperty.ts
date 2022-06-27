import { useMemo } from 'react';
import { Properties } from '@/constants/Properties';

export function useTypeForProperty(property: string): string {
  return useMemo(() => {
    let type: string = '';
    switch (property) {
      case Properties.width:
      case Properties.height:
        type = Properties.sizing;
        break;
      case Properties.paddingBottom:
      case Properties.paddingLeft:
      case Properties.paddingRight:
      case Properties.paddingTop:
      case Properties.itemSpacing:
      case Properties.verticalPadding:
      case Properties.horizontalPadding:
        type = Properties.spacing;
        break;
      case Properties.borderRadiusBottomLeft:
      case Properties.borderRadiusBottomRight:
      case Properties.borderRadiusTopLeft:
      case Properties.borderRadiusTopRight:
        type = Properties.borderRadius;
        break;
      case Properties.border:
        type = Properties.fill;
        break;
      default:
        type = property;
        break;
    }
    return type;
  }, [property]);
}
