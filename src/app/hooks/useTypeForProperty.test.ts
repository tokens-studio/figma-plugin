import { renderHook } from '@testing-library/react-hooks';
import { useTypeForProperty } from './useTypeForProperty';

describe('useTypeForProperty', () => {
  const properties = [
    {
      input: 'sizing',
      output: 'sizing',
    },
    {
      input: 'width',
      output: 'sizing',
    },
    {
      input: 'height',
      output: 'sizing',
    },
    {
      input: 'spacing',
      output: 'spacing',
    },
    {
      input: 'verticalPadding',
      output: 'spacing',
    },
    {
      input: 'horizontalPadding',
      output: 'spacing',
    },
    {
      input: 'paddingTop',
      output: 'spacing',
    },
    {
      input: 'paddingRight',
      output: 'spacing',
    },
    {
      input: 'paddingBottom',
      output: 'spacing',
    },
    {
      input: 'paddingLeft',
      output: 'spacing',
    },
    {
      input: 'itemSpacing',
      output: 'spacing',
    },
    {
      input: 'fill',
      output: 'color',
    },
    {
      input: 'borderColor',
      output: 'color',
    },
    {
      input: 'borderRadius',
      output: 'borderRadius',
    },
    {
      input: 'borderRadiusTopLeft',
      output: 'borderRadius',
    },
    {
      input: 'borderRadiusTopRight',
      output: 'borderRadius',
    },
    {
      input: 'borderRadiusBottomRight',
      output: 'borderRadius',
    },
    {
      input: 'borderRadiusBottomLeft',
      output: 'borderRadius',
    },
    {
      input: 'borderWidth',
      output: 'borderWidth',
    },
    {
      input: 'borderWidthTop',
      output: 'borderWidth',
    },
    {
      input: 'borderWidthRight',
      output: 'borderWidth',
    },
    {
      input: 'borderWidthLeft',
      output: 'borderWidth',
    },
    {
      input: 'boxShadow',
      output: 'boxShadow',
    },
    {
      input: 'opacity',
      output: 'opacity',
    },
    {
      input: 'fontFamilies',
      output: 'fontFamilies',
    },
    {
      input: 'fontWeights',
      output: 'fontWeights',
    },
    {
      input: 'fontSizes',
      output: 'fontSizes',
    },
  ];
  it('should return default property', () => {
    properties.forEach((property) => {
      const { result } = renderHook(() => useTypeForProperty(property.input));
      expect(result.current).toBe(property.output);
    });
  });
});
