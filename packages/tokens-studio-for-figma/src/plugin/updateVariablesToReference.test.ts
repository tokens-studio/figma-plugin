import updateVariablesToReference from './updateVariablesToReference';
import { ReferenceVariableType } from './setValuesOnVariable';
import * as getVariablesWithoutZombiesModule from './getVariablesWithoutZombies';

// Mock the getVariablesWithoutZombies function
jest.mock('./getVariablesWithoutZombies');
const mockGetVariablesWithoutZombies = getVariablesWithoutZombiesModule.getVariablesWithoutZombies as jest.MockedFunction<typeof getVariablesWithoutZombiesModule.getVariablesWithoutZombies>;

describe('updateVariablesToReference', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock figma.variables.importVariableByKeyAsync
    figma.variables.importVariableByKeyAsync = jest.fn();
  });

  it('should prioritize variables from the same collection over global map', async () => {
    // Setup mock variables
    const collection1Id = 'coll1';
    const collection2Id = 'coll2';

    const sameCollectionVariable = {
      name: 'color/primary',
      key: 'V:same-collection',
      variableCollectionId: collection1Id,
    };

    const differentCollectionVariable = {
      name: 'color/primary',
      key: 'V:different-collection',
      variableCollectionId: collection2Id,
    };

    // Mock getVariablesWithoutZombies to return both variables
    mockGetVariablesWithoutZombies.mockResolvedValue([
      sameCollectionVariable as any,
      differentCollectionVariable as any,
    ]);

    // Mock importVariableByKeyAsync to return a mock variable
    const mockReferencedVariable = { id: 'imported-var-id' };
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockResolvedValue(mockReferencedVariable);

    // Create a mock alias variable that belongs to collection1
    const mockAliasVariable = {
      variableCollectionId: collection1Id,
      setValueForMode: jest.fn(),
    };

    const referenceVariableCandidate: ReferenceVariableType = {
      variable: mockAliasVariable as any,
      modeId: 'mode1',
      referenceVariable: 'color.primary',
    };

    // Global map that would return the different collection variable
    const figmaVariables = new Map([
      ['color.primary', 'V:different-collection'],
    ]);

    // Call the function
    await updateVariablesToReference(figmaVariables, [referenceVariableCandidate]);

    // Verify that importVariableByKeyAsync was called with the same-collection variable key
    expect(figma.variables.importVariableByKeyAsync).toHaveBeenCalledWith('V:same-collection');

    // Verify that setValueForMode was called with the correct reference
    expect(mockAliasVariable.setValueForMode).toHaveBeenCalledWith('mode1', {
      type: 'VARIABLE_ALIAS',
      id: 'imported-var-id',
    });
  });

  it('should fall back to global map when no same-collection variable exists', async () => {
    // Setup mock variables - only one in different collection
    const collection1Id = 'coll1';
    const collection2Id = 'coll2';

    const differentCollectionVariable = {
      name: 'color/primary',
      key: 'V:different-collection',
      variableCollectionId: collection2Id,
    };

    // Mock getVariablesWithoutZombies to return only the different collection variable
    mockGetVariablesWithoutZombies.mockResolvedValue([
      differentCollectionVariable as any,
    ]);

    // Mock importVariableByKeyAsync
    const mockReferencedVariable = { id: 'imported-var-id' };
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockResolvedValue(mockReferencedVariable);

    // Create a mock alias variable that belongs to collection1
    const mockAliasVariable = {
      variableCollectionId: collection1Id,
      setValueForMode: jest.fn(),
    };

    const referenceVariableCandidate: ReferenceVariableType = {
      variable: mockAliasVariable as any,
      modeId: 'mode1',
      referenceVariable: 'color.primary',
    };

    // Global map with the variable
    const figmaVariables = new Map([
      ['color.primary', 'V:global-fallback'],
    ]);

    // Call the function
    await updateVariablesToReference(figmaVariables, [referenceVariableCandidate]);

    // Verify that importVariableByKeyAsync was called with the global fallback key
    expect(figma.variables.importVariableByKeyAsync).toHaveBeenCalledWith('V:global-fallback');

    // Verify that setValueForMode was called
    expect(mockAliasVariable.setValueForMode).toHaveBeenCalledWith('mode1', {
      type: 'VARIABLE_ALIAS',
      id: 'imported-var-id',
    });
  });

  it('should handle cases where no reference variable is found', async () => {
    // Mock getVariablesWithoutZombies to return empty array
    mockGetVariablesWithoutZombies.mockResolvedValue([]);

    // Create a mock alias variable
    const mockAliasVariable = {
      variableCollectionId: 'coll1',
      setValueForMode: jest.fn(),
    };

    const referenceVariableCandidate: ReferenceVariableType = {
      variable: mockAliasVariable as any,
      modeId: 'mode1',
      referenceVariable: 'color.primary',
    };

    // Empty global map
    const figmaVariables = new Map();

    // Call the function
    const result = await updateVariablesToReference(figmaVariables, [referenceVariableCandidate]);

    // Verify that importVariableByKeyAsync was not called
    expect(figma.variables.importVariableByKeyAsync).not.toHaveBeenCalled();

    // Verify that setValueForMode was not called
    expect(mockAliasVariable.setValueForMode).not.toHaveBeenCalled();

    // Verify empty result
    expect(result).toEqual([]);
  });

  it('should fall back to finding variable by name when importVariableByKeyAsync fails for non-local library variables', async () => {
    // Simulate scenario where a remote/library variable is already imported and available by name
    // but importVariableByKeyAsync fails (e.g., library not properly enabled, permissions issue)
    const collection1Id = 'coll1';
    const libraryCollectionId = 'library-coll';
    const libraryVariableKey = 'eae96b38ba5c7e98ce9dcd43c105e19ccff36d4d'; // Sample library variable key (hash format)

    // Mock a variable from a published library that's already imported/available
    const libraryVariable = {
      name: 'library/colors/brand',
      key: libraryVariableKey,
      id: 'VariableID:remote:123',
      variableCollectionId: libraryCollectionId,
    };

    // Mock getVariablesWithoutZombies to return the library variable
    // This simulates the variable being already imported and accessible in the consuming file
    mockGetVariablesWithoutZombies.mockResolvedValue([
      libraryVariable as any,
    ]);

    // Mock importVariableByKeyAsync to fail (simulating library not enabled or permission issue)
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockRejectedValue(
      new Error(`could not find variable with key "${libraryVariableKey}"`),
    );

    // Create a mock alias variable in the local collection that needs to reference the library variable
    const mockAliasVariable = {
      variableCollectionId: collection1Id,
      setValueForMode: jest.fn(),
    };

    const referenceVariableCandidate: ReferenceVariableType = {
      variable: mockAliasVariable as any,
      modeId: 'mode1',
      referenceVariable: 'library.colors.brand', // Normalized name matching the library variable
    };

    // Global map with the library variable's key
    const figmaVariables = new Map([
      ['library.colors.brand', libraryVariableKey],
    ]);

    // Call the function
    const result = await updateVariablesToReference(figmaVariables, [referenceVariableCandidate]);

    // Verify that importVariableByKeyAsync was attempted
    expect(figma.variables.importVariableByKeyAsync).toHaveBeenCalledWith(libraryVariableKey);

    // Verify that setValueForMode was called with the fallback variable found by name
    expect(mockAliasVariable.setValueForMode).toHaveBeenCalledWith('mode1', {
      type: 'VARIABLE_ALIAS',
      id: 'VariableID:remote:123', // Using the library variable's ID
    });

    // Verify the variable was successfully updated
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockAliasVariable);
  });

  it('should successfully import and reference non-local library variables when import succeeds', async () => {
    // Test the successful path for remote/library variables
    const collection1Id = 'coll1';
    const libraryCollectionId = 'library-coll';

    // Mock a variable from a published library
    const libraryVariableByName = {
      name: 'library/colors/accent',
      key: 'abc123def456',
      variableCollectionId: libraryCollectionId,
    };

    // Mock the imported variable (what importVariableByKeyAsync returns)
    const importedLibraryVariable = {
      id: 'VariableID:remote:456',
      name: 'library/colors/accent',
      key: 'abc123def456',
      variableCollectionId: libraryCollectionId,
    };

    // Mock getVariablesWithoutZombies to return the library variable
    mockGetVariablesWithoutZombies.mockResolvedValue([
      libraryVariableByName as any,
    ]);

    // Mock importVariableByKeyAsync to succeed
    (figma.variables.importVariableByKeyAsync as jest.Mock).mockResolvedValue(importedLibraryVariable);

    // Create a mock alias variable that needs to reference the library variable
    const mockAliasVariable = {
      variableCollectionId: collection1Id,
      setValueForMode: jest.fn(),
    };

    const referenceVariableCandidate: ReferenceVariableType = {
      variable: mockAliasVariable as any,
      modeId: 'mode1',
      referenceVariable: 'library.colors.accent',
    };

    // Global map with the library variable's key
    const figmaVariables = new Map([
      ['library.colors.accent', 'abc123def456'],
    ]);

    // Call the function
    const result = await updateVariablesToReference(figmaVariables, [referenceVariableCandidate]);

    // Verify that importVariableByKeyAsync was called
    expect(figma.variables.importVariableByKeyAsync).toHaveBeenCalledWith('abc123def456');

    // Verify that setValueForMode was called with the imported variable
    expect(mockAliasVariable.setValueForMode).toHaveBeenCalledWith('mode1', {
      type: 'VARIABLE_ALIAS',
      id: 'VariableID:remote:456',
    });

    // Verify the variable was successfully updated
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockAliasVariable);
  });
});
