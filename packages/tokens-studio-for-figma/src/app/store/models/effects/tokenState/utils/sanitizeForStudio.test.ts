import {
  hasEmptyReference,
  sanitizeNewTokensForStudio,
  sanitizeReferencesInValue,
  sanitizeThemeForStudio,
  sanitizeTokenName,
  sanitizeTokenSetName,
} from './sanitizeForStudio';

describe('sanitizeTokenName', () => {
  it('strips brace characters that would corrupt reference syntax', () => {
    expect(sanitizeTokenName('color.{brand}.primary')).toBe('color.brand.primary');
  });

  it('drops empty segments after stripping', () => {
    expect(sanitizeTokenName('color..primary')).toBe('color.primary');
    expect(sanitizeTokenName('.color.primary.')).toBe('color.primary');
  });

  it('returns empty string when nothing survives', () => {
    expect(sanitizeTokenName('{}')).toBe('');
    expect(sanitizeTokenName('...')).toBe('');
  });
});

describe('sanitizeTokenSetName', () => {
  it('keeps `/` as the set separator while cleaning each segment', () => {
    expect(sanitizeTokenSetName('Brand/{Mode}')).toBe('Brand/Mode');
  });

  it('drops empty segments produced by trailing/consecutive slashes', () => {
    expect(sanitizeTokenSetName('Brand//Mode/')).toBe('Brand/Mode');
  });
});

describe('sanitizeReferencesInValue', () => {
  it('rewrites reference targets while preserving surrounding text', () => {
    expect(sanitizeReferencesInValue('rgba({color.{brand}.primary}, 0.5)')).toBe('rgba({color.brand.primary}, 0.5)');
  });

  it('never produces nested braces even when the target contains braces', () => {
    const out = sanitizeReferencesInValue('{foo.{bar}.baz}');
    expect(out).toBe('{foo.bar.baz}');
    expect(typeof out).toBe('string');
    const s = String(out);
    expect((s.match(/\{/g) || []).length).toBe(1);
    expect((s.match(/\}/g) || []).length).toBe(1);
  });

  it('leaves non-string values untouched', () => {
    expect(sanitizeReferencesInValue(42)).toBe(42);
    expect(sanitizeReferencesInValue(null)).toBeNull();
  });

  it('leaves strings without references untouched', () => {
    expect(sanitizeReferencesInValue('#ff0000')).toBe('#ff0000');
  });
});

describe('hasEmptyReference', () => {
  it('flags `{}` as an unresolvable reference', () => {
    expect(hasEmptyReference('{}')).toBe(true);
    expect(hasEmptyReference('rgba({}, 0.5)')).toBe(true);
  });

  it('does not flag well-formed references', () => {
    expect(hasEmptyReference('{color.primary}')).toBe(false);
    expect(hasEmptyReference('#ff0000')).toBe(false);
  });
});

describe('sanitizeNewTokensForStudio', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('cleans name, parent, and reference values on well-formed tokens', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'color.{brand}.primary',
        parent: 'Brand/{Light}',
        value: '{color.{brand}.primary}',
        type: 'color',
      },
    ]);
    expect(out).toEqual([
      {
        name: 'color.brand.primary',
        parent: 'Brand/Light',
        value: '{color.brand.primary}',
        type: 'color',
      },
    ]);
  });

  it('drops tokens whose parent is null (parent gate is preserved)', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'a', parent: null, value: '#000', type: 'color',
      } as any,
      {
        name: 'b', parent: 'Brand/Light', value: '#000', type: 'color',
      },
    ]);
    expect(out.map((t) => t.name)).toEqual(['b']);
  });

  it('drops tokens whose name normalizes to empty', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: '{}', parent: 'Brand/Light', value: '#000', type: 'color',
      },
    ]);
    expect(out).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('drops tokens whose parent normalizes to empty', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'ok', parent: '{}', value: '#000', type: 'color',
      },
    ]);
    expect(out).toEqual([]);
  });

  it('drops tokens whose alias target sanitizes to empty', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'a', parent: 'Brand/Light', value: '{{}}', type: 'color',
      },
    ]);
    expect(out).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('alias target sanitizes to empty'),
      'a',
    );
  });

  it('preserves non-string values (numbers, booleans) unchanged', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'space', parent: 'Brand/Light', value: 16, type: 'number',
      } as any,
      {
        name: 'flag', parent: 'Brand/Light', value: true, type: 'boolean',
      } as any,
    ]);
    expect(out.map((t) => t.value)).toEqual([16, true]);
  });
});

describe('sanitizeThemeForStudio', () => {
  it('cleans group, name, and both key maps', () => {
    const out = sanitizeThemeForStudio({
      group: 'Brand {A}',
      name: '{Light}',
      selectedTokenSets: {
        'Brand/{Light}': 'enabled',
        'Brand/Dark': 'disabled',
      },
      $figmaVariableReferences: {
        'color.{brand}.primary': 'VariableID:1',
        'ok.token': 'VariableID:2',
      },
    });
    expect(out.group).toBe('Brand A');
    expect(out.name).toBe('Light');
    expect(out.selectedTokenSets).toEqual({
      'Brand/Light': 'enabled',
      'Brand/Dark': 'disabled',
    });
    expect(out.$figmaVariableReferences).toEqual({
      'color.brand.primary': 'VariableID:1',
      'ok.token': 'VariableID:2',
    });
  });

  it('drops map keys that sanitize to empty', () => {
    const out = sanitizeThemeForStudio({
      selectedTokenSets: { '{}': 'enabled', 'Brand/Light': 'enabled' },
      $figmaVariableReferences: { '{}': 'X', 'ok.token': 'Y' },
    });
    expect(Object.keys(out.selectedTokenSets!)).toEqual(['Brand/Light']);
    expect(Object.keys(out.$figmaVariableReferences!)).toEqual(['ok.token']);
  });

  it('leaves undefined group/name and empty maps intact', () => {
    const out = sanitizeThemeForStudio({});
    expect(out.group).toBeUndefined();
    expect(out.name).toBeUndefined();
    expect(out.selectedTokenSets).toEqual({});
    expect(out.$figmaVariableReferences).toEqual({});
  });

  it('preserves unrelated fields (spread) on the theme object', () => {
    const out = sanitizeThemeForStudio({
      name: 'Light',
      $figmaModeId: 'mode-1',
      $figmaCollectionId: 'coll-1',
    } as any);
    expect((out as any).$figmaModeId).toBe('mode-1');
    expect((out as any).$figmaCollectionId).toBe('coll-1');
  });
});
