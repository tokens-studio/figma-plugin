import {
  lookupBySanitized,
  resolveSanitizedKey,
  sanitizeDisplayName,
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

  it('leaves scalar values untouched', () => {
    expect(sanitizeReferencesInValue(42)).toBe(42);
    expect(sanitizeReferencesInValue(null)).toBeNull();
  });

  it('leaves strings without references untouched', () => {
    expect(sanitizeReferencesInValue('#ff0000')).toBe('#ff0000');
  });

  it('keeps an unbalanced opening brace verbatim rather than discarding data', () => {
    expect(sanitizeReferencesInValue('prefix {color.primary')).toBe('prefix {color.primary');
  });

  it('rewrites balanced refs and preserves a trailing unbalanced opener', () => {
    expect(sanitizeReferencesInValue('a {b} c {d')).toBe('a {b} c {d');
    expect(sanitizeReferencesInValue('a {x.{y}} c {d')).toBe('a {x.y} c {d');
  });

  it('leaves brace spans that are not references alone', () => {
    // JSON payloads and code snippets must survive untouched — stripping their
    // interior braces would turn valid content into invalid content.
    expect(sanitizeReferencesInValue('{"a":{"b":1}}')).toBe('{"a":{"b":1}}');
    expect(sanitizeReferencesInValue('function() {}')).toBe('function() {}');
  });

  it('recurses into object values so composite tokens are sanitized', () => {
    expect(sanitizeReferencesInValue({
      fontFamily: '{fonts.{brand}}',
      fontSize: '16',
    })).toEqual({
      fontFamily: '{fonts.brand}',
      fontSize: '16',
    });
  });

  it('recurses into array values (e.g. boxShadow layers)', () => {
    expect(sanitizeReferencesInValue([
      { color: '{color.{brand}.shadow}', blur: 4 },
      { color: '#000', blur: 2 },
    ])).toEqual([
      { color: '{color.brand.shadow}', blur: 4 },
      { color: '#000', blur: 2 },
    ]);
  });
});

describe('resolveSanitizedKey / lookupBySanitized', () => {
  const sets = { 'Brand / Light': { id: 'set-1' }, 'Brand/Dark': { id: 'set-2' } };

  it('returns the raw key when only a sanitized form is known', () => {
    expect(resolveSanitizedKey(sets, 'Brand/Light', sanitizeTokenSetName)).toBe('Brand / Light');
    expect(lookupBySanitized(sets, 'Brand/Light', sanitizeTokenSetName)).toEqual({ id: 'set-1' });
  });

  it('prefers an exact key match', () => {
    expect(resolveSanitizedKey(sets, 'Brand/Dark', sanitizeTokenSetName)).toBe('Brand/Dark');
  });

  it('returns undefined when nothing matches or the map is absent', () => {
    expect(resolveSanitizedKey(sets, 'Nope', sanitizeTokenSetName)).toBeUndefined();
    expect(lookupBySanitized(undefined, 'Brand/Light', sanitizeTokenSetName)).toBeUndefined();
  });
});

describe('sanitizeDisplayName', () => {
  it('strips brace and control characters without splitting on separators', () => {
    expect(sanitizeDisplayName('{Light}')).toBe('Light');
    expect(sanitizeDisplayName('Dark / Compact')).toBe('Dark / Compact');
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

  it('preserves scalar values (numbers, booleans) unchanged', () => {
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

  it('sanitizes references nested inside composite values', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'type.heading',
        parent: 'Brand/Light',
        value: { fontFamily: '{fonts.{brand}}', fontSize: '{size.{lg}}' },
        type: 'typography',
      } as any,
    ]);
    expect(out[0].value).toEqual({ fontFamily: '{fonts.brand}', fontSize: '{size.lg}' });
  });

  it('drops a composite token whose nested alias target sanitizes to empty', () => {
    const out = sanitizeNewTokensForStudio([
      {
        name: 'type.heading',
        parent: 'Brand/Light',
        value: { fontFamily: '{{}}', fontSize: '16' },
        type: 'typography',
      } as any,
    ]);
    expect(out).toEqual([]);
  });

  it('keeps string values that merely contain empty braces', () => {
    // `{}` here is literal text, not a reference that failed to resolve.
    const out = sanitizeNewTokensForStudio([
      {
        name: 'snippet', parent: 'Brand/Light', value: 'function() {}', type: 'other',
      } as any,
    ]);
    expect(out.map((t) => t.value)).toEqual(['function() {}']);
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
    expect(out.$figmaStyleReferences).toEqual({});
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

  // `name` and `group` are both plain display strings — a `/` in either is part
  // of the name, not a path separator the way it is for a token-set path.
  it('preserves `/` in theme name and group (not treated as paths)', () => {
    const out = sanitizeThemeForStudio({ name: 'Dark / Compact', group: 'Brand / Mode' });
    expect(out.name).toBe('Dark / Compact');
    expect(out.group).toBe('Brand / Mode');
  });

  it('still strips brace chars from theme name and group', () => {
    const out = sanitizeThemeForStudio({ name: '{Light}', group: '{Brand}' });
    expect(out.name).toBe('Light');
    expect(out.group).toBe('Brand');
  });

  it('sanitizes $figmaStyleReferences keys alongside variable references', () => {
    const out = sanitizeThemeForStudio({
      $figmaStyleReferences: { 'color.{brand}.primary': 'S:1', '{}': 'S:2' },
    });
    expect(out.$figmaStyleReferences).toEqual({ 'color.brand.primary': 'S:1' });
  });
});
