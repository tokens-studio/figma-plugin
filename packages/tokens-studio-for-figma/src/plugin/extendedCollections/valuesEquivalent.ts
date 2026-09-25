import { isColorApproximatelyEqual } from '@/utils/isColorApproximatelyEqual';

const NUMBER_THRESHOLD = 0.000001;

type RGBOrRGBA = { r: number; g: number; b: number; a?: number };

function isFigmaColorObject(obj: unknown): obj is RGBOrRGBA {
  return (
    typeof obj === 'object'
    && obj !== null
    && 'r' in obj
    && 'g' in obj
    && 'b' in obj
    && typeof (obj as any).r === 'number'
    && typeof (obj as any).g === 'number'
    && typeof (obj as any).b === 'number'
    && (!('a' in obj) || typeof (obj as any).a === 'number')
  );
}

function isAliasObject(obj: unknown): obj is VariableAlias {
  return (
    typeof obj === 'object'
    && obj !== null
    && (obj as any).type === 'VARIABLE_ALIAS'
    && typeof (obj as any).id === 'string'
  );
}

/**
 * One type-aware equality used for every inherit-vs-override decision on
 * extended collections. Two values are equivalent when Figma would resolve
 * them identically:
 * - aliases: same target variable id
 * - colors: approximately equal RGBA (missing alpha treated as 1)
 * - numbers: approximately equal
 * - strings / booleans: strict equality
 * - mixed kinds (e.g. alias vs raw color): never equivalent
 */
export function valuesEquivalent(a: VariableValue | undefined, b: VariableValue | undefined): boolean {
  if (a === undefined || b === undefined) return false;

  if (isAliasObject(a) || isAliasObject(b)) {
    return isAliasObject(a) && isAliasObject(b) && a.id === b.id;
  }

  if (isFigmaColorObject(a) || isFigmaColorObject(b)) {
    if (!(isFigmaColorObject(a) && isFigmaColorObject(b))) return false;
    return isColorApproximatelyEqual(
      { ...a, a: a.a ?? 1 },
      { ...b, a: b.a ?? 1 },
    );
  }

  if (typeof a === 'number' || typeof b === 'number') {
    return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < NUMBER_THRESHOLD;
  }

  return a === b;
}
