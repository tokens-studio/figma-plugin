import { TokenTypes } from '@/constants/TokenTypes';
import { processTextStyleProperty } from '../processTextStyleProperty';

describe('processTextStyleProperty', () => {
  // Mock data
  const mockLocalVariables = [
    { id: 'var1', name: 'fontSize/large' },
    { id: 'var2', name: 'lineHeight/relaxed' },
    { id: 'var3', name: 'letterSpacing/tight' },
    {
      id: 'var4',
      name: 'fontWeight/bold',
      valuesByMode: { default: { type: 'VARIABLE_ALIAS', id: 'var5' } },
    },
    {
      id: 'var5',
      name: 'fontWeight/base/bold',
      valuesByMode: { default: 'Bold' },
    },
    {
      id: 'var6',
      name: 'fontStyle/italic',
      valuesByMode: { default: 'Italic' },
    },
  ] as unknown as Variable[];

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
      value: '16',
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
      value: '18',
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
      value: '20',
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

  it('should handle VARIABLE_ALIAS and create a reference token', () => {
    // Mock figma.variables.getVariableById
    const mockGetVariableById = jest.fn().mockReturnValue({
      name: 'fontWeight/base/bold',
    });
    global.figma = {
      variables: {
        getVariableById: mockGetVariableById,
      },
    } as any;

    // Create a mock TextStyle with a bound variable that has VARIABLE_ALIAS
    const mockStyle = {
      fontName: { family: 'Arial', style: 'Bold' },
      boundVariables: {
        fontStyle: { id: 'var4' },
      },
    } as unknown as TextStyle;

    const result = processTextStyleProperty(
      mockStyle,
      'fontStyle',
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_WEIGHTS,
      'fontWeights',
      0,
      (value) => value,
    );

    // Expect getVariableById to be called with the alias ID
    expect(mockGetVariableById).toHaveBeenCalledWith('var5');

    // Expect the result to create a reference token
    expect(result).toEqual({
      name: 'fontWeight.bold',
      value: '{fontWeight.base.bold}',
      type: TokenTypes.FONT_WEIGHTS,
    });
  });

  it('should handle VARIABLE_ALIAS with fallback when alias cannot be resolved', () => {
    // Mock figma.variables.getVariableById to return null
    const mockGetVariableById = jest.fn().mockReturnValue(null);
    global.figma = {
      variables: {
        getVariableById: mockGetVariableById,
      },
    } as any;

    // Create a mock TextStyle with a bound variable that has VARIABLE_ALIAS
    const mockStyle = {
      fontName: { family: 'Arial', style: 'Bold' },
      fontSize: 16, // Add the property that will be accessed
      boundVariables: {
        fontSize: { id: 'var4' }, // Use fontSize instead of fontStyle
      },
    } as unknown as TextStyle;

    const mockTransformer = jest.fn((value) => String(value));

    const result = processTextStyleProperty(
      mockStyle,
      'fontSize', // Use fontSize instead of fontStyle
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_SIZES, // Use FONT_SIZES instead of FONT_WEIGHTS
      'fontSize',
      0,
      mockTransformer,
    );

    expect(mockGetVariableById).toHaveBeenCalledWith('var5');

    expect(mockTransformer).toHaveBeenCalledWith(16);

    expect(result).toEqual({
      name: 'fontWeight.bold',
      value: '16',
      type: TokenTypes.FONT_SIZES,
    });
  });

  it('should handle direct variable value without VARIABLE_ALIAS', () => {
    const mockStyle = {
      fontName: { family: 'Arial', style: 'Italic' },
      boundVariables: {
        fontStyle: { id: 'var6' },
      },
    } as unknown as TextStyle;

    const result = processTextStyleProperty(
      mockStyle,
      'fontStyle',
      mockLocalVariables,
      mockTokens,
      TokenTypes.FONT_WEIGHTS,
      'fontWeights',
      0,
      (value) => value,
    );

    expect(result).toEqual({
      name: 'fontStyle.italic',
      value: 'Italic',
      type: TokenTypes.FONT_WEIGHTS,
    });
  });
});
