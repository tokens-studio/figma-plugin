import { transformValue } from './helpers';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { setFontStyleOnTarget } from './setFontStyleOnTarget';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { transformTypographyKeyToFigmaVariable } from './transformTypographyKeyToFigmaVariable';
import { SingleTypographyToken } from '@/types/tokens';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

// Cache to track font loading promises to prevent race conditions in Promise.all
const fontLoadingPromises = new Map<string, Promise<void>>();

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

  try {
    // We iterate over all keys of the typography object and apply variables if available, otherwise we apply the value directly
    for (const [originalKey, val] of Object.entries(value).filter(([_, keyValue]) => typeof keyValue !== 'undefined')) {
      if (typeof val === 'undefined') return;
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
      // If there's no variable we apply the value directly
      if (!successfullyAppliedVariable) {
        // First we set font family and weight without variables, we do this because to apply those values we need their combination
        if (originalKey === 'fontFamily' || originalKey === 'fontWeight') {
          if ('fontName' in target && ('fontWeight' in value || 'fontFamily' in value)) {
            setFontStyleOnTarget({ target, value: { fontFamily: value.fontFamily, fontWeight: value.fontWeight }, baseFontSize });
          }
        } else {
          if (target.fontName !== figma.mixed) await figma.loadFontAsync(target.fontName);
          const transformedValue = transformValue(value[originalKey], originalKey, baseFontSize);
          if (transformedValue !== null) {
            target[originalKey] = transformedValue;
          }
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}
