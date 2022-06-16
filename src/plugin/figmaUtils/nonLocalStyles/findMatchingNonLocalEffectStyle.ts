import { isEffectEqual } from '@/utils/isEffectEqual';
import { TokenBoxshadowValue } from '@/types/values';

import { convertBoxShadowTypeToFigma } from '../../figmaTransforms/boxShadow';
import { convertToFigmaColor } from '../../figmaTransforms/colors';
import { convertTypographyNumberToFigma } from '../../figmaTransforms/generic';
import convertOffsetToFigma from '../../figmaTransforms/offset';

function convertBoxShadowToFigmaEffect(value: TokenBoxshadowValue): Effect {
  const { color, opacity: a } = convertToFigmaColor(value.color);
  const { r, g, b } = color;
  return {
    color: {
      r,
      g,
      b,
      a,
    },
    type: convertBoxShadowTypeToFigma(value.type),
    spread: convertTypographyNumberToFigma(value.spread.toString()),
    radius: convertTypographyNumberToFigma(value.blur.toString()),
    offset: convertOffsetToFigma(
      convertTypographyNumberToFigma(value.x.toString()),
      convertTypographyNumberToFigma(value.y.toString()),
    ),
    blendMode: (value.blendMode || 'NORMAL') as BlendMode,
    visible: true,
  };
}

export function findMatchingNonLocalEffectStyle(
  styleId: string,
  boxShadowToken: string | TokenBoxshadowValue | TokenBoxshadowValue[],
) {
  let matchingStyle: EffectStyle | undefined;

  if (styleId) {
    const nonLocalStyle = figma.getStyleById(styleId);
    if (typeof boxShadowToken !== 'string' && nonLocalStyle?.type === 'EFFECT') {
      const boxShadowTokenArr = Array.isArray(boxShadowToken) ? boxShadowToken : [boxShadowToken];
      const styleEffects = (nonLocalStyle as EffectStyle).effects;
      if (styleEffects.length === boxShadowTokenArr.length) {
        if (
          styleEffects.every((styleEffect, idx) => {
            const tokenEffect = convertBoxShadowToFigmaEffect(boxShadowTokenArr[idx]);
            return isEffectEqual(styleEffect, tokenEffect);
          })
        ) {
          matchingStyle = nonLocalStyle as EffectStyle;
        }
      }
    }
  }

  return matchingStyle;
}
