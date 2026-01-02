import { ThemeObjectsList } from '@/types';
import { resolveThemeDependencies, getParentTheme } from './resolveThemeDependencies';

describe('resolveThemeDependencies', () => {
  it('returns themes unchanged when no dependencies exist', () => {
    const themes: ThemeObjectsList = [
      { id: 'a', name: 'A', selectedTokenSets: {} },
      { id: 'b', name: 'B', selectedTokenSets: {} },
    ];
    const sorted = resolveThemeDependencies(themes);
    expect(sorted).toHaveLength(2);
  });

  it('sorts parent theme before child theme', () => {
    const themes: ThemeObjectsList = [
      { id: 'child', name: 'Child', $extendsThemeId: 'parent', selectedTokenSets: {} },
      { id: 'parent', name: 'Parent', selectedTokenSets: {} },
    ];
    const sorted = resolveThemeDependencies(themes);
    expect(sorted[0].id).toBe('parent');
    expect(sorted[1].id).toBe('child');
  });

  it('handles multi-level inheritance chain', () => {
    const themes: ThemeObjectsList = [
      { id: 'grandchild', name: 'Grandchild', $extendsThemeId: 'child', selectedTokenSets: {} },
      { id: 'child', name: 'Child', $extendsThemeId: 'parent', selectedTokenSets: {} },
      { id: 'parent', name: 'Parent', selectedTokenSets: {} },
    ];
    const sorted = resolveThemeDependencies(themes);
    expect(sorted[0].id).toBe('parent');
    expect(sorted[1].id).toBe('child');
    expect(sorted[2].id).toBe('grandchild');
  });

  it('handles multiple independent inheritance chains', () => {
    const themes: ThemeObjectsList = [
      { id: 'brand-a', name: 'Brand A', $extendsThemeId: 'base', selectedTokenSets: {} },
      { id: 'brand-b', name: 'Brand B', $extendsThemeId: 'base', selectedTokenSets: {} },
      { id: 'base', name: 'Base', selectedTokenSets: {} },
    ];
    const sorted = resolveThemeDependencies(themes);
    expect(sorted[0].id).toBe('base');
    // Both children should come after base
    expect(['brand-a', 'brand-b']).toContain(sorted[1].id);
    expect(['brand-a', 'brand-b']).toContain(sorted[2].id);
  });

  it('throws error on circular dependency', () => {
    const themes: ThemeObjectsList = [
      { id: 'a', name: 'A', $extendsThemeId: 'b', selectedTokenSets: {} },
      { id: 'b', name: 'B', $extendsThemeId: 'a', selectedTokenSets: {} },
    ];
    expect(() => resolveThemeDependencies(themes)).toThrow(/circular/i);
  });

  it('throws error on self-referencing theme', () => {
    const themes: ThemeObjectsList = [
      { id: 'a', name: 'A', $extendsThemeId: 'a', selectedTokenSets: {} },
    ];
    expect(() => resolveThemeDependencies(themes)).toThrow(/circular/i);
  });

  it('handles theme with missing parent gracefully', () => {
    // When parent is not in the array, treat as independent theme
    const themes: ThemeObjectsList = [
      { id: 'child', name: 'Child', $extendsThemeId: 'missing-parent', selectedTokenSets: {} },
    ];
    const sorted = resolveThemeDependencies(themes);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('child');
  });

  it('preserves theme properties in sorted output', () => {
    const themes: ThemeObjectsList = [
      {
        id: 'child',
        name: 'Child',
        group: 'Brand A',
        $extendsThemeId: 'parent',
        $figmaCollectionId: 'col:child',
        selectedTokenSets: { set1: 'enabled' as const },
      },
      {
        id: 'parent',
        name: 'Parent',
        group: 'Base',
        $figmaCollectionId: 'col:parent',
        selectedTokenSets: { set1: 'enabled' as const },
      },
    ];
    const sorted = resolveThemeDependencies(themes);
    expect(sorted[0]).toEqual(themes[1]);
    expect(sorted[1]).toEqual(themes[0]);
  });
});

describe('getParentTheme', () => {
  const allThemes: ThemeObjectsList = [
    { id: 'parent', name: 'Parent', selectedTokenSets: {} },
    { id: 'child', name: 'Child', $extendsThemeId: 'parent', selectedTokenSets: {} },
    { id: 'standalone', name: 'Standalone', selectedTokenSets: {} },
  ];

  it('returns parent theme when $extendsThemeId is set', () => {
    const child = allThemes[1];
    const parent = getParentTheme(child, allThemes);
    expect(parent).toBeDefined();
    expect(parent?.id).toBe('parent');
  });

  it('returns undefined when theme has no $extendsThemeId', () => {
    const standalone = allThemes[2];
    const parent = getParentTheme(standalone, allThemes);
    expect(parent).toBeUndefined();
  });

  it('returns undefined when parent theme is not in array', () => {
    const orphan = { id: 'orphan', name: 'Orphan', $extendsThemeId: 'missing', selectedTokenSets: {} };
    const parent = getParentTheme(orphan, allThemes);
    expect(parent).toBeUndefined();
  });
});
