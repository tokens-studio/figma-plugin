/* eslint-disable no-param-reassign */
import { SingleBoxShadowToken } from '@/types/tokens';
import { convertBoxShadowTypeToFigma } from './figmaTransforms/boxShadow';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertTypographyNumberToFigma } from './figmaTransforms/generic';
import convertOffsetToFigma from './figmaTransforms/offset';

export default function setEffectValuesOnTarget(
  // @TODO update this typing
  target: BaseNode | EffectStyle,
  token: Pick<SingleBoxShadowToken, 'value' | 'description'>,
  key: 'effects' = 'effects',
) {
  try {
    const { description, value } = token;

    if (Array.isArray(value)) {
      const effectsArray = value.map((v) => {
        const { color, opacity: a } = convertToFigmaColor(v.color);
        const { r, g, b } = color;
        return {
          color: {
            r,
            g,
            b,
            a,
          },
          type: convertBoxShadowTypeToFigma(v.type),
          spread: convertTypographyNumberToFigma(v.spread.toString()),
          radius: convertTypographyNumberToFigma(v.blur.toString()),
          offset: convertOffsetToFigma(convertTypographyNumberToFigma(v.x.toString()), convertTypographyNumberToFigma(v.y.toString())),
          blendMode: v.blendMode || 'NORMAL' as BlendMode,
          visible: true,
        };
      }) as Effect[];

      if ('effects' in target && key === 'effects') target[key] = effectsArray;
    } else if (typeof value !== 'string') {
      const { color, opacity: a } = convertToFigmaColor(value.color);
      const { r, g, b } = color;
      if ('effects' in target && key === 'effects') {
        target[key] = [
          {
            color: {
              r,
              g,
              b,
              a,
            },
            type: convertBoxShadowTypeToFigma(value.type),
            spread: convertTypographyNumberToFigma(value.spread.toString()),
            radius: convertTypographyNumberToFigma(value.blur.toString()),
            offset: convertOffsetToFigma(convertTypographyNumberToFigma(value.x.toString()), convertTypographyNumberToFigma(value.y.toString())),
            blendMode: (value.blendMode || 'NORMAL') as BlendMode,
            visible: true,
          },
        ];
      }
    }

    if (description && 'description' in target) {
      target.description = description;
    }
  } catch (e) {
    console.error('Error setting color', e);
  }
}
