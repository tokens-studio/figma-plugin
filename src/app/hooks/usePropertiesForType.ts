import { useMemo } from 'react';
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { PropertyObject } from '@/types/properties';
import { isPropertyType } from '@/utils/is';
import { SingleToken } from '@/types/tokens';

export function usePropertiesForTokenType(type: TokenTypes, value?: SingleToken['value']): PropertyObject[] {
  let disabled = false;
  if ((type === TokenTypes.BORDER_RADIUS || type === TokenTypes.SPACING) && typeof value === 'string') {
    disabled = value.split(' ').length > 1;
  }
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
          { label: 'Top Left', name: Properties.borderRadiusTopLeft, disabled },
          { label: 'Top Right', name: Properties.borderRadiusTopRight, disabled },
          { label: 'Bottom Right', name: Properties.borderRadiusBottomRight, disabled },
          { label: 'Bottom Left', name: Properties.borderRadiusBottomLeft, disabled },
        );
        break;
      case TokenTypes.BORDER:
        properties.push(
          {
            label: 'All',
            name: Properties.border,
            clear: [
              Properties.borderTop,
              Properties.borderRight,
              Properties.borderBottom,
              Properties.borderLeft,
            ],
          },
          { label: 'Top', name: Properties.borderTop, disabled },
          { label: 'Right', name: Properties.borderRight, disabled },
          { label: 'Bottom', name: Properties.borderBottom, disabled },
          { label: 'Left', name: Properties.borderLeft, disabled },
        );
        break;
      case TokenTypes.BORDER_WIDTH:
        properties.push(
          {
            label: 'All',
            name: Properties.borderWidth,
            clear: [
              Properties.borderWidthTop,
              Properties.borderWidthRight,
              Properties.borderWidthBottom,
              Properties.borderWidthLeft,
            ],
          },
          { label: 'Top', name: Properties.borderWidthTop },
          { label: 'Right', name: Properties.borderWidthRight },
          { label: 'Bottom', name: Properties.borderWidthBottom },
          { label: 'Left', name: Properties.borderWidthLeft },
        );
        break;
      case TokenTypes.SPACING:
        if (typeof value === 'string' && value.split(' ').length > 1) {
          properties.push(
            {
              label: 'All',
              icon: 'Spacing',
              name: Properties.spacing,
              clear: [
                Properties.horizontalPadding,
                Properties.verticalPadding,
                Properties.paddingLeft,
                Properties.paddingRight,
                Properties.paddingTop,
                Properties.paddingBottom,
              ],
            },
            {
              label: 'Gap',
              name: Properties.itemSpacing,
              icon: 'Gap',
              disabled,
            },
            { label: 'Top', name: Properties.paddingTop, disabled },
            { label: 'Right', name: Properties.paddingRight, disabled },
            { label: 'Bottom', name: Properties.paddingBottom, disabled },
            { label: 'Left', name: Properties.paddingLeft, disabled },
          );
        } else {
          properties.push(
            { label: 'Gap', name: Properties.itemSpacing, icon: 'Gap' },
            {
              label: 'All',
              icon: 'Spacing',
              name: Properties.spacing,
              clear: [
                Properties.horizontalPadding,
                Properties.verticalPadding,
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
        }
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
            name: Properties.borderColor,
          },
        );
        break;
      case TokenTypes.DIMENSION:
        properties.push(
          {
            name: Properties.dimension,
            invisible: true,
          },
          {
            label: 'Spacing',
            name: Properties.spacing,
            childProperties: [
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
            ],
          },
          {
            label: 'Sizing',
            name: Properties.sizing,
            childProperties: [
              {
                label: 'All',
                name: Properties.sizing,
                clear: [Properties.width, Properties.height],
              },
              { label: 'Width', name: Properties.width },
              { label: 'Height', name: Properties.height },
            ],
          },
          {
            label: 'Border radius',
            name: Properties.borderRadius,
            childProperties: [
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
            ],
          },
          {
            label: 'Border width',
            name: Properties.borderWidth,
            childProperties: [
              {
                label: 'All',
                name: Properties.borderWidth,
                clear: [
                  Properties.borderWidthTop,
                  Properties.borderWidthRight,
                  Properties.borderWidthBottom,
                  Properties.borderWidthLeft,
                ],
              },
              { label: 'Top', name: Properties.borderWidthTop },
              { label: 'Right', name: Properties.borderWidthRight },
              { label: 'Bottom', name: Properties.borderWidthBottom },
              { label: 'Left', name: Properties.borderWidthLeft },
            ],
          },
          {
            label: 'Background blur',
            name: Properties.backgroundBlur,
          },
        );
        break;
      case TokenTypes.BOOLEAN:
        properties.push(
          { label: 'Visibility', name: Properties.visibility },
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
