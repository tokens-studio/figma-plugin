import updateVariablesToReference from './updateVariablesToReference';
import { ReferenceVariableType } from './setValuesOnVariable';
import * as getVariablesWithoutZombiesModule from './getVariablesWithoutZombies';

// Mock the getVariablesWithoutZombies function
jest.mock('./getVariablesWithoutZombies');
const mockGetVariablesWithoutZombies =
  getVariablesWithoutZombiesModule.getVariablesWithoutZombies as jest.MockedFunction<
    typeof getVariablesWithoutZombiesModule.getVariablesWithoutZombies
  >;

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
    const figmaVariables = new Map([['color.primary', 'V:different-collection']]);

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
    mockGetVariablesWithoutZombies.mockResolvedValue([differentCollectionVariable as any]);

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
    const figmaVariables = new Map([['color.primary', 'V:global-fallback']]);

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
});
