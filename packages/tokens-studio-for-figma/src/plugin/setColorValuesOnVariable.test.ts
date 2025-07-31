import setColorValuesOnVariable, { normalizeFigmaColor } from './setColorValuesOnVariable';

describe('normalizeFigmaColor', () => {
  it('should round color values to 6 decimal places', () => {
    const input = {
      r: 0.12345678,
      g: 0.23456789,
      b: 0.3456789,
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

  beforeEach(() => {
    mockVariable = {
      valuesByMode: {},
      setValueForMode: jest.fn(),
    } as unknown as Variable;
  });

  it('should set new color value when values are different', () => {
    mockVariable.valuesByMode[mockMode] = {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    };

    setColorValuesOnVariable(mockVariable, mockMode, '#FF0000');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(
      mockMode,
      expect.objectContaining({
        r: 1,
        g: 0,
        b: 0,
        a: 1,
      }),
    );
  });

  it('should not set value when colors are identical', () => {
    mockVariable.valuesByMode[mockMode] = {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
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

    expect(consoleSpy).toHaveBeenCalledWith('Error setting colorVariable', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
