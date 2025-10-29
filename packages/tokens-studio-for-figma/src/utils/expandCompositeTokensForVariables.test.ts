import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from './tokenHelpers';
import { expandCompositeTokensForVariables } from './expandCompositeTokensForVariables';

describe('expandCompositeTokensForVariables', () => {
  it('should expand typography tokens into individual property tokens', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'heading.large',
        type: TokenTypes.TYPOGRAPHY,
        value: {
          fontFamily: 'Inter',
          fontSize: '24px',
          fontWeight: '700',
          lineHeight: '1.5',
        },
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(4);
    expect(result).toEqual([
      expect.objectContaining({
        name: 'heading.large.fontFamily',
        type: TokenTypes.FONT_FAMILIES,
        value: 'Inter',
      }),
      expect.objectContaining({
        name: 'heading.large.fontSize',
        type: TokenTypes.FONT_SIZES,
        value: '24px',
      }),
      expect.objectContaining({
        name: 'heading.large.fontWeight',
        type: TokenTypes.FONT_WEIGHTS,
        value: '700',
      }),
      expect.objectContaining({
        name: 'heading.large.lineHeight',
        type: TokenTypes.LINE_HEIGHTS,
        value: '1.5',
      }),
    ]);
  });

  it('should expand border tokens into individual property tokens', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'border.primary',
        type: TokenTypes.BORDER,
        value: {
          color: '#FF0000',
          width: '2px',
          style: 'solid',
        },
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      expect.objectContaining({
        name: 'border.primary.color',
        type: TokenTypes.COLOR,
        value: '#FF0000',
      }),
      expect.objectContaining({
        name: 'border.primary.width',
        type: TokenTypes.BORDER_WIDTH,
        value: '2px',
      }),
      expect.objectContaining({
        name: 'border.primary.style',
        value: 'solid',
      }),
    ]);
  });

  it('should expand boxShadow tokens into individual property tokens', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'shadow.elevated',
        type: TokenTypes.BOX_SHADOW,
        value: {
          color: '#000000',
          x: '0',
          y: '4px',
          blur: '8px',
          spread: '0',
        },
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(5);
    expect(result).toEqual([
      expect.objectContaining({
        name: 'shadow.elevated.color',
        type: TokenTypes.COLOR,
        value: '#000000',
      }),
      expect.objectContaining({
        name: 'shadow.elevated.x',
        value: '0',
      }),
      expect.objectContaining({
        name: 'shadow.elevated.y',
        value: '4px',
      }),
      expect.objectContaining({
        name: 'shadow.elevated.blur',
        value: '8px',
      }),
      expect.objectContaining({
        name: 'shadow.elevated.spread',
        value: '0',
      }),
    ]);
  });

  it('should keep non-composite tokens unchanged', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'color.primary',
        type: TokenTypes.COLOR,
        value: '#FF0000',
      } as ResolveTokenValuesResult,
      {
        name: 'spacing.small',
        type: TokenTypes.SPACING,
        value: '8px',
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(2);
    expect(result).toEqual(tokens);
  });

  it('should handle composite tokens with string references without expanding', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'heading.reference',
        type: TokenTypes.TYPOGRAPHY,
        value: '{typography.base}',
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(1);
    expect(result).toEqual(tokens);
  });

  it('should handle mixed composite and non-composite tokens', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'color.primary',
        type: TokenTypes.COLOR,
        value: '#FF0000',
      } as ResolveTokenValuesResult,
      {
        name: 'heading.small',
        type: TokenTypes.TYPOGRAPHY,
        value: {
          fontFamily: 'Inter',
          fontSize: '16px',
        },
      } as ResolveTokenValuesResult,
      {
        name: 'spacing.medium',
        type: TokenTypes.SPACING,
        value: '16px',
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(4);
    expect(result).toEqual([
      expect.objectContaining({
        name: 'color.primary',
        type: TokenTypes.COLOR,
        value: '#FF0000',
      }),
      expect.objectContaining({
        name: 'heading.small.fontFamily',
        type: TokenTypes.FONT_FAMILIES,
        value: 'Inter',
      }),
      expect.objectContaining({
        name: 'heading.small.fontSize',
        type: TokenTypes.FONT_SIZES,
        value: '16px',
      }),
      expect.objectContaining({
        name: 'spacing.medium',
        type: TokenTypes.SPACING,
        value: '16px',
      }),
    ]);
  });

  it('should expand typography tokens with paragraphIndent and paragraphSpacing', () => {
    const tokens: ResolveTokenValuesResult[] = [
      {
        name: 'paragraph.style',
        type: TokenTypes.TYPOGRAPHY,
        value: {
          fontFamily: 'Arial',
          fontSize: '14px',
          paragraphSpacing: '12px',
          paragraphIndent: '20px',
        },
      } as ResolveTokenValuesResult,
    ];

    const result = expandCompositeTokensForVariables(tokens);

    expect(result).toHaveLength(4);
    expect(result).toEqual([
      expect.objectContaining({
        name: 'paragraph.style.fontFamily',
        type: TokenTypes.FONT_FAMILIES,
        value: 'Arial',
      }),
      expect.objectContaining({
        name: 'paragraph.style.fontSize',
        type: TokenTypes.FONT_SIZES,
        value: '14px',
      }),
      expect.objectContaining({
        name: 'paragraph.style.paragraphSpacing',
        type: TokenTypes.PARAGRAPH_SPACING,
        value: '12px',
      }),
      expect.objectContaining({
        name: 'paragraph.style.paragraphIndent',
        type: TokenTypes.PARAGRAPH_INDENT,
        value: '20px',
      }),
    ]);
  });
});
