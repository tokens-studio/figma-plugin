import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';

jest.mock('@/utils/isAliasReference');

describe('setNumberValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';

  beforeEach(() => {
    mockVariable = {
      name: 'testVariable',
      valuesByMode: {
        light: 10,
      },
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    (isVariableWithAliasReference as unknown as jest.Mock).mockReset();
  });

  it('should set new number value when different from existing value', () => {
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 20);
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 20);
  });

  it('should not set value when new value equals existing value', () => {
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 10);
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should not set value when normalized values are identical', () => {
    // Set up a scenario where raw values are different but normalized values are the same
    mockVariable.valuesByMode.light = 0.1234567;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 0.1234569);
    // Both normalize to 0.123456, so no update should occur
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should set value when normalized values are different', () => {
    mockVariable.valuesByMode.light = 0.123456;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 0.123457);
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 0.123457);
  });

  it('should handle alias references', () => {
    mockVariable.valuesByMode.light = '{number.primary}';
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    setNumberValuesOnVariable(mockVariable, mockMode, 30);
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 30);
  });

  it('should handle NaN values', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    setNumberValuesOnVariable(mockVariable, mockMode, NaN);
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle existing value of 0', () => {
    mockVariable.valuesByMode.light = 0;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 20);
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 20);
  });

  it('should handle new value of 0', () => {
    mockVariable.valuesByMode.light = 20;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 0);
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 0);
  });

  it('should return early if existing value is invalid', () => {
    mockVariable.valuesByMode.light = 'invalid' as any;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setNumberValuesOnVariable(mockVariable, mockMode, 20);
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });
});
