import { transformValue } from './helpers';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { setFontStyleOnTarget } from './setFontStyleOnTarget';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { transformTypographyKeyToFigmaVariable } from './transformTypographyKeyToFigmaVariable';
import { SingleTypographyToken } from '@/types/tokens';
import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';

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
    // First we set font family and weight without variables, we do this because to apply those values we need their combination
    if ('fontName' in target && ('fontWeight' in value || 'fontFamily' in value)) {
      setFontStyleOnTarget({ target, value: { fontFamily: value.fontFamily, fontWeight: value.fontWeight }, baseFontSize });
    }
    // Then we iterate over all keys of the typography object and apply variables if available, otherwise we apply the value directly
    for (const [originalKey, val] of Object.entries(resolvedValue).filter(([_, keyValue]) => typeof keyValue !== 'undefined')) {
      if (typeof val === 'undefined') return;
      let successfullyAppliedVariable = false;
      if (val.toString().startsWith('{') && val.toString().endsWith('}') && shouldCreateStylesWithVariables) {
        const variableToApply = await defaultTokenValueRetriever.getVariableReference(val.toString().slice(1, -1));
        const key = transformTypographyKeyToFigmaVariable(originalKey, variableToApply);
        if (variableToApply) {
          if (target.fontName !== figma.mixed) await figma.loadFontAsync(target.fontName);
          target.setBoundVariable(key, variableToApply);
          successfullyAppliedVariable = true;
        }
      }
      // If there's no variable we apply the value directly
      if (!successfullyAppliedVariable && originalKey !== 'fontFamily' && originalKey !== 'fontWeight') {
        if (target.fontName !== figma.mixed) await figma.loadFontAsync(target.fontName);
        const transformedValue = transformValue(value[originalKey], originalKey, baseFontSize);
        if (transformedValue !== null) {
          target[originalKey] = transformedValue;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}
