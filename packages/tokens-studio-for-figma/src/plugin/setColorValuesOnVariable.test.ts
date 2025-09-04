import setColorValuesOnVariable, { normalizeFigmaColor } from './setColorValuesOnVariable';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

// Mock the checkVariableAliasEquality function
jest.mock('@/utils/checkVariableAliasEquality');

describe('normalizeFigmaColor', () => {
  it('should round color values to 6 decimal places', () => {
    const input = {
      r: 0.12345678,
      g: 0.23456789,
      b: 0.34567890,
      a: 0.45678901,
    };

    const result = normalizeFigmaColor(input);

    expect(result).toEqual({
      r: 0.123457,
      g: 0.234568,
      b: 0.345679,
      a: 0.456789,
    });
  });
});

describe('setColorValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';
  const mockCheckVariableAliasEquality = checkVariableAliasEquality as jest.MockedFunction<typeof checkVariableAliasEquality>;

  beforeEach(() => {
    mockVariable = {
      valuesByMode: {},
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    // Reset mock
    mockCheckVariableAliasEquality.mockClear();
    mockCheckVariableAliasEquality.mockReturnValue(false);
  });

  it('should set new color value when values are different', () => {
    mockVariable.valuesByMode[mockMode] = {
      r: 0, g: 0, b: 0, a: 1,
    };

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(
      mockMode,
      expect.objectContaining({
        r: 1, g: 0, b: 0, a: 1,
      }),
    );
  });

  it('should not set value when colors are identical', () => {
    mockVariable.valuesByMode[mockMode] = {
      r: 1, g: 0, b: 0, a: 1,
    };

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000');

    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should handle invalid existing variable values', () => {
    mockVariable.valuesByMode[mockMode] = 'invalid' as any;

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000');

    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    setColorValuesOnVariable(mockVariable, mockMode, 'invalid-color');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting colorVariable',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('should not update variable when alias already points to correct variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode[mockMode] = aliasValue;
    mockCheckVariableAliasEquality.mockReturnValue(true);

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000', 'accent.default', '{accent.default}');

    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{accent.default}');
  });

  it('should update variable when alias points to different variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode[mockMode] = aliasValue;
    mockCheckVariableAliasEquality.mockReturnValue(false);

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000', 'accent.default', '{primary.default}');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(
      mockMode,
      expect.objectContaining({
        r: 1, g: 0, b: 0, a: 1,
      }),
    );
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{primary.default}');
  });

  it('should handle direct color values without rawValue', () => {
    mockVariable.valuesByMode[mockMode] = {
      r: 0, g: 0, b: 0, a: 1,
    };

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(
      mockMode,
      expect.objectContaining({
        r: 1, g: 0, b: 0, a: 1,
      }),
    );
    // Should call checkVariableAliasEquality with undefined rawValue
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(
      { r: 0, g: 0, b: 0, a: 1 }, 
      undefined
    );
  });
});
