import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertStringToFigmaGradient } from './figmaTransforms/gradients';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { ColorPaintType, tryApplyColorVariableId } from '@/utils/tryApplyColorVariableId';
import { unbindVariableFromTarget } from './unbindVariableFromTarget';
import { getReferenceTokensFromGradient } from '@/utils/color';
import { SingleToken } from '@/types/tokens';
import { TokenColorValue } from '@/types/values';

function hasModifier(token: SingleToken) {
  return token.$extensions?.['studio.tokens']?.modify;
}

const applyPaintIfNotEqual = (key, existingPaints, newPaints, target) => {
  // Handle multiple paints
  if (Array.isArray(newPaints)) {
    // Check if the existing paints array matches the new paints array
    const paintsMatch = existingPaints && Array.isArray(existingPaints) && 
      existingPaints.length === newPaints.length &&
      existingPaints.every((existingPaint, index) => isPaintEqual(newPaints[index], existingPaint));
    
    if (!paintsMatch) {
      if (key === 'paints' && 'paints' in target) target.paints = newPaints;
      if (key === 'fills' && 'fills' in target) target.fills = newPaints;
      if (key === 'strokes' && 'strokes' in target) target.strokes = newPaints;
    }
  } else {
    // Handle single paint (existing behavior)
    const existingPaint = Array.isArray(existingPaints) ? existingPaints[0] : existingPaints;
    if (!existingPaint || !isPaintEqual(newPaints, existingPaint)) {
      if (key === 'paints' && 'paints' in target) target.paints = [newPaints];
      if (key === 'fills' && 'fills' in target) target.fills = [newPaints];
      if (key === 'strokes' && 'strokes' in target) target.strokes = [newPaints];
    }
  }
};

const getLinearGradientPaint = async (fallbackValue, token) => {
  const gradientString = typeof fallbackValue === 'object' && fallbackValue.fill
    ? fallbackValue.fill
    : fallbackValue;
  const { gradientStops, gradientTransform } = convertStringToFigmaGradient(gradientString);

  const rawValue = defaultTokenValueRetriever.get(token)?.rawValue;
  let gradientStopsWithReferences = gradientStops;

  const { createStylesWithVariableReferences } = defaultTokenValueRetriever;
  if (createStylesWithVariableReferences) {
    const referenceTokens = getReferenceTokensFromGradient(rawValue);

    if (gradientStops && referenceTokens.length > 0) {
      gradientStopsWithReferences = await Promise.all(gradientStops.map(async (stop, index) => {
        const referenceVariableExists = await defaultTokenValueRetriever.getVariableReference(referenceTokens[index]);
        if (referenceVariableExists) {
          return {
            ...stop,
            boundVariables: {
              color: {
                type: 'VARIABLE_ALIAS',
                id: referenceVariableExists.id,
              },
            },
          };
        }
        return stop;
      }));
    }
  }
  const newPaint: GradientPaint = {
    type: 'GRADIENT_LINEAR',
    gradientTransform,
    gradientStops: gradientStopsWithReferences,
  };
  return newPaint;
};

export default async function setColorValuesOnTarget({
  target, token, key, givenValue,
}: {
  target: BaseNode | PaintStyle,
  token: string,
  key: 'paints' | 'fills' | 'strokes',
  givenValue?: string
}) {
  // If we're creating styles we need to check the user's setting. If we're applying on a layer, always try to apply variables.
  const shouldCreateStylesWithVariables = defaultTokenValueRetriever.createStylesWithVariableReferences || !('consumers' in target);
  try {
    const resolvedToken = defaultTokenValueRetriever.get(token);
    if (typeof resolvedToken === 'undefined' && !givenValue) return;
    const { description } = resolvedToken || {};
    const resolvedValue = givenValue || defaultTokenValueRetriever.get(token)?.rawValue;

    if (typeof resolvedValue === 'undefined') return;
    let existingPaints: readonly Paint[] | null = null;
    if (key === 'paints' && 'paints' in target) {
      existingPaints = target.paints ?? null;
    } else if (key === 'fills' && 'fills' in target && target.fills !== figma.mixed) {
      existingPaints = target.fills ?? null;
    } else if (key === 'strokes' && 'strokes' in target) {
      existingPaints = target.strokes ?? null;
    }

    // Check if we have multiple colors to apply
    const fallbackValue = defaultTokenValueRetriever.get(token)?.value;
    const valueToProcess = fallbackValue ?? givenValue;
    
    // Handle multiple color values
    if (Array.isArray(valueToProcess)) {
      const newPaints: Paint[] = [];
      
      for (const colorValue of valueToProcess) {
        const colorString = typeof colorValue === 'string' ? colorValue : colorValue.color;
        if (colorString?.startsWith?.('linear-gradient')) {
          const newPaint = await getLinearGradientPaint(colorString, token);
          newPaints.push(newPaint);
        } else {
          const { color, opacity } = convertToFigmaColor(colorString || '');
          const newPaint: SolidPaint = { color, opacity, type: 'SOLID' };
          newPaints.push(newPaint);
        }
      }
      
      if (newPaints.length > 0) {
        await unbindVariableFromTarget(target, key, newPaints[0]);
        applyPaintIfNotEqual(key, existingPaints, newPaints, target);
      }
      
      if (description && 'description' in target) {
        target.description = description;
      }
      return Promise.resolve();
    }

    // Handle single color value (existing logic with modifications)
    const singleColorValue = typeof valueToProcess === 'object' && valueToProcess !== null && 'color' in valueToProcess 
      ? valueToProcess.color 
      : valueToProcess;

    if (singleColorValue?.startsWith?.('linear-gradient')) {
      const newPaint = await getLinearGradientPaint(fallbackValue, token);
      applyPaintIfNotEqual(key, existingPaints, newPaint, target);
    } else {
      // If the raw value is a pure reference to another token, we first should try to apply that reference as a variable if it exists.
      let successfullyAppliedVariable = false;

      const containsReferenceVariable = singleColorValue?.toString().startsWith('{') && singleColorValue?.toString().endsWith('}');
      const referenceVariableExists = await defaultTokenValueRetriever.getVariableReference(singleColorValue?.slice(1, -1));

      if (containsReferenceVariable && referenceVariableExists && shouldCreateStylesWithVariables && !hasModifier(resolvedToken)) {
        try {
          successfullyAppliedVariable = await tryApplyColorVariableId(target, singleColorValue?.slice(1, -1), ColorPaintType.PAINTS);
        } catch (e) {
          console.error('Error setting bound variable for paint', e);
        }
      }

      // If value contains references but we werent able to apply, likely that reference doesnt exist. It could be that this is a composite token like border
      // Where we pass in the color value from a composite but technically that token doesnt exist in the current set of tokens (but a reference to a variable exists!)
      // So we should see if there is a token that exists for the value we're trying to apply, if not, use the givenValue that we pass on in that case
      const valueToApply = singleColorValue;

      if (!successfullyAppliedVariable) {
        let newPaint: SolidPaint | GradientPaint;
        if (valueToApply.startsWith?.('linear-gradient')) {
          newPaint = await getLinearGradientPaint(fallbackValue, token);
        } else {
          const { color, opacity } = convertToFigmaColor(typeof valueToApply === 'string' ? valueToApply : valueToApply?.color || givenValue || '');
          newPaint = { color, opacity, type: 'SOLID' };
        }

        await unbindVariableFromTarget(target, key, newPaint);
        applyPaintIfNotEqual(key, existingPaints, newPaint, target);
      }
    }
    if (description && 'description' in target) {
      target.description = description;
    }
    Promise.resolve();
  } catch (e) {
    console.error('Error setting color', e);
  }
}
