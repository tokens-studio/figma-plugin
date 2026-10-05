// Sanitizers applied at the Tokens Studio OAuth push boundary. Direct plugin
// imports keep raw Figma names, but the studio ledger parses `{ref}` strings
// and treats token-set paths structurally, so brace and control characters in
// names would corrupt state that cannot be un-corrupted.
//
// Because local state keeps the raw names, every lookup that crosses this
// boundary must go through `lookupBySanitized` — comparing a sanitized key
// against a raw-keyed map silently misses and creates duplicates server-side.

// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[{}\x00-\x1F\x7F]/g;

// Characters that never appear in a token path but are common in JSON and CSS
// payloads. A brace span carrying any of them is literal text, not a reference.
const NON_REFERENCE_CHARS = /["':;()]/;

// Strip brace/control characters and trim leading/trailing whitespace.
// The trim is intentional: Figma variable names occasionally carry stray
// whitespace around segment boundaries (e.g. `Foo / Bar`) and we want the
// resulting path to be `Foo/Bar`, not `Foo /Bar `.
function stripUnsafe(part: string): string {
  return part.replace(UNSAFE_CHARS, '').trim();
}

export function sanitizeDisplayName(name: string): string {
  return stripUnsafe(name);
}

// Returns empty when nothing survives — the caller must decide whether to skip.
export function sanitizeTokenName(name: string): string {
  return name
    .split('.')
    .map(stripUnsafe)
    .filter((seg) => seg.length > 0)
    .join('.');
}

// Same rules per segment, but preserve the `/` separator that studio uses to
// nest sets.
export function sanitizeTokenSetName(setName: string): string {
  return setName
    .split('/')
    .map(stripUnsafe)
    .filter((seg) => seg.length > 0)
    .join('/');
}

// Resolve a sanitized key against a map that may still be keyed by raw names,
// returning the key as it actually appears. Callers writing back into the map
// must use this key, or they add a second entry alongside the raw one.
export function resolveSanitizedKey(
  map: Record<string, unknown> | undefined | null,
  sanitizedKey: string,
  sanitize: (key: string) => string,
): string | undefined {
  if (!map) return undefined;
  if (Object.prototype.hasOwnProperty.call(map, sanitizedKey)) return sanitizedKey;
  return Object.keys(map).find((key) => sanitize(key) === sanitizedKey);
}

// Lookup counterpart of `resolveSanitizedKey`, for callers that only read.
export function lookupBySanitized<V>(
  map: Record<string, V> | undefined | null,
  sanitizedKey: string,
  sanitize: (key: string) => string,
): V | undefined {
  const key = resolveSanitizedKey(map as Record<string, unknown>, sanitizedKey, sanitize);
  return key === undefined ? undefined : map![key];
}

type ValueSanitizeResult = { value: unknown; hasUnresolvableReference: boolean };

function isReferenceBody(body: string): boolean {
  return body.length > 0 && !NON_REFERENCE_CHARS.test(body);
}

function sanitizeStringValue(value: string): ValueSanitizeResult {
  let out = '';
  let i = 0;
  let hasUnresolvableReference = false;

  while (i < value.length) {
    const open = value.indexOf('{', i);
    if (open === -1) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, open);

    // Walk with a brace-depth counter so an embedded `{bar}` inside a corrupted
    // Figma name resolves to the outer span rather than closing it early.
    let depth = 1;
    let j = open + 1;
    while (j < value.length && depth > 0) {
      if (value[j] === '{') depth += 1;
      else if (value[j] === '}') depth -= 1;
      if (depth === 0) break;
      j += 1;
    }
    if (depth !== 0) {
      // No closing brace, so this is not a reference and there is nothing to
      // rewrite. Keep the remainder verbatim rather than discarding user data.
      out += value.slice(open);
      break;
    }

    const body = value.slice(open + 1, j);
    if (isReferenceBody(body)) {
      const clean = sanitizeTokenName(body);
      if (!clean) hasUnresolvableReference = true;
      out += `{${clean}}`;
    } else {
      out += value.slice(open, j + 1);
    }
    i = j + 1;
  }

  return { value: out, hasUnresolvableReference };
}

// Composite tokens (typography, boxShadow, border, composition) hold their
// references inside objects and arrays, so recursion is required — returning
// non-strings untouched would let exactly those braces through unsanitized.
function sanitizeValue(value: unknown): ValueSanitizeResult {
  if (typeof value === 'string') return sanitizeStringValue(value);

  if (Array.isArray(value)) {
    let hasUnresolvableReference = false;
    const out = value.map((entry) => {
      const result = sanitizeValue(entry);
      if (result.hasUnresolvableReference) hasUnresolvableReference = true;
      return result.value;
    });
    return { value: out, hasUnresolvableReference };
  }

  if (value !== null && typeof value === 'object') {
    let hasUnresolvableReference = false;
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      const result = sanitizeValue(entry);
      if (result.hasUnresolvableReference) hasUnresolvableReference = true;
      out[key] = result.value;
    });
    return { value: out, hasUnresolvableReference };
  }

  return { value, hasUnresolvableReference: false };
}

export function sanitizeReferencesInValue(value: unknown): unknown {
  return sanitizeValue(value).value;
}

// Tokens missing a parent, or whose name/parent normalize to empty, or whose
// value carries a reference that sanitizes to nothing, are dropped with a warning.
export function sanitizeNewTokensForStudio<T extends { name: string; parent?: string | null; value: unknown }>(
  tokens: T[],
): T[] {
  const sanitized: T[] = [];

  tokens.forEach((token) => {
    if (token.parent == null) return;

    const name = sanitizeTokenName(token.name);
    const parent = sanitizeTokenSetName(token.parent);
    if (!name || !parent) {
      // eslint-disable-next-line no-console
      console.warn('[sanitizeNewTokensForStudio] Dropping token with empty name/parent:', token);
      return;
    }

    const { value, hasUnresolvableReference } = sanitizeValue(token.value);
    if (hasUnresolvableReference) {
      // eslint-disable-next-line no-console
      console.warn('[sanitizeNewTokensForStudio] Dropping token whose alias target sanitizes to empty:', name);
      return;
    }

    sanitized.push({
      ...token, name, parent, value: value as T['value'],
    });
  });

  return sanitized;
}

function sanitizeKeyedMap(
  map: Record<string, unknown> | undefined,
  sanitize: (key: string) => string,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  Object.entries(map || {}).forEach(([key, entry]) => {
    const clean = sanitize(key);
    if (clean) out[clean] = entry;
  });
  return out;
}

export function sanitizeThemeForStudio<T extends {
  group?: string;
  name?: string;
  selectedTokenSets?: Record<string, unknown>;
  $figmaVariableReferences?: Record<string, unknown>;
  $figmaStyleReferences?: Record<string, unknown>;
}>(theme: T): T {
  return {
    ...theme,
    // Both `group` and `name` are display strings — a `/` in either is part of
    // the name, not a path separator.
    group: theme.group ? sanitizeDisplayName(theme.group) : theme.group,
    name: theme.name ? sanitizeDisplayName(theme.name) : theme.name,
    selectedTokenSets: sanitizeKeyedMap(theme.selectedTokenSets, sanitizeTokenSetName),
    $figmaVariableReferences: sanitizeKeyedMap(theme.$figmaVariableReferences, sanitizeTokenName),
    $figmaStyleReferences: sanitizeKeyedMap(theme.$figmaStyleReferences, sanitizeTokenName),
  };
}
