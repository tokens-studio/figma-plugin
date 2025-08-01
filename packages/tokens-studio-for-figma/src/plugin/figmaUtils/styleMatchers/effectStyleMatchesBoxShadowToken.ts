import { isEffectEqual } from '@/utils/isEffectEqual';
import { TokenBoxshadowValue } from '@/types/values';

import { convertBoxShadowTypeToFigma } from '../../figmaTransforms/boxShadow';
import { convertToFigmaColor } from '../../figmaTransforms/colors';
import { convertTypographyNumberToFigma } from '../../figmaTransforms/generic';
import convertOffsetToFigma from '../../figmaTransforms/offset';

function convertBoxShadowToFigmaEffect(value: TokenBoxshadowValue, baseFontSize: string): Effect {
  // Handle Glass effect which maps to BACKGROUND_BLUR
  if (value.type === 'glass') {
    return {
      type: convertBoxShadowTypeToFigma(value.type) as 'BACKGROUND_BLUR',
      radius: convertTypographyNumberToFigma((value.blur || 0).toString(), baseFontSize),
      visible: true,
    };
  }

  // Handle shadow effects (DROP_SHADOW, INNER_SHADOW) which have all properties
  const { color, opacity: a } = convertToFigmaColor(value.color!);
  const { r, g, b } = color;
  return {
    color: {
      r,
      g,
      b,
      a,
    },
    type: convertBoxShadowTypeToFigma(value.type) as 'DROP_SHADOW' | 'INNER_SHADOW',
    spread: convertTypographyNumberToFigma(value.spread!.toString(), baseFontSize),
    radius: convertTypographyNumberToFigma(value.blur!.toString(), baseFontSize),
    offset: convertOffsetToFigma(
      convertTypographyNumberToFigma(value.x!.toString(), baseFontSize),
      convertTypographyNumberToFigma(value.y!.toString(), baseFontSize),
    ),
    blendMode: (value.blendMode || 'NORMAL') as BlendMode,
    visible: true,
  };
}

export function effectStyleMatchesBoxShadowToken(
  effectStyle: EffectStyle | undefined,
  boxShadowToken: string | TokenBoxshadowValue | TokenBoxshadowValue[],
  baseFontSize: string,
) {
  if (effectStyle && typeof boxShadowToken !== 'string') {
    const boxShadowTokenArr = Array.isArray(boxShadowToken) ? boxShadowToken : [boxShadowToken];
    const styleEffects = effectStyle.effects;
    if (styleEffects.length === boxShadowTokenArr.length) {
      return styleEffects.every((styleEffect, idx) => {
        const tokenEffect = convertBoxShadowToFigmaEffect(boxShadowTokenArr[idx], baseFontSize);
        return isEffectEqual(styleEffect, tokenEffect);
      });
    }
  }
  return false;
}
