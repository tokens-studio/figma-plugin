import { SingleToken } from '@/types/tokens';
import setValuesOnVariable from './setValuesOnVariable';
import { TokenTypes } from '@/constants/TokenTypes';
import { checkVariableAliasEquality } from '@/utils/checkVariableAliasEquality';

// Mock the checkVariableAliasEquality function to control its behavior
jest.mock('@/utils/checkVariableAliasEquality');

const baseFontSize = '16px';

describe('SetValuesOnVariable - Alias Reference Testing', () => {
  const mockSetValueForMode = jest.fn();
  const mockCheckVariableAliasEquality = checkVariableAliasEquality as jest.MockedFunction<
    typeof checkVariableAliasEquality
  >;

  // Mock variables with alias references for each type
  const variablesInFigma = [
    {
      id: 'VariableID:color:1',
      key: 'color-key-1',
      name: 'colors/primary',
      resolvedType: 'COLOR',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: { type: 'VARIABLE_ALIAS', id: 'VariableID:referenced:color' },
      },
    } as unknown as Variable,
    {
      id: 'VariableID:number:1',
      key: 'number-key-1',
      name: 'sizing/large',
      resolvedType: 'FLOAT',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: { type: 'VARIABLE_ALIAS', id: 'VariableID:referenced:number' },
      },
    } as unknown as Variable,
    {
      id: 'VariableID:boolean:1',
      key: 'boolean-key-1',
      name: 'flags/enabled',
      resolvedType: 'BOOLEAN',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: { type: 'VARIABLE_ALIAS', id: 'VariableID:referenced:boolean' },
      },
    } as unknown as Variable,
    {
      id: 'VariableID:string:1',
      key: 'string-key-1',
      name: 'text/heading',
      resolvedType: 'STRING',
      setValueForMode: mockSetValueForMode,
      valuesByMode: {
        309: { type: 'VARIABLE_ALIAS', id: 'VariableID:referenced:string' },
      },
    } as unknown as Variable,
  ] as Variable[];

  const mode = '309';
  const collection = {
    id: 'VariableCollectionId:309:16430',
  } as VariableCollection;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckVariableAliasEquality.mockReturnValue(false); // Default to not matching
  });

  it('should not update any variables when all aliases already point to correct variables', async () => {
    // Mock all alias checks to return true (alias already points to correct variable)
    mockCheckVariableAliasEquality.mockReturnValue(true);

    const tokens = [
      {
        name: 'colors.primary',
        path: 'colors/primary',
        rawValue: '{colors.accent}',
        value: '#FF0000',
        type: TokenTypes.COLOR,
        variableId: 'color-key-1',
      },
      {
        name: 'sizing.large',
        path: 'sizing/large',
        rawValue: '{sizing.xl}',
        value: '32',
        type: TokenTypes.SIZING,
        variableId: 'number-key-1',
      },
      {
        name: 'flags.enabled',
        path: 'flags/enabled',
        rawValue: '{flags.default}',
        value: 'true',
        type: TokenTypes.BOOLEAN,
        variableId: 'boolean-key-1',
      },
      {
        name: 'text.heading',
        path: 'text/heading',
        rawValue: '{text.primary}',
        value: 'Heading Text',
        type: TokenTypes.TEXT,
        variableId: 'string-key-1',
      },
    ] as SingleToken<true, { path: string; variableId: string }>[];

    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);

    // Verify that setValueForMode was never called since aliases already point to correct variables
    expect(mockSetValueForMode).not.toHaveBeenCalled();

    // Verify that alias equality check was called for each token
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledTimes(4);
  });

  it('should update variables when aliases point to different variables', async () => {
    // Mock all alias checks to return false (alias points to wrong variable)
    mockCheckVariableAliasEquality.mockReturnValue(false);

    const tokens = [
      {
        name: 'colors.primary',
        path: 'colors/primary',
        rawValue: '{colors.secondary}',
        value: '#00FF00',
        type: TokenTypes.COLOR,
        variableId: 'color-key-1',
      },
      {
        name: 'sizing.large',
        path: 'sizing/large',
        rawValue: '{sizing.medium}',
        value: '24',
        type: TokenTypes.SIZING,
        variableId: 'number-key-1',
      },
      {
        name: 'flags.enabled',
        path: 'flags/enabled',
        rawValue: '{flags.disabled}',
        value: 'false',
        type: TokenTypes.BOOLEAN,
        variableId: 'boolean-key-1',
      },
      {
        name: 'text.heading',
        path: 'text/heading',
        rawValue: '{text.secondary}',
        value: 'New Heading',
        type: TokenTypes.TEXT,
        variableId: 'string-key-1',
      },
    ] as SingleToken<true, { path: string; variableId: string }>[];

    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);

    // Verify that setValueForMode was called for each variable
    expect(mockSetValueForMode).toHaveBeenCalledTimes(4);

    // Verify specific calls
    expect(mockSetValueForMode).toHaveBeenCalledWith(
      mode,
      expect.objectContaining({
        r: 0,
        g: 1,
        b: 0,
        a: 1, // #00FF00
      }),
    );
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 24);
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, false);
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 'New Heading');
  });

  it('should handle mixed scenarios where some aliases match and others do not', async () => {
    // Mock selective responses: color and boolean match, number and string do not
    mockCheckVariableAliasEquality
      .mockReturnValueOnce(true) // color alias matches
      .mockReturnValueOnce(false) // number alias does not match
      .mockReturnValueOnce(true) // boolean alias matches
      .mockReturnValueOnce(false); // string alias does not match

    const tokens = [
      {
        name: 'colors.primary',
        path: 'colors/primary',
        rawValue: '{colors.accent}',
        value: '#FF0000',
        type: TokenTypes.COLOR,
        variableId: 'color-key-1',
      },
      {
        name: 'sizing.large',
        path: 'sizing/large',
        rawValue: '{sizing.medium}',
        value: '24',
        type: TokenTypes.SIZING,
        variableId: 'number-key-1',
      },
      {
        name: 'flags.enabled',
        path: 'flags/enabled',
        rawValue: '{flags.default}',
        value: 'true',
        type: TokenTypes.BOOLEAN,
        variableId: 'boolean-key-1',
      },
      {
        name: 'text.heading',
        path: 'text/heading',
        rawValue: '{text.secondary}',
        value: 'New Heading',
        type: TokenTypes.TEXT,
        variableId: 'string-key-1',
      },
    ] as SingleToken<true, { path: string; variableId: string }>[];

    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);

    // Should only update number and string variables (2 calls)
    expect(mockSetValueForMode).toHaveBeenCalledTimes(2);
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 24);
    expect(mockSetValueForMode).toHaveBeenCalledWith(mode, 'New Heading');
  });

  it('should work correctly with tokens that do not have rawValue references', async () => {
    const tokens = [
      {
        name: 'colors.primary',
        path: 'colors/primary',
        rawValue: '#FF0000', // Direct value, not a reference
        value: '#FF0000',
        type: TokenTypes.COLOR,
        variableId: 'color-key-1',
      },
    ] as SingleToken<true, { path: string; variableId: string }>[];

    await setValuesOnVariable(variablesInFigma, tokens, collection, mode, baseFontSize);

    // Should call checkVariableAliasEquality with undefined rawValue
    expect(mockCheckVariableAliasEquality).toHaveBeenCalledWith(
      { type: 'VARIABLE_ALIAS', id: 'VariableID:referenced:color' },
      '#FF0000',
    );
  });
});
