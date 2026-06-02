import { transformValue } from './helpers';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { setFontStyleOnTarget } from './setFontStyleOnTarget';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { transformTypographyKeyToFigmaVariable } from './transformTypographyKeyToFigmaVariable';
import { SingleTypographyToken } from '@/types/tokens';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { tryParseJson } from '@/utils/tryParseJson';

// Cache to track font loading promises to prevent race conditions in Promise.all
const fontLoadingPromises = new Map<string, Promise<void>>();

function dtcgUnitToCssUnit(unit: unknown): string {
  if (unit === 'PIXELS') return 'px';
  if (unit === 'PERCENT') return '%';
  return typeof unit === 'string' ? unit : '';
}

// Resolved typography values can arrive in formats the raw-apply path can't consume:
//  - DTCG dimension objects like { value: 24, unit: 'px' } (from variable/local resolution)
//  - JSON-array font families like '["Comic","Sans","MS"]' (from server resolution)
// transformValue/setFontStyleOnTarget expect plain strings (e.g. '24px', 'Comic, Sans, MS'),
// so we normalize here. parseFloat on a raw object yields NaN, which throws when assigned.
function normalizeTypographyPropertyValue(key: string, raw: any): any {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'value' in raw) {
    return `${raw.value}${dtcgUnitToCssUnit(raw.unit)}`;
  }
  if ((key === 'fontFamily' || key === 'fontFamilies') && typeof raw === 'string' && raw.trim().startsWith('[')) {
    const parsed = tryParseJson<unknown[]>(raw);
    if (Array.isArray(parsed)) return parsed.map((f) => String(f)).join(', ');
  }
  return raw;
}

export async function tryApplyTypographyCompositeVariable({
  target, value, baseFontSize, resolvedValue,
}: {
  target: TextNode | TextStyle;
  value: SingleTypographyToken['value'];
  resolvedValue: ResolvedTypographyObject;
  baseFontSize: string;
}) {
  // If we're creating styles we need to check the user's setting. If we're applying on a layer, always try to apply variables.
  // 'consumers' only exists in styles, so we can use that to determine if we're creating a style or applying to a layer
  const { applyVariablesStylesOrRawValue } = defaultTokenValueRetriever;
  const shouldApplyStylesAndVariables = applyVariablesStylesOrRawValue !== ApplyVariablesStylesOrRawValues.RAW_VALUES;
  const isStyle = 'consumers' in target;
  const shouldCreateStylesWithVariables = (isStyle && defaultTokenValueRetriever.createStylesWithVariableReferences) || (!isStyle && shouldApplyStylesAndVariables);

  if (typeof value === 'string') return;

  const normalizedValue = Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key, normalizeTypographyPropertyValue(key, val)]),
  ) as typeof value;

  try {
    // We iterate over all keys of the typography object and apply variables if available, otherwise we apply the value directly
    for (const [originalKey] of Object.entries(normalizedValue).filter(([_, keyValue]) => typeof keyValue !== 'undefined')) {
      let successfullyAppliedVariable = false;
      if (resolvedValue[originalKey]?.toString().startsWith('{') && resolvedValue[originalKey].toString().endsWith('}') && shouldCreateStylesWithVariables) {
        const variableToApply = await defaultTokenValueRetriever.getVariableReference(resolvedValue[originalKey].toString().slice(1, -1));
        const key = transformTypographyKeyToFigmaVariable(originalKey, variableToApply);
        // If we're dealing with a variable, we fetch all available font weights for the current font and load them.
        // This is needed because we have numerical weights, but we need to apply the string ones. We dont know them from Figma, so we need to load all.
        // e.g. font weight = 600, we dont know that we need to load "Bold".
        if (key === 'fontFamily' && variableToApply) {
          const firstVariableValue = Object.values(variableToApply.valuesByMode)[0];
          if (firstVariableValue && typeof firstVariableValue === 'string') {
            // Check if we already have a loading promise for this font family
            let loadingPromise = fontLoadingPromises.get(firstVariableValue);
            if (!loadingPromise) {
              // Create and cache the loading promise
              loadingPromise = (async () => {
                const fontsMatching = (await figma.listAvailableFontsAsync() || []).filter((font) => font.fontName.family === firstVariableValue);
                for (const font of fontsMatching) {
                  await figma.loadFontAsync(font.fontName);
                }
              })();
              fontLoadingPromises.set(firstVariableValue, loadingPromise);
            }
            // Wait for the loading to complete
            await loadingPromise;
          }
        }
        if (variableToApply) {
          // Wrapping loadfont in a try catch as the previous value could be malformed but we still want to apply the value
          try {
            if (target.fontName !== figma.mixed) await figma.loadFontAsync(target.fontName);
          } catch (e) {
            console.error('error loading font', e);
          }
          try {
            target.setBoundVariable(key, variableToApply);
            successfullyAppliedVariable = true;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('unable to apply variable', key, variableToApply, e);
          }
        }
      }
      // If there's no variable we apply the value directly. Each property is applied
      // independently so a single malformed value can't abort the whole typography apply.
      if (!successfullyAppliedVariable) {
        try {
          // First we set font family and weight without variables, we do this because to apply those values we need their combination
          if (originalKey === 'fontFamily' || originalKey === 'fontWeight') {
            if ('fontName' in target && ('fontWeight' in normalizedValue || 'fontFamily' in normalizedValue)) {
              await setFontStyleOnTarget({ target, value: { fontFamily: normalizedValue.fontFamily, fontWeight: normalizedValue.fontWeight }, baseFontSize });
            }
          } else {
            if (target.fontName !== figma.mixed) await figma.loadFontAsync(target.fontName);
            const transformedValue = transformValue(normalizedValue[originalKey], originalKey, baseFontSize);
            if (transformedValue !== null && !(typeof transformedValue === 'number' && Number.isNaN(transformedValue))) {
              target[originalKey] = transformedValue;
            }
          }
        } catch (e) {
          console.error('unable to apply typography property', originalKey, normalizedValue[originalKey], e);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}
