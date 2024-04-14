import { transformValue } from './helpers';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { setFontStyleOnTarget } from './setFontStyleOnTarget';
import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { transformTypographyKeyToFigmaVariable } from './transformTypographyKeyToFigmaVariable';
import { SingleTypographyToken } from '@/types/tokens';

export async function tryApplyTypographyCompositeVariable({
  target, value, baseFontSize, resolvedValue,
}: {
  target: TextNode | TextStyle;
  value: SingleTypographyToken['value'];
  resolvedValue: ResolvedTypographyObject;
  baseFontSize: string;
}) {
  // If we're creating styles we need to check the user's setting. If we're applying on a layer, always try to apply variables.
  const shouldCreateStylesWithVariables = defaultTokenValueRetriever.createStylesWithVariableReferences || !('consumers' in target);
  console.log('tryApplyTypographyCompositeVariable', target, value, baseFontSize, resolvedValue, shouldCreateStylesWithVariables);
  if (typeof value === 'string') return;

  try {
    console.log('value', value, target);
    // First we set font family and weight without variables, we do this because to apply those values we need their combination
    if ('fontName' in target && ('fontWeight' in value || 'fontFamily' in value)) {
      setFontStyleOnTarget({ target, value: { fontFamily: value.fontFamily, fontWeight: value.fontWeight }, baseFontSize });
    }
    // Then we iterate over all keys of the typography object and apply variables if available, otherwise we apply the value directly
    for (const [originalKey, val] of Object.entries(resolvedValue)) {
      if (typeof val === 'undefined') return;
      let successfullyAppliedVariable = false;
      if (val.toString().startsWith('{') && val.toString().endsWith('}') && shouldCreateStylesWithVariables) {
        console.log('Applying variable', val.toString().slice(1, -1));
        const variableToApply = await defaultTokenValueRetriever.getVariableReference(val.toString().slice(1, -1));
        const key = transformTypographyKeyToFigmaVariable(originalKey, variableToApply);
        console.log('variable to apply is', variableToApply.name, key);
        if (variableToApply) {
          // @ts-expect-error - expected as plugin typings need to be updated
          target.setBoundVariable(key, variableToApply);
          successfullyAppliedVariable = true;
        }
      }
      // If there's no variable we apply the value directly
      if (!successfullyAppliedVariable && originalKey !== 'fontFamily' && originalKey !== 'fontWeight') {
        if (target.fontName !== figma.mixed) await figma.loadFontAsync(target.fontName);
        console.log('setting real value', value[originalKey], originalKey, baseFontSize);
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
