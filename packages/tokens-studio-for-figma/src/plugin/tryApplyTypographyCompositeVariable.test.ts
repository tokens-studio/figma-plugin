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

  it('should handle font family variable with font loading and caching', async () => {
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

    // Mock Figma API methods
    const mockListAvailableFonts = jest.fn().mockResolvedValue([
      { fontName: { family: 'Roboto', style: 'Regular' } },
      { fontName: { family: 'Roboto', style: 'Bold' } },
    ]);
    const mockLoadFont = jest.fn().mockResolvedValue(undefined);

    // Update existing figma mock
    figma.listAvailableFontsAsync = mockListAvailableFonts;
    figma.loadFontAsync = mockLoadFont;

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(mockListAvailableFonts).toHaveBeenCalled();
    // 2 fonts loaded from listAvailable + 1 for target.fontName
    expect(mockLoadFont).toHaveBeenCalledTimes(3);
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

  it('should handle font loading error gracefully', async () => {
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

    // Mock console.error to verify it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock loadFontAsync to fail when loading target.fontName (line 62-64)
    figma.listAvailableFontsAsync = jest.fn().mockResolvedValue([]);
    figma.loadFontAsync = jest.fn().mockImplementation((fontName) => {
      if (fontName === target.fontName) {
        return Promise.reject(new Error('Font loading failed'));
      }
      return Promise.resolve();
    });

    defaultTokenValueRetriever.getVariableReference = jest.fn().mockResolvedValue(familyVariable);
    defaultTokenValueRetriever.applyVariablesStylesOrRawValue = ApplyVariablesStylesOrRawValues.VARIABLES;

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(consoleSpy).toHaveBeenCalledWith('error loading font', expect.any(Error));
    expect(target.setBoundVariable).toHaveBeenCalledWith('fontFamily', familyVariable);

    consoleSpy.mockRestore();
  });

  it('should handle setBoundVariable error gracefully', async () => {
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

    // Mock console.error to verify it's called
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

  it('should handle general errors in the main try-catch block', async () => {
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

    // Mock console.error to verify it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock Object.entries to throw an error to trigger the main catch block
    const originalEntries = Object.entries;
    Object.entries = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    await tryApplyTypographyCompositeVariable({
      target, value, resolvedValue, baseFontSize,
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    // Restore original methods
    Object.entries = originalEntries;
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
});
