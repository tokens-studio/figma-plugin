import { removeUnusedVariables } from './removeUnusedVariables';
import { SettingsState } from '@/app/store/models/settings';

describe('removeUnusedVariables', () => {
  const mockVariables = [
    {
      id: 'var1',
      key: 'key1',
      name: 'Variable 1',
      variableCollectionId: 'collection1',
      remove: jest.fn(),
    },
    {
      id: 'var2',
      key: 'key2',
      name: 'Variable 2',
      variableCollectionId: 'collection1',
      remove: jest.fn(),
    },
    {
      id: 'var3',
      key: 'key3',
      name: 'Variable 3',
      variableCollectionId: 'collection2',
      remove: jest.fn(),
    },
    {
      id: 'var4',
      key: 'key4',
      name: 'Variable 4',
      variableCollectionId: 'collection1',
      remove: jest.fn(),
    },
  ];

  const mockCollection = {
    id: 'collection1',
    name: 'Test Collection',
  } as VariableCollection;

  const baseSettings = {
    removeStylesAndVariablesWithoutConnection: true,
  } as SettingsState;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the remove function mocks
    mockVariables.forEach((variable) => {
      (variable.remove as jest.Mock).mockClear();
    });
    // Setup the mock to return our test variables
    (figma.variables.getLocalVariables as jest.Mock).mockReturnValue(mockVariables);
  });

  it('should remove variables not in the used keys set', () => {
    const usedKeys = new Set(['key1', 'key3']); // key2 and key4 should be removed

    const result = removeUnusedVariables(mockCollection, usedKeys, baseSettings);

    // Should return the keys of removed variables from collection1 only
    expect(result).toEqual(['key2', 'key4']);

    // Should call remove on unused variables in the collection
    expect(mockVariables[1].remove).toHaveBeenCalledTimes(1); // var2/key2
    expect(mockVariables[3].remove).toHaveBeenCalledTimes(1); // var4/key4

    // Should not call remove on used variables or variables from other collections
    expect(mockVariables[0].remove).not.toHaveBeenCalled(); // var1/key1 (used)
    expect(mockVariables[2].remove).not.toHaveBeenCalled(); // var3/key3 (different collection)
  });

  it('should not remove any variables when all are used', () => {
    const usedKeys = new Set(['key1', 'key2', 'key4']); // All variables in collection1

    const result = removeUnusedVariables(mockCollection, usedKeys, baseSettings);

    expect(result).toEqual([]);

    // Should not call remove on any variables
    mockVariables.forEach((variable) => {
      expect(variable.remove).not.toHaveBeenCalled();
    });
  });

  it('should remove all variables when none are used', () => {
    const usedKeys = new Set<string>(); // No used variables

    const result = removeUnusedVariables(mockCollection, usedKeys, baseSettings);

    // Should return keys of all variables in collection1
    expect(result).toEqual(['key1', 'key2', 'key4']);

    // Should call remove on all variables in the collection
    expect(mockVariables[0].remove).toHaveBeenCalledTimes(1); // var1/key1
    expect(mockVariables[1].remove).toHaveBeenCalledTimes(1); // var2/key2
    expect(mockVariables[3].remove).toHaveBeenCalledTimes(1); // var4/key4

    // Should not call remove on variables from other collections
    expect(mockVariables[2].remove).not.toHaveBeenCalled(); // var3/key3 (different collection)
  });

  it('should not remove variables when setting is disabled', () => {
    const settingsDisabled = {
      removeStylesAndVariablesWithoutConnection: false,
    } as SettingsState;

    const usedKeys = new Set(['key1']); // Only key1 is used

    const result = removeUnusedVariables(mockCollection, usedKeys, settingsDisabled);

    expect(result).toEqual([]);

    // Should not call remove on any variables
    mockVariables.forEach((variable) => {
      expect(variable.remove).not.toHaveBeenCalled();
    });
  });

  it('should only process variables from the specified collection', () => {
    const differentCollection = {
      id: 'collection2',
      name: 'Different Collection',
    } as VariableCollection;

    const usedKeys = new Set<string>(); // No used variables

    const result = removeUnusedVariables(differentCollection, usedKeys, baseSettings);

    // Should only return key3 (the only variable in collection2)
    expect(result).toEqual(['key3']);

    // Should only call remove on var3 (from collection2)
    expect(mockVariables[2].remove).toHaveBeenCalledTimes(1);

    // Should not call remove on variables from collection1
    expect(mockVariables[0].remove).not.toHaveBeenCalled();
    expect(mockVariables[1].remove).not.toHaveBeenCalled();
    expect(mockVariables[3].remove).not.toHaveBeenCalled();
  });

  it('should handle empty collections gracefully', () => {
    // Mock empty collection
    (figma.variables.getLocalVariables as jest.Mock).mockReturnValueOnce([]);

    const usedKeys = new Set(['key1']);

    const result = removeUnusedVariables(mockCollection, usedKeys, baseSettings);

    expect(result).toEqual([]);
  });
});
