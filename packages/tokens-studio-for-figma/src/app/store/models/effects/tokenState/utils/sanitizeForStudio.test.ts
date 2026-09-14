import {
  hasEmptyReference,
  sanitizeReferencesInValue,
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
