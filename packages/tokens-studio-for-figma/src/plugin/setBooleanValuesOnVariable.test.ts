import setBooleanValuesOnVariable from './setBooleanValuesOnVariable';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';

jest.mock('@/utils/isAliasReference');

describe('setBooleanValuesOnVariable', () => {
  let mockVariable: Variable;
  const mockMode = 'light';

  beforeEach(() => {
    mockVariable = {
      valuesByMode: {
        light: false,
      },
      setValueForMode: jest.fn(),
    } as unknown as Variable;

    (isVariableWithAliasReference as unknown as jest.Mock).mockReset();
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
});
