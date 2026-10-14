import { applyChildModeValue } from '../applyChildModeValue';

const CHILD_MODE = 'child-mode';
const OTHER_CHILD_MODE = 'other-child-mode';
const PARENT_MODE = 'parent-mode';

function makeVariable(valuesByMode: Record<string, VariableValue>) {
  return {
    id: 'var-1',
    name: 'test-var',
    valuesByMode,
    setValueForMode: jest.fn(),
    removeOverrideForMode: jest.fn(),
  } as unknown as Variable & { setValueForMode: jest.Mock; removeOverrideForMode: jest.Mock };
}

// Figma keeps extended-collection overrides on the collection, not in valuesByMode
function makeCollection(overrides: Record<string, VariableValue> = {}) {
  return {
    id: 'child-coll',
    isExtension: true,
    parentVariableCollectionId: 'parent-coll',
    variableOverrides: { 'var-1': overrides },
  } as unknown as VariableCollection;
}

const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id } as VariableAlias);

describe('applyChildModeValue', () => {
  describe('desired value equals the parent', () => {
    it('does nothing when the child has no override', () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, makeCollection(), 'clear');

      expect(result).toBe('unchanged');
      expect(variable.removeOverrideForMode).not.toHaveBeenCalled();
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it("'clear' removes only this mode's override", () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });
      const collection = makeCollection({ [CHILD_MODE]: 99, [OTHER_CHILD_MODE]: 42 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, collection, 'clear');

      expect(result).toBe('cleared');
      expect(variable.removeOverrideForMode).toHaveBeenCalledTimes(1);
      expect(variable.removeOverrideForMode).toHaveBeenCalledWith(CHILD_MODE);
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it("'clear' self-heals a stale alias override that matches the parent alias", () => {
      const variable = makeVariable({ [PARENT_MODE]: alias('v1') });

      const result = applyChildModeValue(
        variable,
        CHILD_MODE,
        PARENT_MODE,
        alias('v1'),
        makeCollection({ [CHILD_MODE]: alias('v1') }),
        'clear',
      );

      expect(result).toBe('cleared');
      expect(variable.removeOverrideForMode).toHaveBeenCalledWith(CHILD_MODE);
    });

    it("'overwrite' never clears: it writes a differing override explicitly", () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, makeCollection({ [CHILD_MODE]: 99 }), 'overwrite');

      expect(result).toBe('set');
      expect(variable.removeOverrideForMode).not.toHaveBeenCalled();
      expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, 16);
    });

    it("'overwrite' leaves an override that already holds the desired value", () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, makeCollection({ [CHILD_MODE]: 16 }), 'overwrite');

      expect(result).toBe('unchanged');
      expect(variable.removeOverrideForMode).not.toHaveBeenCalled();
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it("'keep' preserves an existing override (e.g. one coming from a brand set)", () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, makeCollection({ [CHILD_MODE]: 99 }), 'keep');

      expect(result).toBe('unchanged');
      expect(variable.removeOverrideForMode).not.toHaveBeenCalled();
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it('defaults to overwrite', () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, makeCollection({ [CHILD_MODE]: 99 }));

      expect(result).toBe('set');
      expect(variable.removeOverrideForMode).not.toHaveBeenCalled();
    });

    it('treats approximately equal colors as equal to the parent', () => {
      const variable = makeVariable({
        [PARENT_MODE]: {
          r: 0.5, g: 0.2, b: 0.1, a: 1,
        },
      });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, {
        r: 0.50000001, g: 0.2, b: 0.1, a: 1,
      }, makeCollection(), 'clear');

      expect(result).toBe('unchanged');
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });
  });

  describe('desired value differs from the parent', () => {
    it('sets an explicit override', () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 24, makeCollection(), 'clear');

      expect(result).toBe('set');
      expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, 24);
      expect(variable.removeOverrideForMode).not.toHaveBeenCalled();
    });

    it('skips the write when the override already holds the desired value', () => {
      const variable = makeVariable({ [PARENT_MODE]: 16 });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 24, makeCollection({ [CHILD_MODE]: 24 }), 'clear');

      expect(result).toBe('unchanged');
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it('sets an override when the parent mode has no value', () => {
      const variable = makeVariable({});

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 24, makeCollection());

      expect(result).toBe('set');
      expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, 24);
    });

    it('sets an override when the parent aliases a different variable', () => {
      const variable = makeVariable({ [PARENT_MODE]: alias('v1') });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, alias('v2'), makeCollection(), 'clear');

      expect(result).toBe('set');
      expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, alias('v2'));
    });

    it('never treats a raw color as matching a parent alias', () => {
      // Inheriting would resolve the alias in the parent's context, not the child's
      const variable = makeVariable({ [PARENT_MODE]: alias('v1') });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      }, makeCollection(), 'clear');

      expect(result).toBe('set');
    });
  });

  it('falls back to valuesByMode when the collection exposes no overrides', () => {
    const variable = makeVariable({ [PARENT_MODE]: 16, [CHILD_MODE]: 99 });

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16, null, 'clear');

    expect(result).toBe('cleared');
    expect(variable.removeOverrideForMode).toHaveBeenCalledWith(CHILD_MODE);
  });
});
