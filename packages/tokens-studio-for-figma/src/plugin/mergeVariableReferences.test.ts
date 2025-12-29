import { mergeVariableReferencesWithLocalVariables } from './mergeVariableReferences';

describe('mergeVariableReferencesWithLocalVariables', () => {
  beforeEach(() => {
    // Mock figma.variables.getLocalVariablesAsync
    figma.variables.getLocalVariablesAsync = jest.fn().mockResolvedValue([
      { name: 'fg/local', key: 'V:123', variableCollectionId: 'coll1' },
      { name: 'fg/muted', key: 'V:999', variableCollectionId: 'coll1' },
    ]);
    figma.variables.getLocalVariableCollectionsAsync = jest.fn().mockResolvedValue([
      { id: 'coll1' },
    ]);
  });

  it('should merge variable references with local variables', async () => {
    const themes = [
      {
        $figmaVariableReferences: {
          'fg.default': 'V:789',
          'fg.muted': 'V:012',
        },
      },
      {
        $figmaVariableReferences: {
          'bg.default': 'V:345',
          'bg.muted': 'V:678',
        },
      },
    ];

    const variables = await mergeVariableReferencesWithLocalVariables(themes);

    expect(variables.size).toBe(5);
    expect(variables.get('fg.default')).toEqual('V:789');
    expect(variables.get('fg.muted')).toBe('V:012');
    expect(variables.get('bg.default')).toBe('V:345');
    expect(variables.get('bg.muted')).toBe('V:678');
    expect(variables.get('fg.local')).toBe('V:123');
  });

  it('should handle themes without variable references and merges them with local variable ids', async () => {
    const themes = [
      {
        name: 'Theme 1',
      },
      {
        name: 'Theme 2',
      },
    ];

    const variables = await mergeVariableReferencesWithLocalVariables(themes);

    expect(variables.size).toBe(2);
    expect(variables.get('fg.local')).toBe('V:123');
    expect(variables.get('fg.muted')).toBe('V:999');
  });

  it('should not overwrite a variable reference if it exists already', async () => {
    const themes = [
      {
        $figmaVariableReferences: {
          'fg.default': 'V:012',
        },
      },
      {
        $figmaVariableReferences: {
          'fg.default': 'V:345',
        },
      },
    ];

    const variables = await mergeVariableReferencesWithLocalVariables(themes);

    expect(variables.size).toBe(3);
    expect(variables.get('fg.default')).toBe('V:012');
  });

  it('should give preference to a variable reference over local one', async () => {
    const themes = [
      {
        $figmaVariableReferences: {
          'fg.muted': 'V:012',
        },
      },
    ];

    const variables = await mergeVariableReferencesWithLocalVariables(themes);

    expect(variables.size).toBe(2);
    expect(variables.get('fg.muted')).toBe('V:012');
  });

  it('should include all variable references even if not in validatedVariableCache', async () => {
    const themes = [
      {
        $figmaVariableReferences: {
          'colors.primary': 'VariableID:123:456',
          'colors.secondary': 'remote-library-key-abc123',
        },
      },
    ];

    // Create a cache that only has one of the two variables
    const validatedCache = new Map<string, Variable>();
    validatedCache.set('VariableID:123:456', { id: 'VariableID:123:456', name: 'colors/primary' } as any);

    const variables = await mergeVariableReferencesWithLocalVariables(themes, [], validatedCache);

    // Both variables should be included, regardless of validation status
    expect(variables.size).toBe(4); // 2 from themes + 2 local
    expect(variables.get('colors.primary')).toBe('VariableID:123:456');
    expect(variables.get('colors.secondary')).toBe('remote-library-key-abc123');
  });
});
