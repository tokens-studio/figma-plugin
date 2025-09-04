import setNumberValuesOnVariable from './setNumberValuesOnVariable';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

jest.mock('@/utils/isAliasReference');
jest.mock('@/utils/checkVariableAliasEquality');

describe('setNumberValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';
  const mockCheckVariableAliasEquality = checkVariableAliasEquality as jest.MockedFunction<typeof checkVariableAliasEquality>;

  beforeEach(() => {
    mockVariable = {
      name: 'testVariable',
      valuesByMode: {
        light: 10,
      },
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    (isVariableWithAliasReference as unknown as jest.Mock).mockReset();
    mockCheckVariableAliasEquality.mockClear();
    mockCheckVariableAliasEquality.mockReturnValue(false);
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

  it('should not update variable when alias already points to correct variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode.light = aliasValue;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    mockCheckVariableAliasEquality.mockReturnValue(true);

    setNumberValuesOnVariable(mockVariable, mockMode, 30, '{number.primary}');

    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{number.primary}');
  });

  it('should update variable when alias points to different variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode.light = aliasValue;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    mockCheckVariableAliasEquality.mockReturnValue(false);

    setNumberValuesOnVariable(mockVariable, mockMode, 30, '{number.secondary}');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 30);
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{number.secondary}');
  });
});
