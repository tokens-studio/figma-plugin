import setColorValuesOnVariable from '../setColorValuesOnVariable';
import setNumberValuesOnVariable from '../setNumberValuesOnVariable';
import setStringValuesOnVariable from '../setStringValuesOnVariable';
import setBooleanValuesOnVariable from '../setBooleanValuesOnVariable';
import updateVariablesToReference from '../updateVariablesToReference';

describe('Extended Collections Overrides', () => {
  let mockVariable: any;
  let mockCollection: any;

  beforeEach(() => {
    mockVariable = {
      name: 'test-var',
      valuesByMode: {},
      setValueForMode: jest.fn(),
      removeOverrideForMode: jest.fn(),
    };

    mockCollection = {
      id: 'child-coll-id',
      modes: [
        { modeId: 'child-mode-id', name: 'Child Mode', parentModeId: 'parent-mode-id' },
      ],
      isExtension: true,
      parentVariableCollectionId: 'parent-coll-id',
    };
  });

  describe('setColorValuesOnVariable', () => {
    it('should clear override if value matches parent mode', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': {
          r: 1, g: 0, b: 0, a: 1,
        }, // Red
        'child-mode-id': {
          r: 0, g: 0, b: 1, a: 1,
        }, // Currently blue override
      };

      setColorValuesOnVariable(mockVariable, 'child-mode-id', '#ff0000', mockCollection, false, 'clear');

      expect(mockVariable.removeOverrideForMode).toHaveBeenCalledWith('child-mode-id');
      expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    });

    it('should set override if value differs from parent mode', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': {
          r: 1, g: 0, b: 0, a: 1,
        }, // Red
      };

      setColorValuesOnVariable(mockVariable, 'child-mode-id', '#0000ff', mockCollection);

      expect(mockVariable.setValueForMode).toHaveBeenCalledWith('child-mode-id', {
        r: 0, g: 0, b: 1, a: 1,
      });
      expect(mockVariable.removeOverrideForMode).not.toHaveBeenCalled();
    });

    it('raw export pass (default) overwrites instead of clearing, since the parent may not be final yet', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': {
          r: 1, g: 0, b: 0, a: 1,
        },
        'child-mode-id': {
          r: 0, g: 0, b: 1, a: 1,
        },
      };

      setColorValuesOnVariable(mockVariable, 'child-mode-id', '#ff0000', mockCollection);

      expect(mockVariable.removeOverrideForMode).not.toHaveBeenCalled();
      expect(mockVariable.setValueForMode).toHaveBeenCalledWith('child-mode-id', {
        r: 1, g: 0, b: 0, a: 1,
      });
    });

    it("single-token edits ('keep') leave an existing child override alone", () => {
      mockVariable.id = 'var-1';
      mockVariable.valuesByMode = {
        'parent-mode-id': {
          r: 1, g: 0, b: 0, a: 1,
        },
      };
      mockCollection.variableOverrides = {
        'var-1': {
          'child-mode-id': {
            r: 0, g: 0, b: 1, a: 1,
          },
        },
      };

      setColorValuesOnVariable(mockVariable, 'child-mode-id', '#ff0000', mockCollection, false, 'keep');

      expect(mockVariable.removeOverrideForMode).not.toHaveBeenCalled();
      expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    });
  });

  describe('setNumberValuesOnVariable', () => {
    it('should clear override if value matches parent mode', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': 10,
        'child-mode-id': 20,
      };

      setNumberValuesOnVariable(mockVariable, 'child-mode-id', 10, mockCollection, false, 'clear');

      expect(mockVariable.removeOverrideForMode).toHaveBeenCalledWith('child-mode-id');
      expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    });

    it('should set override even if existing value was undefined (BUGFIX)', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': 10,
        // 'child-mode-id' is undefined
      };

      setNumberValuesOnVariable(mockVariable, 'child-mode-id', 20, mockCollection);

      expect(mockVariable.setValueForMode).toHaveBeenCalledWith('child-mode-id', 20);
    });
  });

  describe('setStringValuesOnVariable', () => {
    it('should clear override if value matches parent mode', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': 'parent',
        'child-mode-id': 'child',
      };

      setStringValuesOnVariable(mockVariable, 'child-mode-id', 'parent', mockCollection, false, 'clear');

      expect(mockVariable.removeOverrideForMode).toHaveBeenCalledWith('child-mode-id');
    });

    it('should set override even if existing value was undefined (BUGFIX)', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': 'parent',
      };

      setStringValuesOnVariable(mockVariable, 'child-mode-id', 'new-child', mockCollection);

      expect(mockVariable.setValueForMode).toHaveBeenCalledWith('child-mode-id', 'new-child');
    });
  });

  describe('setBooleanValuesOnVariable', () => {
    it('should clear override if value matches parent mode', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': true,
        'child-mode-id': false,
      };

      setBooleanValuesOnVariable(mockVariable, 'child-mode-id', 'true', mockCollection, false, 'clear');

      expect(mockVariable.removeOverrideForMode).toHaveBeenCalledWith('child-mode-id');
    });

    it('should set override even if existing value was undefined (BUGFIX)', () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': true,
      };

      setBooleanValuesOnVariable(mockVariable, 'child-mode-id', 'false', mockCollection);

      expect(mockVariable.setValueForMode).toHaveBeenCalledWith('child-mode-id', false);
    });
  });

  describe('Alias Overrides', () => {
    it('should clear alias override when parent mode has the same alias (inherit from parent)', async () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': { type: 'VARIABLE_ALIAS', id: 'target-id' },
        'child-mode-id': { type: 'VARIABLE_ALIAS', id: 'old-id' },
      };

      const candidates = [{
        variable: mockVariable,
        modeId: 'child-mode-id',
        referenceVariable: 'target-token',
        collection: mockCollection,
      }];

      const mockTargetVariable = { id: 'target-id', key: 'target-key' };
      global.figma = {
        variables: {
          importVariableByKeyAsync: jest.fn().mockResolvedValue(mockTargetVariable),
          getVariableById: jest.fn().mockReturnValue({ name: 'target-token' }),
          getLocalVariableCollections: jest.fn().mockReturnValue([]),
        },
        ui: { postMessage: jest.fn() },
      } as any;

      const figmaVariables = new Map([['target-token', 'target-key']]);

      await updateVariablesToReference(figmaVariables, candidates);

      // Parent already has the same alias — clear child override so it's inherited (not blue)
      expect(mockVariable.removeOverrideForMode).toHaveBeenCalledWith('child-mode-id');
      expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
    });

    it('should set explicit alias override when parent mode has a different alias', async () => {
      mockVariable.valuesByMode = {
        'parent-mode-id': { type: 'VARIABLE_ALIAS', id: 'different-id' }, // parent has different alias
      };

      const candidates = [{
        variable: mockVariable,
        modeId: 'child-mode-id',
        referenceVariable: 'target-token',
        collection: mockCollection,
      }];

      const mockTargetVariable = { id: 'target-id', key: 'target-key' };
      global.figma = {
        variables: {
          importVariableByKeyAsync: jest.fn().mockResolvedValue(mockTargetVariable),
          getVariableById: jest.fn().mockReturnValue({ name: 'target-token' }),
          getLocalVariableCollections: jest.fn().mockReturnValue([]),
        },
        ui: { postMessage: jest.fn() },
      } as any;

      const figmaVariables = new Map([['target-token', 'target-key']]);

      await updateVariablesToReference(figmaVariables, candidates);

      // Parent has a different alias — set explicit override (shown as blue, it's a real override)
      expect(mockVariable.setValueForMode).toHaveBeenCalledWith('child-mode-id', { type: 'VARIABLE_ALIAS', id: 'target-id' });
      expect(mockVariable.removeOverrideForMode).not.toHaveBeenCalled();
    });

    it('should skip update when alias is already pointing to the correct variable', async () => {
      mockVariable.valuesByMode = {
        'child-mode-id': { type: 'VARIABLE_ALIAS', id: 'target-id' },
      };

      const candidates = [{
        variable: mockVariable,
        modeId: 'child-mode-id',
        referenceVariable: 'target-token',
        collection: mockCollection,
      }];

      const mockTargetVariable = { id: 'target-id', key: 'target-key' };
      global.figma = {
        variables: {
          importVariableByKeyAsync: jest.fn().mockResolvedValue(mockTargetVariable),
          getVariableById: jest.fn().mockReturnValue({ name: 'target-token' }),
          getLocalVariableCollections: jest.fn().mockReturnValue([]),
        },
        ui: { postMessage: jest.fn() },
      } as any;

      const figmaVariables = new Map([['target-token', 'target-key']]);

      await updateVariablesToReference(figmaVariables, candidates);

      expect(mockVariable.setValueForMode).not.toHaveBeenCalled();
      expect(mockVariable.removeOverrideForMode).not.toHaveBeenCalled();
    });
  });
});
