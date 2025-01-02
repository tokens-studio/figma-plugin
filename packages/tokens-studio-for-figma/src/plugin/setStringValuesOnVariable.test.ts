import setStringValuesOnVariable from './setStringValuesOnVariable';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';

jest.mock('@/utils/isAliasReference');

describe('setStringValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';

  beforeEach(() => {
    mockVariable = {
      valuesByMode: {
        light: 'oldValue',
      },
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    (isVariableWithAliasReference as unknown as jest.Mock).mockReset();
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
});
