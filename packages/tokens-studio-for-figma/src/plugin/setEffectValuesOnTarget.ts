/* eslint-disable no-param-reassign */
import { convertBoxShadowTypeToFigma } from './figmaTransforms/boxShadow';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertTypographyNumberToFigma } from './figmaTransforms/generic';
import convertOffsetToFigma from './figmaTransforms/offset';
import { getShadowBehindNodeFromEffect } from './figmaUtils/getShadowBehindNodeFromEffect';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { TokenBoxshadowValue } from '@/types/values';

type ResolvedShadowObject = {
  color: string;
  type: string;
  spread: string;
  radius: string;
  x: string;
  y: string;
};

function transformShadowKeyToFigmaVariable(key: string): VariableBindableEffectField {
  switch (key) {
    case 'x':
      return 'offsetX' as VariableBindableEffectField;
    case 'y':
      return 'offsetY' as VariableBindableEffectField;
    case 'blur':
      return 'radius' as VariableBindableEffectField;
    default:
      return key as VariableBindableEffectField;
  }
}

async function tryApplyCompositeVariable({
  target, value, baseFontSize, resolvedValue,
}: {
  target: BaseNode | EffectStyle;
  value: TokenBoxshadowValue;
  baseFontSize: string;
  resolvedValue: ResolvedShadowObject;
}) {
  // If we're creating styles we need to check the user's setting. If we're applying on a layer, always try to apply variables.
  // 'consumers' only exists in styles, so we can use that to determine if we're creating a style or applying to a layer
  const shouldCreateStylesWithVariables = defaultTokenValueRetriever.createStylesWithVariableReferences || !('consumers' in target);

  const { color, opacity: a } = convertToFigmaColor(value.color);
  const { r, g, b } = color;

  let effect: Effect = {
    color: {
      r,
      g,
      b,
      a,
    },
    type: convertBoxShadowTypeToFigma(value.type),
    spread: convertTypographyNumberToFigma(value.spread.toString(), baseFontSize),
    radius: convertTypographyNumberToFigma(value.blur.toString(), baseFontSize),
    offset: convertOffsetToFigma(convertTypographyNumberToFigma(value.x.toString(), baseFontSize), convertTypographyNumberToFigma(value.y.toString(), baseFontSize)),
    blendMode: (value.blendMode || 'NORMAL') as BlendMode,
    visible: true,
    ...value.type === 'dropShadow' && 'effects' in target ? { showShadowBehindNode: getShadowBehindNodeFromEffect(target.effects[0]) } : {},
  };
  try {
    for (const [key, val] of Object.entries(resolvedValue)) {
      if (val.toString().startsWith('{') && val.toString().endsWith('}') && shouldCreateStylesWithVariables) {
        const variableToApply = await defaultTokenValueRetriever.getVariableReference(val.slice(1, -1));
        if (variableToApply) {
          const updatedEffect = figma.variables.setBoundVariableForEffect(effect, transformShadowKeyToFigmaVariable(key), variableToApply);
          effect = {
            ...effect,
            boundVariables: updatedEffect.boundVariables,
          };
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return effect;
}

export default async function setEffectValuesOnTarget(
  target: BaseNode | EffectStyle,
  token: string,
  baseFontSize: string,
  key: 'effects' = 'effects',
) {
  try {
    const resolvedToken = defaultTokenValueRetriever.get(token);
    if (typeof resolvedToken === 'undefined') return;
    const { description, value } = resolvedToken;
    const resolvedValue: ResolvedShadowObject = defaultTokenValueRetriever.get(token)?.resolvedValueWithReferences;
    if (typeof resolvedValue === 'undefined') return;

    if (Array.isArray(value)) {
      const effectsArray = await Promise.all(value.map(async (v, i) => {
        const newEffect = await tryApplyCompositeVariable({
          target, value: v, baseFontSize, resolvedValue: resolvedValue[i],
        });
        return newEffect;
      }));

      if ('effects' in target && key === 'effects') target.effects = effectsArray.reverse();
    } else if (typeof value !== 'string') {
      if ('effects' in target && key === 'effects') {
        const newEffect = await tryApplyCompositeVariable({
          target, value, baseFontSize, resolvedValue,
        });
        target.effects = [
          newEffect,
        ];
        Promise.resolve();
      }
    }

    if (description && 'description' in target) {
      target.description = description;
    }
  } catch (e) {
    console.error('Error setting shadow', e);
    Promise.reject();
  }
}
