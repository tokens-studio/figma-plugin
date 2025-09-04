import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

jest.mock('@/utils/isAliasReference');
jest.mock('@/utils/checkVariableAliasEquality');

describe('setBooleanValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';
  const mockCheckVariableAliasEquality = checkVariableAliasEquality as jest.MockedFunction<typeof checkVariableAliasEquality>;

  beforeEach(() => {
    mockVariable = {
      valuesByMode: {
        light: false,
      },
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    (isVariableWithAliasReference as unknown as jest.Mock).mockReset();
    mockCheckVariableAliasEquality.mockClear();
    mockCheckVariableAliasEquality.mockReturnValue(false);
  });

  it('should set new boolean value when different from existing value', () => {
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setBooleanValuesOnVariable(mockVariable, mockMode, 'true');
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, true);
  });

  it('should not set value when new value equals existing value', () => {
    mockVariable.valuesByMode.light = false;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setBooleanValuesOnVariable(mockVariable, mockMode, 'false');
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should handle alias references', () => {
    mockVariable.valuesByMode.light = '{bool.primary}';
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    setBooleanValuesOnVariable(mockVariable, mockMode, 'true');
    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, true);
  });

  it('should return early if existing value is invalid', () => {
    mockVariable.valuesByMode.light = 'invalid' as any;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(false);
    setBooleanValuesOnVariable(mockVariable, mockMode, 'true');
    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
  });

  it('should not update variable when alias already points to correct variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode.light = aliasValue;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    mockCheckVariableAliasEquality.mockReturnValue(true);

    setBooleanValuesOnVariable(mockVariable, mockMode, 'true', '{bool.primary}');

    expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{bool.primary}');
  });

  it('should update variable when alias points to different variable', () => {
    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    mockVariable.valuesByMode.light = aliasValue;
    (isVariableWithAliasReference as unknown as jest.Mock).mockReturnValue(true);
    mockCheckVariableAliasEquality.mockReturnValue(false);

    setBooleanValuesOnVariable(mockVariable, mockMode, 'true', '{bool.secondary}');

    expect(mockVariable.setValueForMode).toHaveBeenCalledWith(mockMode, true);
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(aliasValue, '{bool.secondary}');
  });
});
