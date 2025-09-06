import { checkVariableAliasEquality } from './checkVariableAliasEquality';
import { isVariableWithAliasReference } from '@/utils/isAliasReference';
import { normalizeVariableName } from '@/utils/normalizeVariableName';

// Mock the dependencies
jest.mock('@/utils/isAliasReference');
jest.mock('@/utils/normalizeVariableName');

// Mock figma globals
global.figma = {
  variables: {
    getVariableById: jest.fn(),
  },
} as any;

describe('checkVariableAliasEquality', () => {
  const mockIsVariableWithAliasReference = isVariableWithAliasReference as jest.MockedFunction<
    typeof isVariableWithAliasReference
  >;
  const mockNormalizeVariableName = normalizeVariableName as jest.MockedFunction<typeof normalizeVariableName>;
  const mockGetVariableById = figma.variables.getVariableById as jest.MockedFunction<
    typeof figma.variables.getVariableById
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when existingValue is not an alias reference', () => {
    mockIsVariableWithAliasReference.mockReturnValue(false);

    const result = checkVariableAliasEquality(
      {
        r: 1,
        g: 0,
        b: 0,
        a: 1,
      },
      '{accent.default}',
    );

    expect(result).toBe(false);
    expect(mockGetVariableById).not.toHaveBeenCalled();
  });

  it('should return false when rawValue is not provided', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue);

    expect(result).toBe(false);
    expect(mockGetVariableById).not.toHaveBeenCalled();
  });

  it('should return false when rawValue does not have reference syntax', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue, 'accent.default');

    expect(result).toBe(false);
    expect(mockGetVariableById).not.toHaveBeenCalled();
  });

  it('should return false when referenced variable is not found', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);
    mockGetVariableById.mockReturnValue(null);

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue, '{accent.default}');

    expect(result).toBe(false);
    expect(mockGetVariableById).toHaveBeenCalledWith('VariableID:1:9');
  });

  it('should return true when alias points to the correct variable', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);
    mockGetVariableById.mockReturnValue({ name: 'accent/default' } as any);
    mockNormalizeVariableName.mockImplementation((name) => name.replace('/', '.'));

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue, '{accent.default}');

    expect(result).toBe(true);
    expect(mockGetVariableById).toHaveBeenCalledWith('VariableID:1:9');
    expect(mockNormalizeVariableName).toHaveBeenCalledWith('accent/default');
    expect(mockNormalizeVariableName).toHaveBeenCalledWith('accent.default');
  });

  it('should return false when alias points to a different variable', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);
    mockGetVariableById.mockReturnValue({ name: 'primary/default' } as any);
    mockNormalizeVariableName.mockImplementation((name) => name.replace('/', '.'));

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue, '{accent.default}');

    expect(result).toBe(false);
    expect(mockGetVariableById).toHaveBeenCalledWith('VariableID:1:9');
    expect(mockNormalizeVariableName).toHaveBeenCalledWith('primary/default');
    expect(mockNormalizeVariableName).toHaveBeenCalledWith('accent.default');
  });

  it('should handle errors gracefully', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);
    mockGetVariableById.mockImplementation(() => {
      throw new Error('Test error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue, '{accent.default}');

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Error checking variable alias equality:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should extract reference name correctly from complex paths', () => {
    mockIsVariableWithAliasReference.mockReturnValue(true);
    mockGetVariableById.mockReturnValue({ name: 'colors/semantic/accent/default' } as any);
    mockNormalizeVariableName.mockImplementation((name) => name.replace(/\//g, '.'));

    const aliasValue = { type: 'VARIABLE_ALIAS', id: 'VariableID:1:9' };
    const result = checkVariableAliasEquality(aliasValue, '{colors.semantic.accent.default}');

    expect(result).toBe(true);
    expect(mockNormalizeVariableName).toHaveBeenCalledWith('colors/semantic/accent/default');
    expect(mockNormalizeVariableName).toHaveBeenCalledWith('colors.semantic.accent.default');
  });
});
