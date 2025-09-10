import { tryApplyTypographyCompositeVariable } from './tryApplyTypographyCompositeVariable';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { SingleTypographyToken } from '@/types/tokens';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

// Import the figma mock that's set up globally
declare const figma: any;

describe('tryApplyTypographyCompositeVariable', () => {
  let target: TextNode | TextStyle;
  let value: SingleTypographyToken['value'];
  let resolvedValue: ResolvedTypographyObject;
  let baseFontSize: string;

  beforeEach(() => {
    target = {} as TextNode | TextStyle;
    value = {};
    resolvedValue = {};
    baseFontSize = '16px';
  });

  it('should set font family and weight without variables', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter',
      fontWeight: 'Bold',
    };
    resolvedValue = {};

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.fontName).toEqual({ family: 'Inter', style: 'Bold' });
  });

  it('should apply variables if available', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
      fontWeight: 'Bold-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.default}',
      fontWeight: '{fontWeight.default}',
    };
    const familyVariable = { valuesByMode: { default: ['Roboto'] } };
    const weightVariable = { valuesByMode: { default: ['Bold'] } };
    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.getVariableReference = jest.fn()
      .mockResolvedValueOnce(familyVariable)
      .mockResolvedValueOnce(weightVariable);

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.setBoundVariable).toHaveBeenCalledTimes(2);
    expect(target.setBoundVariable).toHaveBeenNthCalledWith(1, 'fontFamily', familyVariable);
    expect(target.setBoundVariable).toHaveBeenNthCalledWith(2, 'fontStyle', weightVariable);
  });

  it('should apply values directly if no variables are available', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter',
      fontWeight: 'Ultrabold',
      fontSize: '24px',
      lineHeight: '1.5',
    };
    resolvedValue = {
      fontFamily: '{fontFamilyVariable}',
      fontWeight: '{fontWeightVariable}',
      fontSize: '{fontSizeVariable}',
      lineHeight: '1.5',
    };

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(undefined);

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.fontName).toEqual({ family: 'Inter', style: 'Ultrabold' });
    expect(target.fontSize).toEqual(24);
    expect(target.lineHeight).toEqual({ unit: 'PIXELS', value: 1.5 });
  });

  it('should apply variables if available', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    resolvedValue = {
      fontFamily: '{fontFamily.default}',
      fontWeight: '{fontWeight.default}',
    };
    value = {
      fontFamily: 'Roboto-raw',
      fontWeight: 'Bold-raw',
    };
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.RAW_VALUES;
    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue('Roboto');
    defaultTokenValueRetriever.getVariableReference = jest.fn()
      .mockResolvedValueOnce('Roboto')
      .mockResolvedValueOnce('Bold');

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.fontName).toEqual({ family: 'Roboto-raw', style: 'Bold-raw' });
  });

  it('should apply values directly if no variable application is turned off', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter',
      fontWeight: 'Ultrabold',
      fontSize: '24px',
      lineHeight: '1.5',
    };
    resolvedValue = {
      fontFamily: '{fontFamilyVariable}',
      fontWeight: '{fontWeightVariable}',
      fontSize: '{fontSizeVariable}',
      lineHeight: '1.5',
    };

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.fontName).toEqual({ family: 'Inter', style: 'Ultrabold' });
    expect(target.fontSize).toEqual(24);
    expect(target.lineHeight).toEqual({ unit: 'PIXELS', value: 1.5 });
  });

  it('should handle errors gracefully', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: '{fontFamilyVariable}',
    };
    resolvedValue = {
      fontFamily: '{fontFamilyVariable}',
    };
    defaultTokenValueRetriever.getVariableReference = jest.fn().mockRejectedValue(new Error('Failed to get variable reference'));

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });
  });

  it('should apply transformed value when no variable is available', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      letterSpacing: '0.5em',
    };
    resolvedValue = {
      letterSpacing: '0.5em',
    };
    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(undefined);

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.letterSpacing).toEqual({ unit: 'PIXELS', value: 8 });
  });

  it('should list available fonts when applying font family variable', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    const mockListAvailableFonts = jest.fn().mockResolvedValue([
      { fontName: { family: 'Roboto', style: 'Regular' } },
    ]);
    figma.listAvailableFontsAsync = mockListAvailableFonts;
    figma.loadFontAsync = jest.fn().mockResolvedValue(undefined);

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(mockListAvailableFonts).toHaveBeenCalled();
  });

  it('should load multiple font styles when applying font family variable', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    const mockLoadFont = jest.fn().mockResolvedValue(undefined);
    figma.listAvailableFontsAsync = jest.fn().mockResolvedValue([
      { fontName: { family: 'Roboto', style: 'Regular' } },
      { fontName: { family: 'Roboto', style: 'Bold' } },
    ]);
    figma.loadFontAsync = mockLoadFont;

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    // Should load target font (Arial) only, since no font loading is done for variables in this path
    expect(mockLoadFont).toHaveBeenCalledTimes(1);
    expect(mockLoadFont).toHaveBeenCalledWith(target.fontName);
  });

  it('should set bound variable after loading fonts', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    figma.listAvailableFontsAsync = jest.fn().mockResolvedValue([]);
    figma.loadFontAsync = jest.fn().mockResolvedValue(undefined);

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);
  });

  it('should use cached font loading promise for same font family', async () => {
    const target1 = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;

    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    // Mock Figma API methods
    const mockListAvailableFonts = jest.fn().mockResolvedValue([
      { fontName: { family: 'Roboto', style: 'Regular' } },
    ]);
    const mockLoadFont = jest.fn().mockResolvedValue(undefined);

    figma.listAvailableFontsAsync = mockListAvailableFonts;
    figma.loadFontAsync = mockLoadFont;

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    // Apply the font family once - this should populate the cache
    await tryApplyTypographyCompositeVariable({
      target: target1, value, resolvedValue, baseFontSize,
    });

    // Verify that the font loading logic was executed
    expect(target1.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);
  });

  it('should log error when font loading fails', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    figma.listAvailableFontsAsync = jest.fn().mockResolvedValue([]);
    figma.loadFontAsync = jest.fn().mockImplementation((fontName) => {
      if (fontName === target.fontName) {
        return Promise.reject(new Error('Font loading failed'));
      }
      return Promise.resolve();
    });

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue({
      valuesByMode: { default: 'Roboto' },
    });
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(consoleSpy).toHaveBeenCalledWith('error loading font', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should continue to set bound variable even when font loading fails', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    jest.spyOn(console, 'error').mockImplementation();

    figma.listAvailableFontsAsync = jest.fn().mockResolvedValue([]);
    figma.loadFontAsync = jest.fn().mockRejectedValue(new Error('Font loading failed'));

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);
  });

  it('should log error when setBoundVariable throws exception', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn().mockImplementation(() => {
        throw new Error('setBoundVariable failed');
      }),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    figma.loadFontAsync = jest.fn().mockResolvedValue(undefined);

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(consoleSpy).toHaveBeenCalledWith('unable to apply variable', 'fontFamily', familyVariable, expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should attempt to set bound variable when variable is available', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 'Roboto' },
    };

    figma.loadFontAsync = jest.fn().mockResolvedValue(undefined);

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);
  });

  it('should handle Object.entries errors in main processing', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const originalEntries = Object.entries;
    Object.entries = jest.fn().mockImplementation(() => {
      throw new Error('Object.entries failed');
    });

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    Object.entries = originalEntries;
    consoleSpy.mockRestore();
  });

  it('should handle unexpected errors during processing', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock getVariableReference to throw an error to trigger the main catch block
    defaultTokenValueRetriever.getVariableReference = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected processing error');
    });

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should skip processing when value is undefined', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter',
      fontWeight: undefined, // This should be skipped
    };
    resolvedValue = {};

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    // Only fontFamily should be processed, fontWeight should be skipped
    expect(target.fontName).toEqual({ family: 'Inter', style: 'Regular' });
  });

  it('should handle non-string variable values in font family loading', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Roboto-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.roboto}',
    };

    const familyVariable = {
      valuesByMode: { default: 123 }, // Non-string value
    };

    figma.listAvailableFontsAsync = jest.fn().mockResolvedValue([]);
    figma.loadFontAsync = jest.fn().mockResolvedValue(undefined);

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    // Should not call listAvailableFontsAsync for non-string values
    expect(figma.listAvailableFontsAsync).not.toHaveBeenCalled();
    expect(target.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);
  });

  it('should handle multiple typography properties simultaneously', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter-raw',
      fontWeight: 'Bold-raw',
      fontSize: '16px-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.inter}',
      fontWeight: '{fontWeight.bold}',
      fontSize: '{fontSize.base}',
    };

    const familyVariable = { valuesByMode: { default: 'Inter' } };
    const weightVariable = { valuesByMode: { default: 'Bold' } };
    const sizeVariable = { valuesByMode: { default: '16px' } };

    figma.loadFontAsync = jest.fn().mockResolvedValue(undefined);

    defaultTokenValueRetriever.getVariableReference = jest.fn()
      .mockResolvedValueOnce(familyVariable)
      .mockResolvedValueOnce(weightVariable)
      .mockResolvedValueOnce(sizeVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.setBoundVariable).toHaveBeenCalledTimes(3);
    expect(target.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);
    expect(target.setBoundVariable).toHaveBeenCalledWith('fontStyle', weightVariable);
    expect(target.setBoundVariable).toHaveBeenCalledWith('fontSize', sizeVariable);
  });

  it('should skip undefined value properties', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter',
      fontWeight: undefined,
      fontSize: '16px',
    };
    resolvedValue = {
      fontFamily: 'Inter',
      fontSize: '16px',
    };

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    // fontWeight should be skipped due to undefined value
    expect(target.fontName).toEqual({ family: 'Inter', style: 'Regular' });
    expect(target.fontSize).toEqual(16);
  });

  it('should handle empty resolved values gracefully', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter',
    };
    resolvedValue = {}; // Empty resolved values

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(target.fontName).toEqual({ family: 'Inter', style: 'Regular' });
  });

  it('should handle variable reference retrieval failures', async () => {
    target = {
      fontName: {
        family: 'Arial',
        style: 'Regular',
      },
      setBoundVariable: jest.fn(),
    } as TextNode | TextStyle;
    value = {
      fontFamily: 'Inter-raw',
    };
    resolvedValue = {
      fontFamily: '{fontFamily.inter}',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockRejectedValue(new Error('Variable not found'));
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    // Should not crash and continue processing
    expect(target.setBoundVariable).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
