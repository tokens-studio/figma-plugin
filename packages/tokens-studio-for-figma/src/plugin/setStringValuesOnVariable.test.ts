import setStringValuesOnVariable from './setStringValuesOnVariable';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

jest.mock('@/utils/isAliasReference');
jest.mock('@/utils/checkVariableAliasEquality');

describe('setStringValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';
  const mockCheckVariableAliasEquality = checkVariableAliasEquality as jest.MockedFunction<typeof checkVariableAliasEquality>;

  beforeEach(() => {
    mockVariable = {
      valuesByMode: {
        light: 'oldValue',
      },
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    (isVariableWithAliasReference as unknown as jest.Mock).mockReset();
    mockCheckVariableAliasEquality.mockClear();
    mockCheckVariableAliasEquality.mockReturnValue(false);
  });

  it('should set new string value when different from existing value', () => {
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setStringValuesOnVariable(mockVariable, mockMode, 'newValue');
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 'newValue');
  });

  it('should not set value when new value equals existing value', () => {
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setStringValuesOnVariable(mockVariable, mockMode, 'oldValue');
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should handle alias references', () => {
    mockVariable.valuesByMode.light = '{color.primary}';
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    setStringValuesOnVariable(mockVariable, mockMode, '{color.secondary}');
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, '{color.secondary}');
  });

  it('should return early if existing value is invalid', () => {
    mockVariable.valuesByMode.light = 123 as any;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setStringValuesOnVariable(mockVariable, mockMode, 'newValue');
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should not update variable when alias already points to correct variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode.light = aliasValue;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    mockCheckVariableAliasEquality.mockReturnValue(true);

    setStringValuesOnVariable(mockVariable, mockMode, 'newValue', '{string.primary}');

    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{string.primary}');
  });

  it('should update variable when alias points to different variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode.light = aliasValue;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    mockCheckVariableAliasEquality.mockReturnValue(false);

    setStringValuesOnVariable(mockVariable, mockMode, 'newValue', '{string.secondary}');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, 'newValue');
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{string.secondary}');
  });
});
