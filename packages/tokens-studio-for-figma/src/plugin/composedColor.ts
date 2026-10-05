import { convertToFigmaColor } from './figmaTransforms/colors';

// Mirrors Studio's Figma exporter (tokenscript/go/pkg/plugins/figma/composed_color.go) so
// the plugin and Studio link the same tokens.

export type AlphaMode = 'replace' | 'multiply' | 'screen' | 'source';

// An alpha expression whose color and/or opacity can stay linked in Figma, e.g.
// combine_alpha({color}, {opacity}, "source"), set_alpha({color}, 0.4) or the legacy
// rgba({color}, 0.5). Stored in Figma as a VariableComposedColor.
export type ComposedColorReference = {
  mode: AlphaMode;
  // The raw color argument, used to walk nested replace expressions to an opaque root
  colorExpression: string;
  colorReference?: string;
  colorHexLiteral?: string;
  opacityReference?: string;
  // 0-1
  opacityLiteral?: number;
};

type AlphaExpression = { base: string; alpha: string; mode: AlphaMode };

const FUNCTION_CALL_REGEX = /^\s*([A-Za-z_][\w]*)\((.*)\)\s*$/s;
const WITH_ALPHA_REGEX = /^\s*(\{[^{}]+\})\.with_alpha\((.*)\)\s*$/s;
const SINGLE_REFERENCE_REGEX = /^(?:\{([^{}]+)\}|\$([^\s,{}()]+))$/;
const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const STRING_REGEX = /^(["'])([^"']*)\1$/;
const NUMBER_REGEX = /^[+-]?\d+(?:\.\d+)?$/;
const PERCENT_REGEX = /^([+-]?\d+(?:\.\d+)?)%$/;
const ALPHA_MODES: AlphaMode[] = ['replace', 'multiply', 'screen', 'source'];

function getReferenceName(arg: string): string | undefined {
  const match = arg.trim().match(SINGLE_REFERENCE_REGEX);
  if (!match) return undefined;
  return match[1] ?? match[2];
}

// Splits on commas outside of parentheses, braces and quotes, so nested calls stay one argument.
function splitTopLevelArgs(input: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let current = '';
  Array.from(input).forEach((ch) => {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(' || ch === '{') {
      depth += 1;
    } else if ((ch === ')' || ch === '}') && depth > 0) {
      depth -= 1;
    } else if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
      return;
    }
    current += ch;
  });
  args.push(current.trim());
  return args;
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

// Literal alpha as Studio reads it: "40%" → 0.4, numbers clamp to 0-1 (so "40" → 1)
function alphaLiteral(arg: string): number | undefined {
  const trimmed = arg.trim();
  const percent = trimmed.match(PERCENT_REGEX);
  if (percent) return clamp01(Number(percent[1]) / 100);
  if (NUMBER_REGEX.test(trimmed)) return clamp01(Number(trimmed));
  return undefined;
}

// A referenced opacity token's resolved value, read the same way
function normalizeAlpha(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? clamp01(value) : null;
  if (typeof value !== 'string') return null;
  const result = alphaLiteral(value);
  return result === undefined ? null : result;
}

function isComposedBase(arg: string): boolean {
  if (getReferenceName(arg) || HEX_COLOR_REGEX.test(arg.trim())) return true;
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return matchAlphaExpression(arg)?.mode === 'replace';
}

function isComposedAlpha(arg: string): boolean {
  return !!getReferenceName(arg) || alphaLiteral(arg) !== undefined;
}

function matchAlphaExpression(expr: string): AlphaExpression | null {
  let result: AlphaExpression | null = null;
  const withAlpha = expr.match(WITH_ALPHA_REGEX);
  if (withAlpha) {
    result = { base: withAlpha[1], alpha: withAlpha[2].trim(), mode: 'replace' };
  } else {
    const call = expr.match(FUNCTION_CALL_REGEX);
    if (!call) return null;
    const [, fn, argString] = call;
    const args = splitTopLevelArgs(argString);
    if ((fn === 'set_alpha' || fn === 'ts_alpha_srgb') && args.length === 2) {
      result = { base: args[0], alpha: args[1], mode: 'replace' };
    } else if (fn === 'combine_alpha' && args.length === 3) {
      const mode = args[2].match(STRING_REGEX)?.[2] as AlphaMode | undefined;
      if (!mode || !ALPHA_MODES.includes(mode)) return null;
      result = { base: args[0], alpha: args[1], mode };
    } else if ((fn === 'rgba' || fn === 'rgb') && args.length === 2) {
      // Legacy Tokens Studio syntax: replaces the alpha
      result = { base: args[0], alpha: args[1], mode: 'replace' };
    } else if ((fn === 'rgba' || fn === 'rgb') && args.length === 4 && args.slice(0, 3).every((c) => NUMBER_REGEX.test(c))) {
      // rgba(255, 0, 0, {opacity}): the color side is a literal; written from the resolved value
      return getReferenceName(args[3]) ? { base: '', alpha: args[3], mode: 'replace' } : null;
    }
  }
  if (!result || !isComposedBase(result.base) || !isComposedAlpha(result.alpha)) return null;
  return result;
}

export function parseComposedColorReference(rawValue: unknown): ComposedColorReference | null {
  if (typeof rawValue !== 'string') return null;
  const matched = matchAlphaExpression(rawValue);
  // Only expressions with a reference somewhere can link anything
  if (!matched || !/[{$]/.test(`${matched.base} ${matched.alpha}`)) return null;

  const colorReference = getReferenceName(matched.base);
  const opacityReference = getReferenceName(matched.alpha);
  return {
    mode: matched.mode,
    colorExpression: matched.base,
    ...(colorReference ? { colorReference } : {}),
    ...(HEX_COLOR_REGEX.test(matched.base.trim()) ? { colorHexLiteral: matched.base.trim() } : {}),
    ...(opacityReference ? { opacityReference } : { opacityLiteral: alphaLiteral(matched.alpha) }),
  };
}

export function isVariableComposedColor(value: unknown): value is VariableComposedColor {
  return typeof value === 'object'
    && value !== null
    && 'color' in value
    && 'opacity' in value;
}

// Every token the expression references, including inside nested alpha expressions
export function getComposedColorReferenceNames(composed: ComposedColorReference): string[] {
  const names = Array.from(composed.colorExpression.matchAll(/\{([^{}]+)\}|\$([^\s,{}()]+)/g), (m) => m[1] ?? m[2]);
  if (composed.opacityReference) names.push(composed.opacityReference);
  return Array.from(new Set(names));
}

function toAlias(variable: Variable): VariableAlias {
  return { type: 'VARIABLE_ALIAS', id: variable.id };
}

type ParsedColor = { r: number; g: number; b: number; a: number };

// Accepts a token value ("#3366ff80", "rgba(...)") or a Figma RGB(A) object
function toParsedColor(value: unknown): ParsedColor | null {
  if (typeof value === 'string') {
    try {
      const { color, opacity } = convertToFigmaColor(value);
      return { ...color, a: opacity };
    } catch (e) {
      return null;
    }
  }
  if (typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value) {
    const { r, g, b } = value as RGB;
    const a = (value as RGBA).a ?? 1;
    return {
      r, g, b, a,
    };
  }
  return null;
}

// What the plugin knows about a referenced token: its resolved value, raw value and type
export type ComposedColorTokenInfo = { value: unknown; rawValue?: unknown; type?: string };
export type ComposedColorLookup = (name: string) => ComposedColorTokenInfo | undefined;
export type ComposedColorCandidate = { reference: string; value: unknown };

const OPAQUE_EPSILON = 1e-6;

/**
 * Follows RGB-preserving alpha overwrites (replace mode) and pure references back to
 * an opaque color, e.g. set_alpha({color.base}, 0.5) → color.base. Mirrors Studio's opaqueRoot.
 */
export function findOpaqueRoot(expression: string, lookup: ComposedColorLookup): ComposedColorCandidate | null {
  let expr = expression;
  const seen = new Set<string>();
  for (let depth = 0; depth < 32; depth += 1) {
    const nested = matchAlphaExpression(expr);
    if (nested?.mode === 'replace') {
      expr = nested.base;
    } else {
      const reference = getReferenceName(expr);
      if (!reference || seen.has(reference)) return null;
      seen.add(reference);
      const entry = lookup(reference);
      const color = entry ? toParsedColor(entry.value) : null;
      if (!entry || !color) return null;
      if (color.a >= 1 - OPAQUE_EPSILON) return { reference, value: entry.value };
      if (typeof entry.rawValue !== 'string') return null;
      expr = entry.rawValue;
      if (!getReferenceName(expr) && matchAlphaExpression(expr)?.mode !== 'replace') return null;
    }
  }
  return null;
}

/**
 * The colors a composed value may link, in Studio's order: the referenced color itself
 * for source mode (Figma's own rule), then its opaque root.
 */
export function getComposedColorCandidates(composed: ComposedColorReference, lookup: ComposedColorLookup): ComposedColorCandidate[] {
  const candidates: ComposedColorCandidate[] = [];
  if (composed.colorReference && composed.mode === 'source') {
    const entry = lookup(composed.colorReference);
    if (entry) candidates.push({ reference: composed.colorReference, value: entry.value });
  }
  const walksToRoot = composed.colorReference || (matchAlphaExpression(composed.colorExpression) && composed.mode === 'replace');
  const root = walksToRoot ? findOpaqueRoot(composed.colorExpression, lookup) : null;
  if (root && !candidates.some((c) => c.reference === root.reference)) candidates.push(root);
  return candidates;
}

/** Studio only links opacity tokens: other number tokens aren't exported on Figma's 0-100 scale. */
export function canLinkOpacity(composed: ComposedColorReference, lookup: ComposedColorLookup): boolean {
  if (!composed.opacityReference) return false;
  const type = lookup(composed.opacityReference)?.type;
  return type === undefined || type === 'opacity';
}

// Figma keeps a translucent source color's own alpha; otherwise the opacity applies.
function figmaResolve(color: ParsedColor, opacityPercent: number): ParsedColor {
  return color.a >= 1 ? { ...color, a: opacityPercent / 100 } : color;
}

// One 8-bit step, the precision of the hex values tokens resolve to
const TOLERANCE = 1 / 255;

function rendersAs(rendered: ParsedColor, target: ParsedColor) {
  return Math.abs(rendered.r - target.r) <= TOLERANCE
    && Math.abs(rendered.g - target.g) <= TOLERANCE
    && Math.abs(rendered.b - target.b) <= TOLERANCE
    && Math.abs(rendered.a - target.a) <= TOLERANCE;
}

/**
 * Builds the Figma value for a composed color, linking only what Figma renders exactly as
 * the token's resolved value. Same order as Studio's exporter:
 * 1. each color candidate (variable) + linked/literal opacity
 * 2. with a linked opacity: a translucent hex literal in source mode, then the opaque resolved color
 * Returns null when nothing renders correctly, so the caller writes a flat color.
 */
export function buildComposedColorValue({
  composed,
  resolvedValue,
  colorCandidates = [],
  opacityVariable,
  opacityReferenceValue,
}: {
  composed: ComposedColorReference;
  resolvedValue: unknown;
  colorCandidates?: { variable?: Variable; value: unknown }[];
  opacityVariable?: Variable;
  opacityReferenceValue?: unknown;
}): VariableComposedColor | null {
  const target = toParsedColor(resolvedValue);
  if (!target) return null;

  let opacityPercent: number;
  if (composed.opacityLiteral !== undefined) {
    opacityPercent = composed.opacityLiteral * 100;
  } else {
    const alpha = normalizeAlpha(opacityReferenceValue);
    if (alpha === null) return null;
    opacityPercent = alpha * 100;
  }
  opacityPercent = Number(opacityPercent.toFixed(4));
  const opacityAlias = opacityVariable?.resolvedType === 'FLOAT' ? toAlias(opacityVariable) : undefined;

  const candidate = (color: ParsedColor, colorAlias?: VariableAlias, literal?: RGB | RGBA): VariableComposedColor | null => {
    if (!colorAlias && !opacityAlias) return null;
    if (!rendersAs(figmaResolve(color, opacityPercent), target)) return null;
    return { color: (colorAlias ?? literal)!, opacity: opacityAlias ?? opacityPercent } as VariableComposedColor;
  };

  for (const { variable, value } of colorCandidates) {
    const color = toParsedColor(value);
    if (variable?.resolvedType === 'COLOR' && color) {
      const result = candidate(color, toAlias(variable));
      if (result) return result;
    }
  }

  if (opacityAlias) {
    if (composed.mode === 'source' && composed.colorHexLiteral) {
      const direct = toParsedColor(composed.colorHexLiteral);
      const result = direct && candidate(direct, undefined, direct.a < 1 ? direct : { r: direct.r, g: direct.g, b: direct.b });
      if (result) return result;
    }
    const { r, g, b } = target;
    return candidate({
      r, g, b, a: 1,
    }, undefined, { r, g, b });
  }
  return null;
}

/** The token's resolved value as a flat Figma color, used when a composed color can't be linked. */
export function flatColorValue(resolvedValue: unknown): RGBA | null {
  return toParsedColor(resolvedValue);
}

/**
 * A variable's value for comparison, following aliases. Uses the given mode when the
 * variable has it, otherwise its first mode.
 */
export function readVariableValue(variable: Variable | undefined, modeId: string, depth = 0): VariableValue | undefined {
  if (!variable || depth > 10) return undefined;
  const values = variable.valuesByMode ?? {};
  const value = values[modeId] ?? Object.values(values)[0];
  if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    return readVariableValue(figma.variables.getVariableById(value.id) ?? undefined, modeId, depth + 1);
  }
  return value;
}

/**
 * Converts a Figma composed color back to a token value, e.g. rgba({colors.red}, 0.5).
 * Figma stores opacity as a 0-100 percentage; tokens use 0-1.
 */
export function composedColorToTokenValue(
  value: VariableComposedColor,
  getAliasName: (alias: VariableAlias) => string | undefined,
  rgbToHex: (color: RGB) => string,
): string | null {
  let color: string | undefined;
  if ('type' in value.color && value.color.type === 'VARIABLE_ALIAS') {
    const name = getAliasName(value.color);
    color = name ? `{${name}}` : undefined;
  } else {
    const { r, g, b } = value.color as RGB;
    color = rgbToHex({ r, g, b });
  }

  let opacity: string | undefined;
  if (typeof value.opacity === 'number') {
    opacity = String(Number((value.opacity / 100).toFixed(4)));
  } else {
    const name = getAliasName(value.opacity);
    opacity = name ? `{${name}}` : undefined;
  }

  if (!color || !opacity) return null;
  return `rgba(${color}, ${opacity})`;
}
