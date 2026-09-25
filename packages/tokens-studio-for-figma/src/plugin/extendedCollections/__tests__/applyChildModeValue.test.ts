import { applyChildModeValue } from '../applyChildModeValue';

const CHILD_MODE = 'child-mode';
const PARENT_MODE = 'parent-mode';

function makeVariable(
  valuesByMode: Record<string, VariableValue>,
  { withClearApi = true }: { withClearApi?: boolean } = {},
) {
  const variable: any = {
    name: 'test-var',
    valuesByMode,
    setValueForMode: jest.fn(),
  };
  if (withClearApi) {
    variable.clearValueForMode = jest.fn();
  }
  return variable as Variable & { clearValueForMode?: jest.Mock; setValueForMode: jest.Mock };
}

describe('applyChildModeValue', () => {
  it('leaves an already-inherited child mode untouched when desired matches parent (no explicit child value)', () => {
    // The common case: the variable only holds the parent mode value, so the
    // child already inherits. No clear needed — and Figma exposes no clear API.
    const variable = makeVariable({ [PARENT_MODE]: 16 });

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16);

    expect(result).toBe('unchanged');
    expect(variable.clearValueForMode).not.toHaveBeenCalled();
    expect(variable.setValueForMode).not.toHaveBeenCalled();
  });

  it('self-heals a stale explicit override matching parent when a clear API is available', () => {
    // Child holds the same value explicitly (blue) — re-export flips it back to inherited
    const variable = makeVariable({ [PARENT_MODE]: 16, [CHILD_MODE]: 16 });

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16);

    expect(result).toBe('cleared');
    expect(variable.clearValueForMode).toHaveBeenCalledWith(CHILD_MODE);
  });

  it('reports unchanged (best effort) for a stale override that already matches when no clear API exists', () => {
    const variable = makeVariable({ [PARENT_MODE]: 16, [CHILD_MODE]: 16 }, { withClearApi: false });

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 16);

    expect(result).toBe('unchanged');
    expect(variable.setValueForMode).not.toHaveBeenCalled();
  });

  it('overwrites a stale WRONG override with the desired value when no clear API exists', () => {
    // Leftover raw value from a previous export that differs from the (now) desired
    // value. We cannot clear to inherit, so at least make it show the right value.
    const desiredAlias = { type: 'VARIABLE_ALIAS', id: 'v-target' } as VariableAlias;
    const variable = makeVariable(
      { [PARENT_MODE]: desiredAlias, [CHILD_MODE]: { r: 0.5, g: 0.5, b: 0.5, a: 1 } },
      { withClearApi: false },
    );

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, desiredAlias);

    expect(result).toBe('set');
    expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, desiredAlias);
  });

  it('sets an explicit override when desired value differs from parent', () => {
    const variable = makeVariable({ [PARENT_MODE]: 16 });

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 24);

    expect(result).toBe('set');
    expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, 24);
    expect(variable.clearValueForMode).not.toHaveBeenCalled();
  });

  it('skips the write when child already holds the desired override', () => {
    const variable = makeVariable({ [PARENT_MODE]: 16, [CHILD_MODE]: 24 });

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 24);

    expect(result).toBe('unchanged');
    expect(variable.setValueForMode).not.toHaveBeenCalled();
    expect(variable.clearValueForMode).not.toHaveBeenCalled();
  });

  it('sets override when parent mode has no value at all', () => {
    const variable = makeVariable({});

    const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, 24);

    expect(result).toBe('set');
    expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, 24);
  });

  describe('aliases', () => {
    const alias = (id: string) => ({ type: 'VARIABLE_ALIAS', id } as VariableAlias);

    it('leaves child inheriting when parent holds the same alias and there is no explicit child value', () => {
      const variable = makeVariable({ [PARENT_MODE]: alias('v1') });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, alias('v1'));

      expect(result).toBe('unchanged');
      expect(variable.clearValueForMode).not.toHaveBeenCalled();
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it('sets override when parent aliases a different variable', () => {
      const variable = makeVariable({ [PARENT_MODE]: alias('v1') });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, alias('v2'));

      expect(result).toBe('set');
      expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, alias('v2'));
    });

    it('sets alias override when parent holds a raw value (type mismatch is never inherit)', () => {
      const variable = makeVariable({
        [PARENT_MODE]: {
          r: 1, g: 1, b: 1, a: 1,
        },
      });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, alias('v1'));

      expect(result).toBe('set');
    });

    it('self-heals a stale explicit alias override matching parent', () => {
      const variable = makeVariable({ [PARENT_MODE]: alias('v1'), [CHILD_MODE]: alias('v1') });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, alias('v1'));

      expect(result).toBe('cleared');
      expect(variable.clearValueForMode).toHaveBeenCalledWith(CHILD_MODE);
    });
  });

  describe('colors', () => {
    it('leaves child inheriting when color approximately matches parent (no explicit child value)', () => {
      const variable = makeVariable({
        [PARENT_MODE]: {
          r: 0.5, g: 0.2, b: 0.1, a: 1,
        },
      });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, {
        r: 0.50000001, g: 0.2, b: 0.1, a: 1,
      });

      expect(result).toBe('unchanged');
      expect(variable.setValueForMode).not.toHaveBeenCalled();
    });

    it('clears an explicit child color override that now matches the parent', () => {
      const variable = makeVariable({
        [PARENT_MODE]: {
          r: 0.5, g: 0.2, b: 0.1, a: 1,
        },
        [CHILD_MODE]: {
          r: 0.5, g: 0.2, b: 0.1, a: 1,
        },
      });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      });

      expect(result).toBe('cleared');
      expect(variable.clearValueForMode).toHaveBeenCalledWith(CHILD_MODE);
    });

    it('sets override for a differing color', () => {
      const variable = makeVariable({
        [PARENT_MODE]: {
          r: 0.5, g: 0.2, b: 0.1, a: 1,
        },
      });
      const newColor = {
        r: 0.9, g: 0.2, b: 0.1, a: 1,
      };

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, newColor);

      expect(result).toBe('set');
      expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, newColor);
    });

    it('does NOT clear when parent holds an alias and desired is the resolved raw color', () => {
      // The classic bug: parent = alias, pass 1 writes resolved color to child.
      // These must not be treated as matching — inherit would resolve through
      // the parent's alias chain in parent context, not the child's.
      const variable = makeVariable({ [PARENT_MODE]: { type: 'VARIABLE_ALIAS', id: 'v1' } as VariableAlias });

      const result = applyChildModeValue(variable, CHILD_MODE, PARENT_MODE, {
        r: 0.5, g: 0.2, b: 0.1, a: 1,
      });

      expect(result).toBe('set');
    });
  });
});
