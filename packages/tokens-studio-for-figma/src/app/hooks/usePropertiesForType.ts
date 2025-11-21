import { useMemo } from 'react';
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { PropertyObject } from '@/types/properties';
import { isPropertyType } from '@/utils/is';
import { SingleToken } from '@/types/tokens';

const spacingProperties = (value?: SingleToken['value']) => {
  const isMultiValue = typeof value === 'string' && value.split(' ').length > 1;
  const gapIndex = isMultiValue ? 1 : 0;
  const properties = [
    {
      label: 'All',
      name: Properties.spacing,
      clear: [
        Properties.counterAxisSpacing,
        Properties.horizontalPadding,
        Properties.verticalPadding,
        Properties.paddingLeft,
        Properties.paddingRight,
        Properties.paddingTop,
        Properties.paddingBottom,
      ],
    },
    {
      label: 'Horizontal padding',
      name: Properties.horizontalPadding,
      clear: [
        Properties.paddingLeft,
        Properties.paddingRight,
      ],
      disabled: isMultiValue,
    },
    {
      label: 'Vertical padding',
      name: Properties.verticalPadding,
      clear: [
        Properties.paddingTop,
        Properties.paddingBottom,
      ],
      disabled: isMultiValue,
    },
    { label: 'Row gap', name: Properties.counterAxisSpacing, disabled: isMultiValue },
    { label: 'Top', name: Properties.paddingTop, disabled: isMultiValue },
    { label: 'Right', name: Properties.paddingRight, disabled: isMultiValue },
    { label: 'Bottom', name: Properties.paddingBottom, disabled: isMultiValue },
    { label: 'Left', name: Properties.paddingLeft, disabled: isMultiValue },
  ];

  properties.splice(gapIndex, 0, { label: 'Gap', name: Properties.itemSpacing, disabled: isMultiValue });
  return properties;
};

const sizingProperties = [{
  label: 'All',
  name: Properties.sizing,
  clear: [Properties.width, Properties.height],
},
{ label: 'Width', name: Properties.width },
{ label: 'Height', name: Properties.height },
{ label: 'Min width', name: Properties.minWidth },
{ label: 'Max width', name: Properties.maxWidth },
{ label: 'Min height', name: Properties.minHeight },
{ label: 'Max height', name: Properties.maxHeight }];

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
        properties.push(...spacingProperties(value));
        break;
      case TokenTypes.SIZING:
        properties.push(...sizingProperties);
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
      case TokenTypes.NUMBER:
        if (type === TokenTypes.DIMENSION) {
          properties.push({
            name: Properties.dimension,
            invisible: true,
          });
        } else {
          properties.push({
            name: Properties.number,
            invisible: true,
          });
        }
        properties.push(
          {
            label: 'Spacing',
            name: Properties.spacing,
            childProperties: [
              ...spacingProperties(value),
            ],
          },
          {
            label: 'Sizing',
            name: Properties.sizing,
            childProperties: [
              ...sizingProperties,
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
          { label: 'x', name: Properties.x },
          { label: 'y', name: Properties.y },
        );

        if (type === TokenTypes.NUMBER) {
          properties.push({
            label: 'Rotation',
            name: Properties.rotation,
          });
        }
        break;
      case TokenTypes.BOOLEAN:
        properties.push(
          { label: 'Visibility', name: Properties.visibility },
          { label: 'Vertical trim', name: Properties.verticalTrim },
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
  }, [disabled, type, value]);
}
