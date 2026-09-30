import { convertToFigmaColor } from './figmaTransforms/colors';
import convertOpacityToFigma from './figmaTransforms/opacity';

// A token value like rgba({color}, 0.5) or rgba({color}, {opacity}) where at least
// one part is a reference. Figma can store these as a VariableComposedColor so the
// color and/or opacity stay linked to their variables.
export type ComposedColorReference = {
  colorReference?: string;
  opacityReference?: string;
  // Raw alpha argument when the opacity is a literal, e.g. "0.5" or "50%"
  opacityLiteral?: string;
};

const RGBA_FUNCTION_REGEX = /^\s*rgba?\((.*)\)\s*$/;
const SINGLE_REFERENCE_REGEX = /^(?:\{([^{}]+)\}|\$([^\s,{}]+))$/;

function getReferenceName(arg: string): string | undefined {
  const match = arg.match(SINGLE_REFERENCE_REGEX);
  if (!match) return undefined;
  return match[1] ?? match[2];
}

export function parseComposedColorReference(rawValue: unknown): ComposedColorReference | null {
  if (typeof rawValue !== 'string') return null;
  const match = rawValue.match(RGBA_FUNCTION_REGEX);
  if (!match) return null;

  const args = match[1].split(',').map((arg) => arg.trim());
  let colorArg: string;
  let alphaArg: string;
  if (args.length === 2) {
    [colorArg, alphaArg] = args;
  } else if (args.length === 4) {
    // rgba(255, 0, 0, {opacity}) — the color part is always a literal here
    if (args.slice(0, 3).some((c) => !/^\d+(\.\d+)?$/.test(c))) return null;
    colorArg = '';
    [, , , alphaArg] = args;
  } else {
    return null;
  }

  const colorReference = colorArg ? getReferenceName(colorArg) : undefined;
  const opacityReference = getReferenceName(alphaArg);
  if (!colorReference && !opacityReference) return null;
  // Anything else still containing a reference (e.g. math) can't be expressed as a composed color
  if (!colorReference && colorArg.includes('{')) return null;
  if (!opacityReference && alphaArg.includes('{')) return null;

  return {
    ...(colorReference ? { colorReference } : {}),
    ...(opacityReference ? { opacityReference } : { opacityLiteral: alphaArg }),
  };
}

export function isVariableComposedColor(value: unknown): value is VariableComposedColor {
  return typeof value === 'object'
    && value !== null
    && 'color' in value
    && 'opacity' in value;
}

export function getComposedColorReferenceNames(composed: ComposedColorReference): string[] {
  return [composed.colorReference, composed.opacityReference].filter((name): name is string => !!name);
}

function toAlias(variable: Variable): VariableAlias {
  return { type: 'VARIABLE_ALIAS', id: variable.id };
}

/**
 * Builds the Figma value for a composed color. Parts whose reference variable could not
 * be found fall back to the token's resolved value, so the result is still correct but
 * only partially linked. Returns null if neither part can be linked.
 */
export function buildComposedColorValue({
  composed,
  resolvedValue,
  colorVariable,
  opacityVariable,
}: {
  composed: ComposedColorReference;
  resolvedValue: unknown;
  colorVariable?: Variable;
  opacityVariable?: Variable;
}): VariableComposedColor | null {
  const linkedColor = colorVariable?.resolvedType === 'COLOR' ? colorVariable : undefined;
  const linkedOpacity = opacityVariable?.resolvedType === 'FLOAT' ? opacityVariable : undefined;
  if (!linkedColor && !linkedOpacity) return null;

  let resolved: ReturnType<typeof convertToFigmaColor> | null = null;
  if (typeof resolvedValue === 'string') {
    try {
      resolved = convertToFigmaColor(resolvedValue);
    } catch (e) {
      resolved = null;
    }
  }

  let opacity: number | VariableAlias | undefined;
  if (linkedOpacity) {
    opacity = toAlias(linkedOpacity);
  } else if (composed.opacityLiteral !== undefined) {
    const literal = Number(convertOpacityToFigma(composed.opacityLiteral, true));
    if (Number.isFinite(literal)) opacity = Math.min(Math.max(literal, 0), 100);
  }
  if (opacity === undefined && resolved) {
    opacity = resolved.opacity * 100;
  }
  if (opacity === undefined) return null;
  if (typeof opacity === 'number') opacity = Number(opacity.toFixed(4));

  if (linkedColor) {
    return { color: toAlias(linkedColor), opacity };
  }
  // Color literal requires an opacity alias (Figma rejects a fully literal composed color)
  if (!resolved || typeof opacity === 'number') return null;
  const { r, g, b } = resolved.color;
  return { color: { r, g, b }, opacity };
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
