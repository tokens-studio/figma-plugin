import { useMemo } from 'react';
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { PropertyObject } from '@/types/properties';
import { isPropertyType } from '@/utils/is';

export function usePropertiesForTokenType(type: TokenTypes): PropertyObject[] {
  return useMemo(() => {
    const properties: PropertyObject[] = [];
    switch (type) {
      case TokenTypes.BORDER_RADIUS:
        properties.push(
          {
            label: 'All',
            name: Properties.borderRadius,
            clear: [
              Properties.borderRadiusTopLeft,
              Properties.borderRadiusTopRight,
              Properties.borderRadiusBottomRight,
              Properties.borderRadiusBottomLeft,
            ],
          },
          { label: 'Top Left', name: Properties.borderRadiusTopLeft },
          { label: 'Top Right', name: Properties.borderRadiusTopRight },
          { label: 'Bottom Right', name: Properties.borderRadiusBottomRight },
          { label: 'Bottom Left', name: Properties.borderRadiusBottomLeft },
        );
        break;
      case TokenTypes.SPACING:
        properties.push(
          { label: 'Gap', name: Properties.itemSpacing, icon: 'Gap' },
          {
            label: 'All',
            icon: 'Spacing',
            name: Properties.spacing,
            clear: [
              Properties.horizontalPadding,
              Properties.verticalPadding,
              Properties.itemSpacing,
              Properties.paddingLeft,
              Properties.paddingRight,
              Properties.paddingTop,
              Properties.paddingBottom,
            ],
          },
          { label: 'Top', name: Properties.paddingTop },
          { label: 'Right', name: Properties.paddingRight },
          { label: 'Bottom', name: Properties.paddingBottom },
          { label: 'Left', name: Properties.paddingLeft },
        );
        break;
      case TokenTypes.SIZING:
        properties.push(
          {
            label: 'All',
            name: Properties.sizing,
            clear: [Properties.width, Properties.height],
          },
          { label: 'Width', name: Properties.width },
          { label: 'Height', name: Properties.height },
        );
        break;
      case TokenTypes.COLOR:
        properties.push(
          {
            label: 'Fill',
            name: Properties.fill,
          },
          {
            label: 'Border',
            name: Properties.border,
          },
        );
        break;
      default:
        if (isPropertyType(type)) {
          properties.push({
            name: type,
            label: type,
          });
        }
        break;
    }
    return properties;
  }, [type]);
}
