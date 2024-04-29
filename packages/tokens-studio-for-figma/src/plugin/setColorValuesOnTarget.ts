import { isPaintEqual } from '@/utils/isPaintEqual';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertStringToFigmaGradient } from './figmaTransforms/gradients';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { ColorPaintType, tryApplyColorVariableId } from '@/utils/tryApplyColorVariableId';
import { unbindVariableFromTarget } from './unbindVariableFromTarget';

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
    const resolvedValue = defaultTokenValueRetriever.get(token)?.rawValue || givenValue;

    if (typeof resolvedValue === 'undefined') return;
    let existingPaint: Paint | null = null;
    if (key === 'paints' && 'paints' in target) {
      existingPaint = target.paints[0] ?? null;
    } else if (key === 'fills' && 'fills' in target && target.fills !== figma.mixed) {
      existingPaint = target.fills[0] ?? null;
    } else if (key === 'strokes' && 'strokes' in target) {
      existingPaint = target.strokes[0] ?? null;
    }

    if (resolvedValue.startsWith('linear-gradient')) {
      const { gradientStops, gradientTransform } = convertStringToFigmaGradient(resolvedValue);
      const newPaint: GradientPaint = {
        type: 'GRADIENT_LINEAR',
        gradientTransform,
        gradientStops,
      };

      if (!existingPaint || !isPaintEqual(newPaint, existingPaint)) {
        if (key === 'paints' && 'paints' in target) target.paints = [newPaint];
        if (key === 'fills' && 'fills' in target) target.fills = [newPaint];
        if (key === 'strokes' && 'strokes' in target) target.strokes = [newPaint];
      }
    } else {
      // If the raw value is a pure reference to another token, we first should try to apply that reference as a variable if it exists.
      let successfullyAppliedVariable = false;

      const containsReferenceVariable = resolvedValue.toString().startsWith('{') && resolvedValue.toString().endsWith('}');

      if (containsReferenceVariable && shouldCreateStylesWithVariables) {
        try {
          successfullyAppliedVariable = await tryApplyColorVariableId(target, resolvedValue.slice(1, -1), ColorPaintType.PAINTS);
        } catch (e) {
          console.error('Error setting bound variable for paint', e);
        }
      }

      // If value contains references but we werent able to apply, likely that reference doesnt exist.
      // So we should apply the raw hex value instead
      const valueToApply = containsReferenceVariable ? givenValue : resolvedValue;

      if (!successfullyAppliedVariable) {
        const { color, opacity } = convertToFigmaColor(valueToApply);
        const newPaint: SolidPaint = { color, opacity, type: 'SOLID' };
        await unbindVariableFromTarget(target, key, newPaint);
        if (!existingPaint || !isPaintEqual(newPaint, existingPaint)) {
          if (key === 'paints' && 'paints' in target) target.paints = [newPaint];
          if (key === 'fills' && 'fills' in target) target.fills = [newPaint];
          if (key === 'strokes' && 'strokes' in target) target.strokes = [newPaint];
        }
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
