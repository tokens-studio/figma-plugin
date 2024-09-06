import { tryApplyTypographyCompositeVariable } from './tryApplyTypographyCompositeVariable';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { SingleTypographyToken } from '@/types/tokens';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

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
});
