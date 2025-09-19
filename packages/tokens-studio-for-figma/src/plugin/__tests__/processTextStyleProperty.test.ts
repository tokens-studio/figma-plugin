import { TokenTypes } from '@/constants/TokenTypes';
import { processTextStyleProperty } from '../processTextStyleProperty';

describe('processTextStyleProperty', () => {
  // Mock data
  const mockLocalVariables = [
    { id: 'var1', name: 'fontSize/large' },
    { id: 'var2', name: 'lineHeight/relaxed' },
    { id: 'var3', name: 'letterSpacing/tight' },
  ] as Variable[];

  const mockTokens = {
    values: {
      global: [
        { name: 'fontSize.large', value: '24px', type: TokenTypes.FONT_SIZES },
        { name: 'lineHeight.relaxed', value: '1.5', type: TokenTypes.LINE_HEIGHTS },
      ],
      theme: [
        { name: 'letterSpacing.tight', value: '-0.5px', type: TokenTypes.LETTER_SPACING },
      ],
      components: [
        { name: 'fontSize.small', value: '12px', type: TokenTypes.FONT_SIZES },
      ],
      core: [
        { name: 'lineHeight.normal', value: '1.2', type: TokenTypes.LINE_HEIGHTS },
      ],
    },
  };

  // Test cases
  it('should return a token with existing token values when a bound variable is found', () => {
    // Create a mock TextStyle with a bound variable
    const mockStyle = {
      fontSize: 24,
      boundVariables: {
        fontSize: { id: 'var1' },
      },
    } as unknown as TextStyle;

    const result = processTextStyleProperty(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_SIZES,
      'fontSize',
      0,
    );

    // Expect the result to use the existing token
    expect(result).toEqual({
      name: 'fontSize.large',
      value: '24px',
      type: TokenTypes.FONT_SIZES,
    });
  });

  it('should return a token with transformed value when a transformer is provided', () => {
    // Create a mock TextStyle without a bound variable so the transformer will be used
    const lineHeightValue = { value: 150, unit: 'PERCENT' };
    const mockStyle = {
      lineHeight: lineHeightValue,
      boundVariables: {}, // No bound variable so we'll use the transformer
    } as unknown as TextStyle;

    const mockTransformer = jest.fn((_value) => '1.5');

    const result = processTextStyleProperty(
      mockStyle,
      'lineHeight',
      mockLocalVariables,
      mockTokens,
      TokenTypes.LINE_HEIGHTS,
      'lineHeight',
      0,
      mockTransformer,
    );

    // Expect the transformer to be called with the lineHeight value
    expect(mockTransformer).toHaveBeenCalledWith(lineHeightValue);

    // Expect the result to use the transformed value
    expect(result).toEqual({
      name: 'lineHeight.0',
      value: '1.5',
      type: TokenTypes.LINE_HEIGHTS,
    });
  });

  it('should create a new token when no bound variable is found', () => {
    // Create a mock TextStyle without a bound variable
    const mockStyle = {
      fontSize: 16,
      boundVariables: {},
    } as unknown as TextStyle;

    const result = processTextStyleProperty(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_SIZES,
      'fontSize',
      2,
    );

    // Expect the result to create a new token
    expect(result).toEqual({
      name: 'fontSize.2',
      value: 16,
      type: TokenTypes.FONT_SIZES,
    });
  });

  it('should create a new token when bound variable is found but no matching token exists', () => {
    // Create a mock TextStyle with a bound variable that doesn't match any token
    const mockStyle = {
      letterSpacing: { value: -0.5, unit: 'PIXELS' },
      boundVariables: {
        letterSpacing: { id: 'nonexistent' },
      },
    } as unknown as TextStyle;

    const mockTransformer = jest.fn((_value) => '-0.5px');

    const result = processTextStyleProperty(
      mockStyle,
      'letterSpacing',
      mockLocalVariables,
      mockTokens,
      TokenTypes.LETTER_SPACING,
      'letterSpacing',
      3,
      mockTransformer,
    );

    // Expect the transformer to be called
    expect(mockTransformer).toHaveBeenCalledWith({ value: -0.5, unit: 'PIXELS' });

    // Expect the result to create a new token
    expect(result).toEqual({
      name: 'letterSpacing.3',
      value: '-0.5px',
      type: TokenTypes.LETTER_SPACING,
    });
  });

  it('should handle null or undefined boundVariables', () => {
    // Create a mock TextStyle with undefined boundVariables
    const mockStyle = {
      fontSize: 18,
      // boundVariables is undefined
    } as unknown as TextStyle;

    const result = processTextStyleProperty(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_SIZES,
      'fontSize',
      4,
    );

    // Expect the result to create a new token
    expect(result).toEqual({
      name: 'fontSize.4',
      value: 18,
      type: TokenTypes.FONT_SIZES,
    });
  });

  it('should handle non-string values by converting them to strings', () => {
    // Create a mock TextStyle with a numeric value
    const mockStyle = {
      fontSize: 20,
      boundVariables: {},
    } as unknown as TextStyle;

    const result = processTextStyleProperty(
      mockStyle,
      'fontSize',
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_SIZES,
      'fontSize',
      5,
    );

    // Expect the result to create a new token with the value converted to string
    expect(result).toEqual({
      name: 'fontSize.5',
      value: 20,
      type: TokenTypes.FONT_SIZES,
    });
  });

  it('should handle complex object values with a transformer', () => {
    // Create a mock TextStyle with a complex object value
    const letterSpacingValue = { value: -0.5, unit: 'PIXELS' };
    const mockStyle = {
      letterSpacing: letterSpacingValue,
      boundVariables: {},
    } as unknown as TextStyle;

    const mockTransformer = jest.fn((_value) => '-0.5px');

    const result = processTextStyleProperty(
      mockStyle,
      'letterSpacing',
      mockLocalVariables,
      mockTokens,
      TokenTypes.LETTER_SPACING,
      'letterSpacing',
      6,
      mockTransformer,
    );

    // Expect the transformer to be called with the letterSpacing value
    expect(mockTransformer).toHaveBeenCalledWith(letterSpacingValue);

    // Expect the result to use the transformed value
    expect(result).toEqual({
      name: 'letterSpacing.6',
      value: '-0.5px',
      type: TokenTypes.LETTER_SPACING,
    });
  });
});
