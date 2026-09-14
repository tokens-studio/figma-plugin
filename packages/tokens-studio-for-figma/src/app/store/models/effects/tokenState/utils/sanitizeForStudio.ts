// Sanitizers applied at the Tokens Studio OAuth push boundary. Direct plugin
// imports keep raw Figma names, but the studio ledger parses `{ref}` strings
// and treats token-set paths structurally, so brace and control characters in
// names would corrupt state that cannot be un-corrupted.
//
// Plugin-only users are unaffected — this only runs inside
// `setTokensFromVariables` when the provider is TOKENS_STUDIO_OAUTH.

// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[{}\x00-\x1F\x7F]/g;

// Strip brace/control characters and trim leading/trailing whitespace.
// The trim is intentional: Figma variable names occasionally carry stray
// whitespace around segment boundaries (e.g. `Foo / Bar`) and we want the
// resulting path to be `Foo/Bar`, not `Foo /Bar `.
function stripUnsafe(part: string): string {
  return part.replace(UNSAFE_CHARS, '').trim();
}

// Sanitize a plain display string (e.g. a theme name). Unlike
// sanitizeTokenSetName, this does NOT split on `/` — a name is not a path.
export function sanitizeDisplayName(name: string): string {
  return stripUnsafe(name);
}

// Normalize a token name: split on `.`, strip unsafe chars from each segment,
// drop empties, rejoin. Returns empty when nothing survives — the caller must
// decide whether to skip the token.
export function sanitizeTokenName(name: string): string {
  return name
    .split('.')
    .map(stripUnsafe)
    .filter((seg) => seg.length > 0)
    .join('.');
}

// Normalize a token-set path: same rules per segment, but preserve the `/`
// separator that studio uses to nest sets.
export function sanitizeTokenSetName(setName: string): string {
  return setName
    .split('/')
    .map(stripUnsafe)
    .filter((seg) => seg.length > 0)
    .join('/');
}

// Rewrite `{ref}` occurrences inside a token value so the referenced name is
// sanitized the same way the target token's name will be. Non-reference values
// pass through unchanged. If a ref sanitizes to empty, it is left as `{}` and
// the caller should treat the containing token as unresolvable.
export function sanitizeReferencesInValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  // Walk the string with a brace-depth counter. Each `{` deepens; each `}`
  // returns. When depth hits zero, that `}` closes the reference we opened.
  // Any embedded braces inside the body are treated as garbage (they came
  // from a Figma name like `foo/{bar}/baz` and the outer ref is the whole
  // corrupted span); sanitizeTokenName strips them.
  let out = '';
  let i = 0;
  while (i < value.length) {
    const open = value.indexOf('{', i);
    if (open === -1) {
      out += value.slice(i);
      break;
    }
    out += value.slice(i, open);

    let depth = 1;
    let j = open + 1;
    while (j < value.length && depth > 0) {
      if (value[j] === '{') depth += 1;
      else if (value[j] === '}') depth -= 1;
      if (depth === 0) break;
      j += 1;
    }
    if (depth !== 0) {
      // Unbalanced — drop the trailing `{...`; without a matching close brace
      // the studio parser would reject the whole value anyway.
      break;
    }
    const body = value.slice(open + 1, j);
    out += `{${sanitizeTokenName(body)}}`;
    i = j + 1;
  }
  return out;
}

// True when a value carries a reference whose sanitized target is empty
// (`{}`) — such a token cannot resolve and should be skipped rather than sent.
export function hasEmptyReference(value: unknown): boolean {
  return typeof value === 'string' && /\{\s*\}/.test(value);
}

// Sanitize a batch of imported tokens for the studio push. Tokens missing a
// parent, or whose name/parent normalize to empty, or whose value contains an
// unresolvable `{}` reference, are dropped with a warning.
export function sanitizeNewTokensForStudio<T extends { name: string; parent?: string | null; value: unknown }>(
  tokens: T[],
): T[] {
  return tokens
    .filter((t): t is T & { parent: string } => t.parent != null)
    .map((t) => ({
      ...t,
      name: sanitizeTokenName(t.name),
      parent: sanitizeTokenSetName(t.parent),
      value: sanitizeReferencesInValue(t.value) as T['value'],
    }))
    .filter((t) => {
      if (!t.name || !t.parent) {
        // eslint-disable-next-line no-console
        console.warn('[sanitizeNewTokensForStudio] Dropping token with empty name/parent:', t);
        return false;
      }
      if (hasEmptyReference(t.value)) {
        // eslint-disable-next-line no-console
        console.warn('[sanitizeNewTokensForStudio] Dropping token whose alias target sanitizes to empty:', t.name);
        return false;
      }
      return true;
    });
}

// Sanitize an imported theme's names and its token-set / variable-reference
// keys. Keys that sanitize to empty are dropped from the maps; the theme's own
// `group` and `name` are cleaned in place so a theme push carries safe strings.
export function sanitizeThemeForStudio<T extends {
  group?: string;
  name?: string;
  selectedTokenSets?: Record<string, unknown>;
  $figmaVariableReferences?: Record<string, unknown>;
}>(theme: T): T {
  const selectedTokenSets: Record<string, unknown> = {};
  Object.entries(theme.selectedTokenSets || {}).forEach(([setName, status]) => {
    const clean = sanitizeTokenSetName(setName);
    if (clean) selectedTokenSets[clean] = status;
  });
  const $figmaVariableReferences: Record<string, unknown> = {};
  Object.entries(theme.$figmaVariableReferences || {}).forEach(([tokenName, key]) => {
    const clean = sanitizeTokenName(tokenName);
    if (clean) $figmaVariableReferences[clean] = key;
  });
  return {
    ...theme,
    // `group` is a token-set-path segment (theme groups nest under it);
    // `name` is a plain display string, so it must NOT be split on `/`.
    group: theme.group ? sanitizeTokenSetName(theme.group) : theme.group,
    name: theme.name ? sanitizeDisplayName(theme.name) : theme.name,
    selectedTokenSets,
    $figmaVariableReferences,
  };
}
