import updateVariablesToReference from '../../updateVariablesToReference';

jest.mock('../../getVariablesWithoutZombies', () => ({
  getVariablesWithoutZombies: jest.fn().mockResolvedValue([]),
}));

const PARENT_MODE = 'parent-mode';
const CHILD_MODE = 'child-composite-mode';

const extendedCollection = {
  id: 'child-coll',
  name: 'Child Collection',
  isExtension: true,
  modes: [{ modeId: CHILD_MODE, name: 'Light', parentModeId: PARENT_MODE }],
} as unknown as VariableCollection;

function makeVariable(name: string, valuesByMode: Record<string, VariableValue>) {
  return {
    name,
    variableCollectionId: 'parent-coll',
    valuesByMode,
    setValueForMode: jest.fn(function set(this: any, modeId: string, value: VariableValue) {
      this.valuesByMode[modeId] = value;
    }),
    clearValueForMode: jest.fn(function clear(this: any, modeId: string) {
      delete this.valuesByMode[modeId];
    }),
  } as unknown as Variable & { setValueForMode: jest.Mock; clearValueForMode: jest.Mock };
}

describe('updateVariablesToReference — extended collection phases', () => {
  beforeEach(() => {
    global.figma = {
      variables: {
        importVariableByKeyAsync: jest.fn((key: string) => Promise.resolve({ id: `id-${key}`, name: `name-${key}` })),
      },
    } as any;
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('processes parent candidates before extended candidates so the child inherits (no race)', async () => {
    // The variable starts with a STALE parent value. The parent candidate in this
    // run will update the parent mode to alias id-ref-key. The child candidate
    // wants the same alias — it must be cleared (inherited), which only happens
    // if the parent write landed first.
    const variable = makeVariable('semantic/primary', {
      [PARENT_MODE]: {
        r: 0, g: 0, b: 0, a: 1,
      }, // stale raw value pre-run
    });

    const figmaVariables = new Map<string, string>([['color.base', 'ref-key']]);

    const candidates = [
      // Extended candidate listed FIRST to prove ordering is enforced by phase, not input order
      {
        variable, modeId: CHILD_MODE, referenceVariable: 'color.base', collection: extendedCollection,
      },
      { variable, modeId: PARENT_MODE, referenceVariable: 'color.base' },
    ];

    await updateVariablesToReference(figmaVariables, candidates as any);

    // Parent mode got the alias
    expect(variable.valuesByMode[PARENT_MODE]).toEqual({ type: 'VARIABLE_ALIAS', id: 'id-ref-key' });
    // Child mode has no explicit value → it already inherits. No override is written,
    // and no clear is needed (Figma exposes no per-mode clear API anyway).
    expect(variable.valuesByMode[CHILD_MODE]).toBeUndefined();
    expect(variable.setValueForMode).not.toHaveBeenCalledWith(CHILD_MODE, expect.anything());
  });

  it('self-heals a stale explicit child override that matches the parent alias', async () => {
    const alias = { type: 'VARIABLE_ALIAS', id: 'id-ref-key' } as VariableAlias;
    const variable = makeVariable('semantic/primary', {
      [PARENT_MODE]: alias,
      [CHILD_MODE]: { ...alias }, // stale explicit override from a previous export
    });

    const figmaVariables = new Map<string, string>([['color.base', 'ref-key']]);

    await updateVariablesToReference(figmaVariables, [
      {
        variable, modeId: CHILD_MODE, referenceVariable: 'color.base', collection: extendedCollection,
      },
    ] as any);

    expect(variable.clearValueForMode).toHaveBeenCalledWith(CHILD_MODE);
    expect(variable.setValueForMode).not.toHaveBeenCalled();
  });

  it('sets an explicit child override when the child aliases a different variable than the parent', async () => {
    const variable = makeVariable('semantic/primary', {
      [PARENT_MODE]: { type: 'VARIABLE_ALIAS', id: 'id-other-key' } as VariableAlias,
    });

    const figmaVariables = new Map<string, string>([['color.brand', 'ref-key']]);

    await updateVariablesToReference(figmaVariables, [
      {
        variable, modeId: CHILD_MODE, referenceVariable: 'color.brand', collection: extendedCollection,
      },
    ] as any);

    expect(variable.setValueForMode).toHaveBeenCalledWith(CHILD_MODE, { type: 'VARIABLE_ALIAS', id: 'id-ref-key' });
    expect(variable.clearValueForMode).not.toHaveBeenCalled();
  });

  it('leaves regular collection candidates on the plain set path', async () => {
    const variable = makeVariable('color/primary', {});
    const figmaVariables = new Map<string, string>([['color.base', 'ref-key']]);

    await updateVariablesToReference(figmaVariables, [
      { variable, modeId: 'plain-mode', referenceVariable: 'color.base' },
    ] as any);

    expect(variable.setValueForMode).toHaveBeenCalledWith('plain-mode', { type: 'VARIABLE_ALIAS', id: 'id-ref-key' });
    expect(variable.clearValueForMode).not.toHaveBeenCalled();
  });
});
