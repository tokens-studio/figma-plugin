import { isEqual } from '@/utils/isEqual';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { VariableToCreateToken } from '@/types/payloads';

type Extensions = NonNullable<SingleToken['$extensions']>;

// Values Figma reports for every variable that nobody customised. We don't want these to count as a change,
// nor to be written onto tokens that never had them.
const FIGMA_EXTENSION_DEFAULTS: Record<string, unknown> = {
  'com.figma.scopes': ['ALL_SCOPES'],
  'com.figma.hiddenFromPublishing': false,
};

const NUMBER_WITH_UNIT = /^(-?\d*\.?\d+(?:e[-+]?\d+)?)(px|rem)?$/i;

type ParsedNumber = { amount: number; unit: string };

function parseNumber(value: SingleToken['value']): ParsedNumber | null {
  if (typeof value === 'number') return { amount: value, unit: '' };
  if (typeof value !== 'string') return null;
  const match = value.trim().match(NUMBER_WITH_UNIT);
  if (!match) return null;
  return { amount: Number(match[1]), unit: match[2] ?? '' };
}

function toPixels({ amount, unit }: ParsedNumber, baseFontSize: number) {
  return unit.toLowerCase() === 'rem' ? amount * baseFontSize : amount;
}

const round = (n: number) => Number(n.toFixed(3));

// Figma only gives us a raw number for FLOAT variables. If the existing token is a plain number, px or rem
// literal, write the incoming number back in the existing token's unit instead of the import's unit.
function reconcileValue(
  existing: SingleToken,
  imported: VariableToCreateToken,
  baseFontSize: number,
): SingleToken['value'] {
  if (imported.type !== TokenTypes.NUMBER && imported.type !== TokenTypes.DIMENSION) return imported.value;
  const existingNumber = parseNumber(existing.value);
  const importedNumber = parseNumber(imported.value);
  if (!existingNumber || !importedNumber) return imported.value;

  const importedPixels = toPixels(importedNumber, baseFontSize);
  if (round(importedPixels) === round(toPixels(existingNumber, baseFontSize))) return existing.value;

  const amount = round(existingNumber.unit.toLowerCase() === 'rem' ? importedPixels / baseFontSize : importedPixels);
  if (existingNumber.unit) return `${amount}${existingNumber.unit}`;
  return typeof existing.value === 'number' ? amount : String(amount);
}

// Color and boolean variables can only come from color and boolean tokens. Everything else (number, dimension,
// fontWeights, text, ...) shares FLOAT/STRING variables, so Figma can't tell us the type: keep the one we have.
function reconcileType(existing: SingleToken, imported: VariableToCreateToken): TokenTypes {
  const strictTypes = [TokenTypes.COLOR, TokenTypes.BOOLEAN];
  if (existing.type !== imported.type && (strictTypes.includes(existing.type) || strictTypes.includes(imported.type))) {
    return imported.type;
  }
  return existing.type;
}

const isFigmaExtension = (key: string) => key.startsWith('com.figma.');

function pickFigmaExtensions(extensions: Extensions | undefined) {
  return Object.fromEntries(Object.entries(extensions ?? {}).filter(([key]) => isFigmaExtension(key)));
}

// Figma owns the com.figma.* keys; everything else (studio.tokens modifiers and id, other tools' data) is kept.
function reconcileExtensions(existing: SingleToken, imported: VariableToCreateToken) {
  const existingFigma = pickFigmaExtensions(existing.$extensions);
  const importedFigma = Object.fromEntries(
    Object.entries(pickFigmaExtensions(imported.$extensions)).filter(([key, value]) => (
      key in existingFigma || !isEqual(value, FIGMA_EXTENSION_DEFAULTS[key])
    )),
  );
  const others = Object.fromEntries(Object.entries(existing.$extensions ?? {}).filter(([key]) => !isFigmaExtension(key)));
  const merged = { ...others, ...importedFigma };

  return {
    $extensions: Object.keys(merged).length > 0 ? merged as Extensions : undefined,
    figmaExtensionsChanged: !isEqual(existingFigma, importedFigma),
  };
}

/**
 * Applies an imported variable onto the token that already exists with the same name.
 * Figma is the source of truth for the value (and its description and Figma metadata),
 * but it can't express token types or units, so those come from the existing token.
 */
export function reconcileImportedVariableToken(
  existing: SingleToken,
  imported: VariableToCreateToken,
  baseFontSize = 16,
): { token: VariableToCreateToken; hasChanges: boolean } {
  const value = reconcileValue(existing, imported, baseFontSize);
  const { $extensions, figmaExtensionsChanged } = reconcileExtensions(existing, imported);
  const hasChanges = !isEqual(value, existing.value)
    || (existing.description ?? '') !== (imported.description ?? '')
    || figmaExtensionsChanged;

  const token: VariableToCreateToken = {
    ...imported,
    value,
    type: reconcileType(existing, imported),
    ...($extensions ? { $extensions } : {}),
    ...(existing.$deprecated ? { $deprecated: existing.$deprecated } : {}),
  };
  if (!$extensions) delete token.$extensions;

  return { token, hasChanges };
}
