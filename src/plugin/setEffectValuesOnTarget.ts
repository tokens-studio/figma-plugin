/* eslint-disable no-param-reassign */
import { SingleBoxShadowToken } from '@/types/tokens';
import { convertBoxShadowTypeToFigma } from './figmaTransforms/boxShadow';
import { convertToFigmaColor } from './figmaTransforms/colors';
import { convertTypographyNumberToFigma } from './figmaTransforms/generic';
import convertOffsetToFigma from './figmaTransforms/offset';
import { getShadowBehindNodeFromEffect } from './figmaUtils/getShadowBehindNodeFromEffect';

export default function setEffectValuesOnTarget(
  // @TODO update this typing
  target: BaseNode | EffectStyle,
  token: Pick<SingleBoxShadowToken, 'value' | 'description'>,
  baseFontSize: string,
  key: 'effects' = 'effects',
) {
  try {
    const { description, value } = token;

    if (Array.isArray(value)) {
      const effectsArray = value.map((v, index) => {
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
          spread: convertTypographyNumberToFigma(v.spread.toString(), baseFontSize),
          radius: convertTypographyNumberToFigma(v.blur.toString(), baseFontSize),
          offset: convertOffsetToFigma(convertTypographyNumberToFigma(v.x.toString(), baseFontSize), convertTypographyNumberToFigma(v.y.toString(), baseFontSize)),
          blendMode: v.blendMode || 'NORMAL' as BlendMode,
          visible: true,
          ...v.type === 'dropShadow' && 'effects' in target ? { showShadowBehindNode: getShadowBehindNodeFromEffect(target.effects[index]) } : {},
        };
      }) as Effect[];

      if ('effects' in target && key === 'effects') target[key] = effectsArray.reverse();
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
            spread: convertTypographyNumberToFigma(value.spread.toString(), baseFontSize),
            radius: convertTypographyNumberToFigma(value.blur.toString(), baseFontSize),
            offset: convertOffsetToFigma(convertTypographyNumberToFigma(value.x.toString(), baseFontSize), convertTypographyNumberToFigma(value.y.toString(), baseFontSize)),
            blendMode: (value.blendMode || 'NORMAL') as BlendMode,
            visible: true,
            ...value.type === 'dropShadow' && 'effects' in target ? { showShadowBehindNode: getShadowBehindNodeFromEffect(target.effects[0]) } : {},
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
