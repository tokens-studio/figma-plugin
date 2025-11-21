import { renderHook } from '@testing-library/react';
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { usePropertiesForTokenType } from './usePropertiesForType';

describe('usePropertiesForTokenType', () => {
  const testData = [
    {
      type: 'other',
      properties: [],
    },
    {
      type: 'color',
      properties: [
        {
          label: 'Fill',
          name: Properties.fill,
        },
        {
          label: 'Border',
          name: Properties.borderColor,
        },
      ],
    },
    {
      type: 'borderRadius',
      properties: [
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
        { label: 'Top Left', name: Properties.borderRadiusTopLeft, disabled: false },
        { label: 'Top Right', name: Properties.borderRadiusTopRight, disabled: false },
        { label: 'Bottom Right', name: Properties.borderRadiusBottomRight, disabled: false },
        { label: 'Bottom Left', name: Properties.borderRadiusBottomLeft, disabled: false },
      ],
    },
    {
      type: 'sizing',
      properties: [
        {
          label: 'All',
          name: Properties.sizing,
          clear: [Properties.width, Properties.height],
        },
        { label: 'Width', name: Properties.width },
        { label: 'Height', name: Properties.height },
        { label: 'Min width', name: Properties.minWidth },
        { label: 'Max width', name: Properties.maxWidth },
        { label: 'Min height', name: Properties.minHeight },
        { label: 'Max height', name: Properties.maxHeight },
      ],
    },
    {
      type: 'spacing',
      properties: [
        { label: 'Gap', name: Properties.itemSpacing, disabled: false },
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
          disabled: false,
        },
        {
          label: 'Vertical padding',
          name: Properties.verticalPadding,
          clear: [
            Properties.paddingTop,
            Properties.paddingBottom,
          ],
          disabled: false,
        },
        { label: 'Row gap', name: Properties.counterAxisSpacing, disabled: false },
        { label: 'Top', name: Properties.paddingTop, disabled: false },
        { label: 'Right', name: Properties.paddingRight, disabled: false },
        { label: 'Bottom', name: Properties.paddingBottom, disabled: false },
        { label: 'Left', name: Properties.paddingLeft, disabled: false },
      ],
    },
    {
      type: 'text',
      properties: [{
        name: 'text',
        label: 'text',
      }],
    },
    {
      type: 'typography',
      properties: [
        {
          name: 'typography',
          label: 'typography',
        },
      ],
    },
    {
      type: 'opacity',
      properties: [
        {
          name: 'opacity',
          label: 'opacity',
        },
      ],
    },
    {
      type: 'borderWidth',
      properties: [
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
      type: 'boxShadow',
      properties: [
        {
          name: 'boxShadow',
          label: 'boxShadow',
        },
      ],
    },
    {
      type: 'fontFamilies',
      properties: [
        {
          name: 'fontFamilies',
          label: 'fontFamilies',
        },
      ],
    },
    {
      type: 'fontWeights',
      properties: [
        {
          name: 'fontWeights',
          label: 'fontWeights',
        },
      ],
    },
    {
      type: 'lineHeights',
      properties: [
        {
          name: 'lineHeights',
          label: 'lineHeights',
        },
      ],
    },
    {
      type: 'fontSizes',
      properties: [
        {
          name: 'fontSizes',
          label: 'fontSizes',
        },
      ],
    },
    {
      type: 'letterSpacing',
      properties: [
        {
          name: 'letterSpacing',
          label: 'letterSpacing',
        },
      ],
    },
    {
      type: 'paragraphSpacing',
      properties: [
        {
          name: 'paragraphSpacing',
          label: 'paragraphSpacing',
        },
      ],
    },
    {
      type: 'textDecoration',
      properties: [
        {
          name: 'textDecoration',
          label: 'textDecoration',
        },
      ],
    },
    {
      type: 'textCase',
      properties: [
        {
          name: 'textCase',
          label: 'textCase',
        },
      ],
    },
    {
      type: 'composition',
      properties: [
        {
          name: 'composition',
          label: 'composition',
        },
      ],
    },
    {
      type: 'dimension',
      properties: [
        {
          name: Properties.dimension,
          invisible: true,
        },
        {
          label: 'Spacing',
          name: Properties.spacing,
          childProperties: [
            { label: 'Gap', name: Properties.itemSpacing, disabled: false },
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
              disabled: false,
            },
            {
              label: 'Vertical padding',
              name: Properties.verticalPadding,
              clear: [
                Properties.paddingTop,
                Properties.paddingBottom,
              ],
              disabled: false,
            },
            { label: 'Row gap', name: Properties.counterAxisSpacing, disabled: false },
            { label: 'Top', name: Properties.paddingTop, disabled: false },
            { label: 'Right', name: Properties.paddingRight, disabled: false },
            { label: 'Bottom', name: Properties.paddingBottom, disabled: false },
            { label: 'Left', name: Properties.paddingLeft, disabled: false },
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
            { label: 'Min width', name: Properties.minWidth },
            { label: 'Max width', name: Properties.maxWidth },
            { label: 'Min height', name: Properties.minHeight },
            { label: 'Max height', name: Properties.maxHeight },
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
        {
          label: 'x',
          name: Properties.x,
        },
        {
          label: 'y',
          name: Properties.y,
        },
      ],
    },
    {
      type: 'number',
      properties: [
        {
          name: Properties.number,
          invisible: true,
        },
        {
          label: 'Spacing',
          name: Properties.spacing,
          childProperties: [
            { label: 'Gap', name: Properties.itemSpacing, disabled: false },
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
              disabled: false,
            },
            {
              label: 'Vertical padding',
              name: Properties.verticalPadding,
              clear: [
                Properties.paddingTop,
                Properties.paddingBottom,
              ],
              disabled: false,
            },
            { label: 'Row gap', name: Properties.counterAxisSpacing, disabled: false },
            { label: 'Top', name: Properties.paddingTop, disabled: false },
            { label: 'Right', name: Properties.paddingRight, disabled: false },
            { label: 'Bottom', name: Properties.paddingBottom, disabled: false },
            { label: 'Left', name: Properties.paddingLeft, disabled: false },
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
            { label: 'Min width', name: Properties.minWidth },
            { label: 'Max width', name: Properties.maxWidth },
            { label: 'Min height', name: Properties.minHeight },
            { label: 'Max height', name: Properties.maxHeight },
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
        {
          label: 'x',
          name: Properties.x,
        },
        {
          label: 'y',
          name: Properties.y,
        },
        {
          label: 'Rotation',
          name: Properties.rotation,
        },
      ],
    },
    {
      type: 'boolean',
      properties: [
        { label: 'Visibility', name: Properties.visibility },
        { label: 'Vertical trim', name: Properties.verticalTrim },
      ],
    },
  ];
  it('should return properties', () => {
    testData.forEach((data) => {
      const { result } = renderHook(() => usePropertiesForTokenType(data.type as TokenTypes));
      expect(result.current).toEqual(data.properties);
    });
  });

  it('properties should be disabled when borderRadius token has multi value', () => {
    const multiBorderRadius = {
      type: TokenTypes.BORDER_RADIUS,
      value: '12px 5px',
    };
    const { result } = renderHook(() => usePropertiesForTokenType(multiBorderRadius.type, multiBorderRadius.value));
    expect(result.current).toEqual([
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
      { label: 'Top Left', name: Properties.borderRadiusTopLeft, disabled: true },
      { label: 'Top Right', name: Properties.borderRadiusTopRight, disabled: true },
      { label: 'Bottom Right', name: Properties.borderRadiusBottomRight, disabled: true },
      { label: 'Bottom Left', name: Properties.borderRadiusBottomLeft, disabled: true },
    ]);
  });

  it('properties should be disabled when spacing token has multi value', () => {
    const multiSpacing = {
      type: TokenTypes.SPACING,
      value: '12px 5px',
    };
    const { result } = renderHook(() => usePropertiesForTokenType(multiSpacing.type, multiSpacing.value));
    expect(result.current).toEqual([
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
      { label: 'Gap', name: Properties.itemSpacing, disabled: true },
      {
        label: 'Horizontal padding',
        name: Properties.horizontalPadding,
        clear: [
          Properties.paddingLeft,
          Properties.paddingRight,
        ],
        disabled: true,
      },
      {
        label: 'Vertical padding',
        name: Properties.verticalPadding,
        clear: [
          Properties.paddingTop,
          Properties.paddingBottom,
        ],
        disabled: true,
      },
      { label: 'Row gap', name: Properties.counterAxisSpacing, disabled: true },
      { label: 'Top', name: Properties.paddingTop, disabled: true },
      { label: 'Right', name: Properties.paddingRight, disabled: true },
      { label: 'Bottom', name: Properties.paddingBottom, disabled: true },
      { label: 'Left', name: Properties.paddingLeft, disabled: true },
    ]);
  });
});
