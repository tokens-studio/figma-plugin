import { convertToDefaultProperty } from './convertToDefaultProperty';
import { Properties } from '@/constants/Properties';

describe('convertToDefaultProperty', () => {
  const properties = [
    {
      input: Properties.width,
      output: Properties.dimension,
    },
    {
      input: Properties.height,
      output: Properties.dimension,
    },
    {
      input: Properties.sizing,
      output: Properties.dimension,
    },
    {
      input: Properties.itemSpacing,
      output: Properties.dimension,
    },
    {
      input: Properties.verticalPadding,
      output: Properties.dimension,
    },
    {
      input: Properties.horizontalPadding,
      output: Properties.dimension,
    },
    {
      input: Properties.paddingTop,
      output: Properties.dimension,
    },
    {
      input: Properties.paddingLeft,
      output: Properties.dimension,
    },
    {
      input: Properties.paddingBottom,
      output: Properties.dimension,
    },
    {
      input: Properties.paddingRight,
      output: Properties.dimension,
    },
    {
      input: Properties.borderRadiusTopLeft,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderRadiusTopRight,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderRadiusBottomLeft,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderRadiusBottomRight,
      output: Properties.borderRadius,
    },
    {
      input: Properties.borderColor,
      output: Properties.fill,
    },
    {
      input: Properties.borderWidthTop,
      output: Properties.borderWidth,
    },
    {
      input: Properties.borderWidthLeft,
      output: Properties.borderWidth,
    },
    {
      input: Properties.borderWidthRight,
      output: Properties.borderWidth,
    },
    {
      input: Properties.borderWidthBottom,
      output: Properties.borderWidth,
    },
    {
      input: Properties.fill,
      output: Properties.fill,
    },
    {
      input: Properties.boxShadow,
      output: Properties.boxShadow,
    },
    {
      input: Properties.opacity,
      output: Properties.opacity,
    },
    {
      input: Properties.fontFamilies,
      output: Properties.fontFamilies,
    },
    {
      input: Properties.fontWeights,
      output: Properties.fontWeights,
    },
    {
      input: Properties.fontSizes,
      output: Properties.fontSizes,
    },
    {
      input: Properties.lineHeights,
      output: Properties.lineHeights,
    },
    {
      input: Properties.typography,
      output: Properties.typography,
    },
    {
      input: Properties.composition,
      output: Properties.composition,
    },

    {
      input: Properties.letterSpacing,
      output: Properties.letterSpacing,
    },
    {
      input: Properties.paragraphSpacing,
      output: Properties.paragraphSpacing,
    },
    {
      input: Properties.textCase,
      output: Properties.textCase,
    },
    {
      input: Properties.textDecoration,
      output: Properties.textDecoration,
    },
    {
      input: 'style',
      output: 'strokeStyle',
    },
  ];
  it('should convert property to default property', () => {
    properties.forEach((property) => {
      expect(convertToDefaultProperty(property.input)).toEqual(property.output);
    });
  });
});
